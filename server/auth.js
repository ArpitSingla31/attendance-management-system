import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export const ACCESS_COOKIE = 'attendance_access';
export const REFRESH_COOKIE = 'attendance_refresh';
const secure = process.env.NODE_ENV === 'production';
const cookieBase = { httpOnly: true, secure, sameSite: 'lax', path: '/' };
export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' });
}
export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, cookieBase);
  res.clearCookie(REFRESH_COOKIE, { ...cookieBase, path: '/api/auth' });
}
export function issueTokens(user) {
  const claims = { sub: user.id, role: user.role, organizationId: user.organizationId?.toString() || null };
  const access = jwt.sign(claims, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m', issuer: 'attendance-api', audience: 'attendance-app' });
  const refresh = jwt.sign({ sub: user.id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d', issuer: 'attendance-api', audience: 'attendance-app' });
  return { access, refresh, refreshHash: hashToken(refresh) };
}
export function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
export function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    initials: user.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    email: user.email || null,
    phoneNumber: user.phoneNumber || null,
    contactPhone: user.contactPhone || '',
    managerId: user.managerId?._id?.toString() || user.managerId?.toString() || null,
    managerName: user.managerId?.name || null,
    employmentType: user.employmentType || 'Full-time',
    employeeCode: user.employeeCode || null,
    avatarUrl: user.avatarUpdatedAt ? `/api/profile/avatar/${user.id}?v=${user.avatarUpdatedAt.getTime()}` : null,
    role: user.role,
    department: user.department,
    designation: user.designation,
    personalShiftStartTime: user.personalShiftStartTime || null,
    personalShiftEndTime: user.personalShiftEndTime || null,
    personalShiftGraceMinutes: user.personalShiftGraceMinutes ?? null,
    organizationId: user.organizationId?.toString() || null
  };
}
