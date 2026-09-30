import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getFirebaseAdminAuth } from 'firebase-admin/auth';
import User, { EMPLOYMENT_TYPES, ROLES } from './models/User.js';
import LeaveRequest, { LEAVE_CATEGORIES } from './models/LeaveRequest.js';
import Holiday from './models/Holiday.js';
import Attendance from './models/Attendance.js';
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, hashToken, issueTokens, safeUser, setAuthCookies } from './auth.js';

const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
const signInLimiter = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts for this method. Wait 15 minutes and try again.' }
});
const signupLimiter = signInLimiter();
const passwordLoginLimiter = signInLimiter();
const firebaseLoginLimiter = signInLimiter();
const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many session refresh requests. Try again later.' }
});

async function requireAccess(req, res, next) {
  const token = req.cookies[ACCESS_COOKIE];
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  let claims;
  try { claims = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { issuer: 'attendance-api', audience: 'attendance-app' }); }
  catch { return res.status(401).json({ message: 'Session expired. Refresh your session or sign in again.' }); }
  try {
    const user = await User.findById(claims.sub).select('role organizationId isActive');
    if (!user?.isActive) return res.status(401).json({ message: 'Account is unavailable.' });
    req.auth = { ...claims, role: user.role, organizationId: user.organizationId?.toString() || null };
    return next();
  } catch (error) { return next(error); }
}
function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.auth?.role) ? next() : res.status(403).json({ message: 'You do not have permission to do this.' });
}
function validEmail(email) { return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }
function issueSession(res, user) {
  const tokens = issueTokens(user);
  user.refreshTokenHash = tokens.refreshHash;
  return user.save().then(() => setAuthCookies(res, tokens.access, tokens.refresh));
}
function getFirebaseVerifier() {
  if (!process.env.FIREBASE_PROJECT_ID) throw new Error('Firebase Google sign-in is not configured on the server.');
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    let serviceAccount;
    try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); }
    catch { throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.'); }
    if (serviceAccount.project_id !== process.env.FIREBASE_PROJECT_ID) {
      const error = new Error('Firebase service-account project does not match FIREBASE_PROJECT_ID.');
      error.code = 'FIREBASE_PROJECT_MISMATCH';
      throw error;
    }
    credential = cert(serviceAccount);
  } else credential = applicationDefault();
  const app = getApps().find((entry) => entry.name === 'attendance-firebase') || initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID }, 'attendance-firebase');
  return getFirebaseAdminAuth(app);
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/signup', signupLimiter, async (req, res, next) => {
  try {
    const { name, email, password, department = '' } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ message: 'Enter a name between 2 and 100 characters.' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) return res.status(400).json({ message: 'Password must be 10–128 characters.' });
    if (typeof department !== 'string' || department.length > 80) return res.status(400).json({ message: 'Department must be 80 characters or fewer.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), department: department.trim(), role: 'Employee' });
    await issueSession(res, user);
    return res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    return next(error);
  }
});
app.post('/api/auth/login', passwordLoginLimiter, async (req, res, next) => {
  try {
    const { email: identifier, password } = req.body || {};
    const isEmail = validEmail(identifier);
    const isEmployeeCode = typeof identifier === 'string' && /^[A-Za-z0-9-]{2,32}$/.test(identifier.trim());
    if ((!isEmail && !isEmployeeCode) || typeof password !== 'string') return res.status(400).json({ message: 'Enter your work email or employee ID, and password.' });
    const normalizedIdentifier = identifier.trim();
    const user = await User.findOne({ $or: [
      ...(isEmail ? [{ email: normalizedIdentifier.toLowerCase() }] : []),
      ...(isEmployeeCode ? [{ employeeCode: normalizedIdentifier.toUpperCase() }] : [])
    ] }).select('+passwordHash');
    if (!user || !user.isActive || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    await issueSession(res, user);
    return res.json({ user: safeUser(user) });
  } catch (error) { return next(error); }
});
app.post('/api/auth/firebase', firebaseLoginLimiter, async (req, res, next) => {
  try {
    const { idToken, name = '' } = req.body || {};
    if (typeof idToken !== 'string' || idToken.length < 100 || idToken.length > 10000) return res.status(400).json({ message: 'A valid Firebase ID token is required.' });
    let verifier;
    try { verifier = getFirebaseVerifier(); }
    catch (error) {
      console.error('Firebase Admin setup is unavailable:', error.code || error.message);
      const message = error.code === 'FIREBASE_PROJECT_MISMATCH'
        ? 'The Firebase service account and FIREBASE_PROJECT_ID on the API must belong to the same Firebase project.'
        : 'The API could not load Firebase Admin credentials. Add a valid FIREBASE_SERVICE_ACCOUNT_JSON secret to Render and redeploy.';
      return res.status(503).json({ message });
    }
    let identity;
    try { identity = await verifier.verifyIdToken(idToken, true); }
    catch (error) {
      console.warn('Firebase rejected a sign-in token:', error.code || error.message);
      const code = typeof error.code === 'string' ? error.code : 'unknown';
      const credentialError = code === 'app/invalid-credential' || code === 'auth/invalid-credential';
      const message = credentialError
        ? 'The API’s Firebase Admin credential was rejected. Replace FIREBASE_SERVICE_ACCOUNT_JSON in Render with a valid key from the same Firebase project, then redeploy.'
        : `Firebase rejected this sign-in token (${code}). Ensure VITE_FIREBASE_PROJECT_ID on Vercel matches FIREBASE_PROJECT_ID on Render.`;
      return res.status(401).json({ message, code });
    }
    const provider = identity.firebase?.sign_in_provider;
    const isGoogle = provider === 'google.com' && identity.email && identity.email_verified === true;
    const phoneNumber = provider === 'phone' ? identity.phone_number : null;
    const suppliedName = typeof name === 'string' ? name.trim() : '';
    if (!isGoogle && !phoneNumber) return res.status(403).json({ message: 'Use a verified Google account or complete mobile phone verification.' });
    if (phoneNumber && !/^\+[1-9]\d{7,14}$/.test(phoneNumber)) return res.status(403).json({ message: 'Firebase returned an invalid verified phone number.' });
    const email = isGoogle ? identity.email.trim().toLowerCase() : undefined;
    const alternatives = [{ firebaseUid: identity.uid }];
    if (email) alternatives.push({ email });
    if (phoneNumber) alternatives.push({ phoneNumber });
    let user = await User.findOne({ $or: alternatives }).select('+firebaseUid');
    if (!user && phoneNumber && (suppliedName.length < 2 || suppliedName.length > 100)) return res.status(400).json({ message: 'Enter your name to finish setting up your phone account.' });
    if (user?.firebaseUid && user.firebaseUid !== identity.uid) return res.status(409).json({ message: 'This account identifier is already linked to another Firebase account.' });
    if (!user) {
      const account = {
        name: identity.name?.trim() || (email ? email.split('@')[0] : suppliedName),
        firebaseUid: identity.uid,
        role: 'Employee'
      };
      if (email) account.email = email;
      if (phoneNumber) account.phoneNumber = phoneNumber;
      user = new User(account);
    } else if (!user.firebaseUid) {
      // Firebase verifies the Google email or phone before allowing the account to be linked.
      user.firebaseUid = identity.uid;
    }
    if (phoneNumber && !user.phoneNumber) user.phoneNumber = phoneNumber;
    if (!user.isActive) return res.status(401).json({ message: 'This account is unavailable.' });
    await issueSession(res, user);
    return res.json({ user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'This email or phone is already linked to another account.' });
    return next(error);
  }
});
app.post('/api/auth/refresh', refreshLimiter, async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) { clearAuthCookies(res); return res.status(401).json({ message: 'Session expired. Sign in again.' }); }
    let claims;
    try { claims = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { issuer: 'attendance-api', audience: 'attendance-app' }); }
    catch { clearAuthCookies(res); return res.status(401).json({ message: 'Session expired. Sign in again.' }); }
    const user = await User.findById(claims.sub).select('+refreshTokenHash +passwordHash +firebaseUid');
    if (!user || !user.isActive || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
      if (user) { user.refreshTokenHash = null; await user.save(); }
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Session is no longer valid. Sign in again.' });
    }
    await issueSession(res, user);
    return res.json({ user: safeUser(user) });
  } catch (error) { return next(error); }
});
app.post('/api/auth/session', refreshLimiter, async (req, res, next) => {
  try {
    const accessToken = req.cookies[ACCESS_COOKIE];
    if (accessToken) {
      let accessClaims;
      try { accessClaims = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, { issuer: 'attendance-api', audience: 'attendance-app' }); }
      catch { /* An expired access cookie can still have a valid refresh cookie. */ }
      if (accessClaims?.sub) {
        const activeUser = await User.findById(accessClaims.sub);
        if (activeUser?.isActive) return res.json({ user: safeUser(activeUser) });
      }
    }

    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      clearAuthCookies(res);
      return res.json({ user: null });
    }
    let refreshClaims;
    try { refreshClaims = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { issuer: 'attendance-api', audience: 'attendance-app' }); }
    catch {
      clearAuthCookies(res);
      return res.json({ user: null });
    }
    const user = await User.findById(refreshClaims.sub).select('+refreshTokenHash +passwordHash +firebaseUid');
    if (!user?.isActive || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
      if (user) { user.refreshTokenHash = null; await user.save(); }
      clearAuthCookies(res);
      return res.json({ user: null });
    }
    await issueSession(res, user);
    return res.json({ user: safeUser(user) });
  } catch (error) { return next(error); }
});
app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      try {
        const claims = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { issuer: 'attendance-api', audience: 'attendance-app' });
        await User.findByIdAndUpdate(claims.sub, { $set: { refreshTokenHash: null } });
      } catch { /* An expired token is still removed from the browser. */ }
    }
    clearAuthCookies(res);
    return res.status(204).end();
  } catch (error) { return next(error); }
});
app.get('/api/auth/me', requireAccess, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    return user?.isActive ? res.json({ user: safeUser(user) }) : res.status(401).json({ message: 'Account is unavailable.' });
  } catch (error) { return next(error); }
});
app.patch('/api/profile', requireAccess, async (req, res, next) => {
  try {
    const { name, designation, contactPhone, avatarData } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
    }
    if (designation !== undefined && (typeof designation !== 'string' || designation.trim().length > 80)) {
      return res.status(400).json({ message: 'Designation must be 80 characters or fewer.' });
    }
    if (contactPhone !== undefined && (typeof contactPhone !== 'string' || contactPhone.trim().length > 30)) {
      return res.status(400).json({ message: 'Contact phone must be 30 characters or fewer.' });
    }
    if (avatarData !== undefined && avatarData !== null) {
      const validImage = typeof avatarData === 'string' && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatarData);
      if (avatarData !== '' && (!validImage || avatarData.length > 1000000)) {
        return res.status(400).json({ message: 'Profile photos must be JPEG, PNG or WebP and smaller than 750 KB after compression.' });
      }
    }
    const user = await User.findById(req.auth.sub).select('+avatarData +passwordHash +firebaseUid');
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account is unavailable.' });
    user.name = name.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (contactPhone !== undefined) user.contactPhone = contactPhone.trim();
    if (avatarData !== undefined) {
      user.avatarData = avatarData || null;
      user.avatarUpdatedAt = avatarData ? new Date() : null;
    }
    await user.save();
    return res.json({ user: safeUser(user) });
  } catch (error) { return next(error); }
});
app.get('/api/profile/avatar/:id', requireAccess, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+avatarData avatarUpdatedAt organizationId managerId');
    if (!user) return res.status(404).end();
    const isSelf = user._id.toString() === req.auth.sub;
    const isApplicationAdmin = req.auth.role === 'Application Admin';
    const isOrganizationAdmin = req.auth.role === 'Organization Admin' && user.organizationId?.toString() === req.auth.organizationId;
    const isDirectManager = req.auth.role === 'Manager' && user.managerId?.toString() === req.auth.sub;
    if (!isSelf && !isApplicationAdmin && !isOrganizationAdmin && !isDirectManager) return res.status(403).end();
    if (!user?.avatarData) return res.status(404).end();
    const match = user.avatarData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) return res.status(404).end();
    res.set({ 'Content-Type': match[1], 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
    return res.send(Buffer.from(match[2], 'base64'));
  } catch (error) { return next(error); }
});
app.get('/api/admin/users', requireAccess, allowRoles('Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    const filter = req.auth.role === 'Organization Admin' ? { organizationId: req.auth.organizationId } : {};
    const users = await User.find(filter).populate('managerId', 'name designation').sort({ createdAt: -1 }).limit(200);
    return res.json({ users: users.map(safeUser) });
  } catch (error) { return next(error); }
});

app.patch('/api/admin/users/:id/work-profile', requireAccess, allowRoles('Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'User ID is invalid.' });
    const { designation, employmentType, employeeCode, managerId } = req.body || {};
    if (designation !== undefined && (typeof designation !== 'string' || designation.trim().length > 80)) return res.status(400).json({ message: 'Position must be 80 characters or fewer.' });
    if (employmentType !== undefined && !EMPLOYMENT_TYPES.includes(employmentType)) return res.status(400).json({ message: 'Choose a valid employment type.' });
    if (employeeCode !== undefined && (typeof employeeCode !== 'string' || employeeCode.trim().length > 32)) return res.status(400).json({ message: 'Employee code must be 32 characters or fewer.' });
    const orgScope = req.auth.role === 'Organization Admin' ? { organizationId: req.auth.organizationId } : {};
    const user = await User.findOne({ _id: req.params.id, ...orgScope });
    if (!user) return res.status(404).json({ message: 'User not found in your organization.' });
    if (designation !== undefined) user.designation = designation.trim();
    if (employmentType !== undefined) user.employmentType = employmentType;
    if (employeeCode !== undefined) user.employeeCode = employeeCode.trim().toUpperCase() || undefined;
    if (managerId !== undefined) {
      if (!managerId) user.managerId = null;
      else {
        if (!mongoose.Types.ObjectId.isValid(managerId) || managerId === user.id) return res.status(400).json({ message: 'Choose a different valid reporting manager.' });
        const manager = await User.findOne({ _id: managerId, role: { $in: ['Manager', 'Organization Admin', 'Application Admin'] }, isActive: true, ...orgScope });
        if (!manager) return res.status(400).json({ message: 'Reporting manager must be an active manager in your organization.' });
        user.managerId = manager._id;
      }
    }
    await user.save();
    await user.populate('managerId', 'name designation');
    return res.json({ user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'That employee code is already in use.' });
    return next(error);
  }
});

function validISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function attachAvatarUrl(user) {
  if (user) user.avatarUrl = user.avatarUpdatedAt ? `/api/profile/avatar/${user._id}?v=${user.avatarUpdatedAt.getTime()}` : null;
  return user;
}
app.get('/api/leaves', requireAccess, async (req, res, next) => {
  try {
    let filter;
    if (req.auth.role === 'Employee') filter = { employeeId: req.auth.sub };
    else if (req.auth.role === 'Manager') filter = { approverId: req.auth.sub };
    else if (req.auth.role === 'Organization Admin') filter = { organizationId: req.auth.organizationId };
    else filter = {};
    const requests = await LeaveRequest.find(filter).populate('employeeId', 'name designation department employeeCode avatarUpdatedAt').populate('approverId', 'name designation').populate('decisionBy', 'name').sort({ createdAt: -1 }).limit(200).lean();
    for (const request of requests) attachAvatarUrl(request.employeeId);
    return res.json({ requests });
  } catch (error) { return next(error); }
});
app.post('/api/leaves', requireAccess, async (req, res, next) => {
  try {
    const { category, startDate, endDate, reason } = req.body || {};
    if (!LEAVE_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Choose a valid leave category.' });
    if (!validISODate(startDate) || !validISODate(endDate) || endDate < startDate) return res.status(400).json({ message: 'Enter valid dates, with the end date on or after the start date.' });
    if (typeof reason !== 'string' || reason.trim().length < 3 || reason.trim().length > 1000) return res.status(400).json({ message: 'Reason must be between 3 and 1000 characters.' });
    const employee = await User.findById(req.auth.sub).populate('managerId', 'name designation role isActive');
    if (!employee?.managerId || !employee.managerId.isActive || !['Manager', 'Organization Admin', 'Application Admin'].includes(employee.managerId.role)) return res.status(409).json({ message: 'Your account does not have an active reporting manager assigned. Ask your administrator to assign one before submitting leave.' });
    const request = await LeaveRequest.create({ employeeId: employee._id, approverId: employee.managerId._id, organizationId: employee.organizationId, category, startDate, endDate, reason: reason.trim() });
    await request.populate('employeeId', 'name designation department employeeCode avatarUpdatedAt');
    attachAvatarUrl(request.employeeId);
    await request.populate('approverId', 'name designation');
    return res.status(201).json({ request });
  } catch (error) { return next(error); }
});
app.patch('/api/leaves/:id/decision', requireAccess, allowRoles('Manager', 'Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Request ID is invalid.' });
    const { status, note = '' } = req.body || {};
    if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Choose Approved or Rejected.' });
    if (typeof note !== 'string' || note.length > 500) return res.status(400).json({ message: 'Decision note must be 500 characters or fewer.' });
    const filter = { _id: req.params.id };
    if (req.auth.role === 'Manager') filter.approverId = req.auth.sub;
    if (req.auth.role === 'Organization Admin') filter.organizationId = req.auth.organizationId;
    const request = await LeaveRequest.findOne(filter);
    if (!request) return res.status(404).json({ message: 'Request not found or you are not its approver.' });
    if (request.status !== 'Pending') return res.status(409).json({ message: 'This request has already been reviewed.' });
    request.status = status;
    request.decisionBy = req.auth.sub;
    request.decisionAt = new Date();
    request.decisionNote = note.trim();
    await request.save();
    await request.populate('employeeId', 'name designation department employeeCode avatarUpdatedAt');
    await request.populate('approverId', 'name designation');
    await request.populate('decisionBy', 'name');
    const responseRequest = request.toObject();
    attachAvatarUrl(responseRequest.employeeId);
    return res.json({ request: responseRequest });
  } catch (error) { return next(error); }
});

app.get('/api/holidays', requireAccess, async (req, res, next) => {
  try {
    const filter = req.auth.role === 'Application Admin' ? {} : { $or: [{ organizationId: req.auth.organizationId || null }, { organizationId: null }] };
    const holidays = await Holiday.find(filter).sort({ date: 1 }).limit(500).lean();
    return res.json({ holidays });
  } catch (error) { return next(error); }
});
app.post('/api/holidays', requireAccess, allowRoles('Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    const { name, date, description = '' } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !validISODate(date)) return res.status(400).json({ message: 'Enter a holiday name and a valid date.' });
    if (typeof description !== 'string' || description.length > 300) return res.status(400).json({ message: 'Description must be 300 characters or fewer.' });
    const holiday = await Holiday.create({ name: name.trim(), date, description: description.trim(), organizationId: req.auth.organizationId || null, createdBy: req.auth.sub });
    return res.status(201).json({ holiday });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'That holiday is already on the calendar.' });
    return next(error);
  }
});
app.delete('/api/holidays/:id', requireAccess, allowRoles('Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Holiday ID is invalid.' });
    const filter = { _id: req.params.id, ...(req.auth.role === 'Organization Admin' ? { organizationId: req.auth.organizationId } : {}) };
    const holiday = await Holiday.findOneAndDelete(filter);
    return holiday ? res.status(204).end() : res.status(404).json({ message: 'Holiday not found in your organization.' });
  } catch (error) { return next(error); }
});

function attendanceWorkDate() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.ATTENDANCE_TIME_ZONE || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function localMinuteOfDay(now = new Date()) {
  const timeZone = process.env.ATTENDANCE_TIME_ZONE || 'Asia/Kolkata';
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}
function minuteOfDay(value) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}
function attendancePunctualityStatus(now = new Date(), start = process.env.ATTENDANCE_SHIFT_START || '09:30', end = process.env.ATTENDANCE_SHIFT_END || '18:00', grace = Number(process.env.ATTENDANCE_GRACE_MINUTES || 15)) {
  const currentMinute = localMinuteOfDay(now);
  const [startHour, startMinute] = start.split(':').map(Number);
  const shiftStartMinute = startHour * 60 + startMinute;
  const shiftEndMinute = minuteOfDay(end);
  let elapsed;
  if (shiftEndMinute <= shiftStartMinute) {
    if (currentMinute >= shiftStartMinute) elapsed = currentMinute - shiftStartMinute;
    else if (currentMinute <= shiftEndMinute) elapsed = 1440 - shiftStartMinute + currentMinute;
    else return 'On time'; // Early arrival before the overnight shift starts.
  } else {
    if (currentMinute <= shiftStartMinute) return 'On time';
    elapsed = currentMinute - shiftStartMinute;
  }
  if (elapsed === 0) return 'On time';
  if (elapsed <= grace) return 'Slightly late';
  return 'Late';
}
function attendanceShiftStatus(now, start, end, grace) {
  const currentMinute = localMinuteOfDay(now);
  const shiftStartMinute = minuteOfDay(start);
  const shiftEndMinute = minuteOfDay(end);
  const overnight = shiftEndMinute <= shiftStartMinute;
  if (!overnight) {
    if (currentMinute < shiftStartMinute) return 'Before shift';
    if (currentMinute >= shiftEndMinute) return 'After shift';
  } else if (currentMinute > shiftEndMinute && currentMinute < shiftStartMinute) {
    return 'Before shift';
  }
  return attendancePunctualityStatus(now, start, end, grace);
}
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Monday through Friday; Saturday and Sunday are opt-in per roster.
function validWorkDays(value) {
  return Array.isArray(value) && value.length > 0 && value.length <= 7 && value.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) && new Set(value).size === value.length;
}
function effectiveShift(user) {
  const manager = user.role === 'Manager' ? user : user.managerId;
  const hasPersonalRoster = Boolean(user.personalShiftStartTime && user.personalShiftEndTime);
  const hasManagerRoster = Boolean(manager?.teamShiftStart && manager?.teamShiftEnd);
  const workDays = Array.isArray(user.personalWorkDays) && user.personalWorkDays.length
    ? user.personalWorkDays
    : Array.isArray(manager?.teamWorkDays) && manager.teamWorkDays.length
      ? manager.teamWorkDays
      : DEFAULT_WORK_DAYS;
  return {
    shiftStartTime: user.personalShiftStartTime || manager?.teamShiftStart || process.env.ATTENDANCE_SHIFT_START || '09:30',
    shiftEndTime: user.personalShiftEndTime || manager?.teamShiftEnd || process.env.ATTENDANCE_SHIFT_END || '18:00',
    graceMinutes: user.personalShiftGraceMinutes ?? manager?.teamGraceMinutes ?? Number(process.env.ATTENDANCE_GRACE_MINUTES || 15),
    workDays,
    shiftSource: hasPersonalRoster ? 'Individual roster' : hasManagerRoster ? 'Manager team roster' : 'Organization default'
  };
}
app.get('/api/manager/shift-settings', requireAccess, allowRoles('Manager'), async (req, res, next) => {
  try {
    const manager = await User.findById(req.auth.sub).select('teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays');
    if (!manager) return res.status(404).json({ message: 'Manager account was not found.' });
    return res.json({ shiftStartTime: manager.teamShiftStart || process.env.ATTENDANCE_SHIFT_START || '09:30', shiftEndTime: manager.teamShiftEnd || process.env.ATTENDANCE_SHIFT_END || '18:00', graceMinutes: manager.teamGraceMinutes ?? Number(process.env.ATTENDANCE_GRACE_MINUTES || 15), workDays: manager.teamWorkDays?.length ? manager.teamWorkDays : DEFAULT_WORK_DAYS });
  } catch (error) { return next(error); }
});
app.patch('/api/manager/shift-settings', requireAccess, allowRoles('Manager'), async (req, res, next) => {
  try {
    const { shiftStartTime, shiftEndTime, graceMinutes, workDays } = req.body || {};
    if (typeof shiftStartTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftStartTime)) return res.status(400).json({ message: 'Choose a valid shift start time.' });
    if (typeof shiftEndTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftEndTime) || shiftEndTime === shiftStartTime) return res.status(400).json({ message: 'Choose a valid shift end time that differs from its start. End times earlier than start are treated as overnight shifts.' });
    if (!Number.isInteger(graceMinutes) || graceMinutes < 0 || graceMinutes > 180) return res.status(400).json({ message: 'Grace period must be between 0 and 180 minutes.' });
    if (!validWorkDays(workDays)) return res.status(400).json({ message: 'Choose at least one valid team workday.' });
    const manager = await User.findByIdAndUpdate(req.auth.sub, { teamShiftStart: shiftStartTime, teamShiftEnd: shiftEndTime, teamGraceMinutes: graceMinutes, teamWorkDays: workDays }, { new: true, runValidators: true }).select('teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays');
    return manager ? res.json({ shiftStartTime: manager.teamShiftStart, shiftEndTime: manager.teamShiftEnd, graceMinutes: manager.teamGraceMinutes, workDays: manager.teamWorkDays }) : res.status(404).json({ message: 'Manager account was not found.' });
  } catch (error) { return next(error); }
});
app.get('/api/manager/team-shifts', requireAccess, allowRoles('Manager'), async (req, res, next) => {
  try {
    const employees = await User.find({ managerId: req.auth.sub, isActive: true }).select('name email designation department employeeCode avatarUpdatedAt personalShiftStartTime personalShiftEndTime personalShiftGraceMinutes personalWorkDays').sort({ name: 1 }).limit(500).lean();
    for (const employee of employees) attachAvatarUrl(employee);
    return res.json({ employees });
  } catch (error) { return next(error); }
});
app.patch('/api/manager/team-shifts/:id', requireAccess, allowRoles('Manager'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Employee ID is invalid.' });
    const { shiftStartTime, shiftEndTime, graceMinutes, workDays } = req.body || {};
    if (typeof shiftStartTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftStartTime)) return res.status(400).json({ message: 'Choose a valid employee shift start time.' });
    if (typeof shiftEndTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(shiftEndTime) || shiftEndTime === shiftStartTime) return res.status(400).json({ message: 'Choose a valid employee shift end time that differs from its start.' });
    if (!Number.isInteger(graceMinutes) || graceMinutes < 0 || graceMinutes > 180) return res.status(400).json({ message: 'Grace period must be between 0 and 180 minutes.' });
    if (!validWorkDays(workDays)) return res.status(400).json({ message: 'Choose at least one valid employee workday.' });
    const employee = await User.findOneAndUpdate({ _id: req.params.id, managerId: req.auth.sub, isActive: true }, { personalShiftStartTime: shiftStartTime, personalShiftEndTime: shiftEndTime, personalShiftGraceMinutes: graceMinutes, personalWorkDays: workDays }, { new: true, runValidators: true }).select('name designation department employeeCode personalShiftStartTime personalShiftEndTime personalShiftGraceMinutes personalWorkDays').lean();
    return employee ? res.json({ employee }) : res.status(404).json({ message: 'That employee is not assigned to your team.' });
  } catch (error) { return next(error); }
});
app.get('/api/attendance', requireAccess, async (req, res, next) => {
  try {
    let filter;
    if (req.auth.role === 'Employee') filter = { employeeId: req.auth.sub };
    else if (req.auth.role === 'Manager') {
      const reports = await User.find({ managerId: req.auth.sub, isActive: true }).select('_id').limit(1000).lean();
      filter = { employeeId: { $in: [req.auth.sub, ...reports.map((report) => report._id)] } };
    } else if (req.auth.role === 'Organization Admin') {
      filter = { $or: [{ organizationId: req.auth.organizationId || null }, { employeeId: req.auth.sub }] };
    } else filter = {};
    const employee = await User.findById(req.auth.sub).populate('managerId', 'teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays').select('role managerId personalShiftStartTime personalShiftEndTime personalShiftGraceMinutes personalWorkDays teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays');
    const { shiftStartTime, shiftEndTime, graceMinutes, workDays, shiftSource } = effectiveShift(employee || {});
    const [records, today, active] = await Promise.all([
      Attendance.find(filter).populate('employeeId', 'name designation department employeeCode avatarUpdatedAt').sort({ checkInAt: -1 }).limit(200).lean(),
      Attendance.findOne({ employeeId: req.auth.sub, workDate: attendanceWorkDate() }).lean(),
      Attendance.findOne({ employeeId: req.auth.sub, checkOutAt: null }).sort({ checkInAt: -1 }).lean()
    ]);
    for (const record of records) attachAvatarUrl(record.employeeId);
    return res.json({ records, today, active, workDate: attendanceWorkDate(), timeZone: process.env.ATTENDANCE_TIME_ZONE || 'Asia/Kolkata', shiftStartTime, shiftEndTime, graceMinutes, workDays, shiftSource, punctuality: active?.punctualityStatus || today?.punctualityStatus || attendanceShiftStatus(new Date(), shiftStartTime, shiftEndTime, graceMinutes) });
  } catch (error) { return next(error); }
});
app.post('/api/attendance/check-in', requireAccess, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub).populate('managerId', 'teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays').select('organizationId isActive role managerId teamShiftStart teamShiftEnd teamGraceMinutes teamWorkDays personalShiftStartTime personalShiftEndTime personalShiftGraceMinutes personalWorkDays');
    if (!user?.isActive) return res.status(401).json({ message: 'Account is unavailable.' });
    const openRecord = await Attendance.findOne({ employeeId: user._id, checkOutAt: null }).select('_id').lean();
    if (openRecord) return res.status(409).json({ message: 'You are already punched in. Punch out before starting another session.' });
    const checkInAt = new Date();
    const { shiftStartTime: scheduledStartTime, shiftEndTime: scheduledEndTime, graceMinutes, workDays: scheduledWorkDays } = effectiveShift(user);
    const record = await Attendance.create({ employeeId: user._id, organizationId: user.organizationId, workDate: attendanceWorkDate(), checkInAt, scheduledStartTime, scheduledEndTime, scheduledWorkDays, graceMinutes, punctualityStatus: attendancePunctualityStatus(checkInAt, scheduledStartTime, scheduledEndTime, graceMinutes) });
    return res.status(201).json({ record });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'You already checked in for today.' });
    return next(error);
  }
});
app.post('/api/attendance/check-out', requireAccess, async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ employeeId: req.auth.sub, checkOutAt: null }).sort({ checkInAt: -1 });
    if (!record) return res.status(409).json({ message: 'There is no open check-in to check out from.' });
    record.checkOutAt = new Date();
    if (record.checkOutAt <= record.checkInAt) return res.status(409).json({ message: 'Check-out time must be later than check-in.' });
    await record.save();
    return res.json({ record });
  } catch (error) { return next(error); }
});
app.patch('/api/admin/users/:id/role', requireAccess, allowRoles('Organization Admin', 'Application Admin'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'User ID is invalid.' });
    const { role } = req.body || {};
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Choose a valid role.' });
    if (req.auth.role !== 'Application Admin' && role !== 'Employee' && role !== 'Manager') return res.status(403).json({ message: 'Organization admins can assign Employee or Manager roles only.' });
    const filter = { _id: req.params.id, ...(req.auth.role === 'Organization Admin' ? { organizationId: req.auth.organizationId } : {}) };
    const user = await User.findOneAndUpdate(filter, { role }, { new: true, runValidators: true });
    return user ? res.json({ user: safeUser(user) }) : res.status(404).json({ message: 'User not found in your organization.' });
  } catch (error) { return next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors || {}).map((entry) => entry.message).filter(Boolean);
    return res.status(400).json({ message: details.length ? `Changes were not saved: ${details.join(' ')}` : 'Some profile fields are invalid. Review the values and try again.' });
  }
  if (error?.name === 'CastError') return res.status(400).json({ message: 'A selected account or reporting manager is invalid. Reload the staff list and try again.' });
  if (error?.code === 11000) return res.status(409).json({ message: 'That email or employee code is already assigned to another account.' });
  return res.status(500).json({ message: 'The server could not complete the request.' });
});

async function start() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD || !process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('Required server settings are missing. Copy .env.example to .env in the project root, then set MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET.');
  }
  if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) throw new Error('JWT secrets must each contain at least 32 characters.');
  try { new Intl.DateTimeFormat('en-CA', { timeZone: process.env.ATTENDANCE_TIME_ZONE || 'Asia/Kolkata' }); }
  catch { throw new Error('ATTENDANCE_TIME_ZONE must be a valid IANA time zone, for example Asia/Kolkata.'); }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(process.env.ATTENDANCE_SHIFT_START || '09:30')) throw new Error('ATTENDANCE_SHIFT_START must use 24-hour time such as 09:30.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(process.env.ATTENDANCE_SHIFT_END || '18:00') || (process.env.ATTENDANCE_SHIFT_END || '18:00') === (process.env.ATTENDANCE_SHIFT_START || '09:30')) throw new Error('ATTENDANCE_SHIFT_END must be a valid time different from ATTENDANCE_SHIFT_START. An earlier end time means the shift ends the next day.');
  const attendanceGraceMinutes = Number(process.env.ATTENDANCE_GRACE_MINUTES || 15);
  if (!Number.isInteger(attendanceGraceMinutes) || attendanceGraceMinutes < 0 || attendanceGraceMinutes > 180) throw new Error('ATTENDANCE_GRACE_MINUTES must be a number from 0 to 180.');
  await mongoose.connect(process.env.MONGODB_URI, {
    user: process.env.MONGODB_USERNAME,
    pass: process.env.MONGODB_PASSWORD,
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin'
  });
  try { await User.createCollection(); }
  catch (error) { if (error?.code !== 48) throw error; }
  const existingIndexes = await User.collection.indexes();
  const oldEmailIndex = existingIndexes.find((index) => index.key?.email === 1 && index.unique && !index.sparse);
  if (oldEmailIndex) await User.collection.dropIndex(oldEmailIndex.name);
  await User.createIndexes();
  for (const model of [LeaveRequest, Holiday, Attendance]) {
    try { await model.createCollection(); } catch (error) { if (error?.code !== 48) throw error; }
    await model.createIndexes();
  }
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (adminEmail && adminPassword && !(await User.exists({ role: 'Application Admin' }))) {
    await User.create({ name: process.env.BOOTSTRAP_ADMIN_NAME || 'Application Administrator', email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: 'Application Admin' });
    console.log('Created the initial Application Admin from bootstrap environment variables. Remove those variables after setup.');
  }
  const managerEmail = process.env.BOOTSTRAP_MANAGER_EMAIL?.trim().toLowerCase();
  const managerPassword = process.env.BOOTSTRAP_MANAGER_PASSWORD;
  if (Boolean(managerEmail) !== Boolean(managerPassword)) throw new Error('Set both BOOTSTRAP_MANAGER_EMAIL and BOOTSTRAP_MANAGER_PASSWORD, or remove both.');
  if (managerEmail && (!validEmail(managerEmail) || managerPassword.length < 10 || managerPassword.length > 128)) throw new Error('Bootstrap manager email must be valid and its password must be 10–128 characters.');
  if (managerEmail && managerPassword && !await User.exists({ email: managerEmail })) {
    const managerCode = process.env.BOOTSTRAP_MANAGER_EMPLOYEE_CODE?.trim().toUpperCase();
    await User.create({ name: process.env.BOOTSTRAP_MANAGER_NAME || 'Manager', email: managerEmail, employeeCode: managerCode || undefined, passwordHash: await bcrypt.hash(managerPassword, 12), role: 'Manager' });
    console.log('Created the initial Manager from bootstrap environment variables. Remove those variables after setup.');
  }
  app.listen(port, () => console.log(`Attendance API listening on http://localhost:${port}`));
}
start().catch((error) => { console.error(error.message); process.exit(1); });
