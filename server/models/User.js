import mongoose from 'mongoose';

export const ROLES = ['Employee', 'Manager', 'Organization Admin', 'Application Admin'];
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Daily wage', 'Intern', 'Support staff'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true },
  phoneNumber: { type: String, trim: true },
  contactPhone: { type: String, trim: true, maxlength: 30, default: '' },
  avatarData: { type: String, select: false, default: null },
  avatarUpdatedAt: { type: Date, default: null },
  firebaseUid: { type: String, unique: true, sparse: true, select: false },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ROLES, default: 'Employee' },
  department: { type: String, trim: true, maxlength: 80, default: '' },
  designation: { type: String, trim: true, maxlength: 80, default: '' },
  employmentType: { type: String, enum: EMPLOYMENT_TYPES, default: 'Full-time' },
  employeeCode: { type: String, trim: true, uppercase: true, maxlength: 32, sparse: true, unique: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  teamShiftStart: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  teamShiftEnd: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  teamGraceMinutes: { type: Number, min: 0, max: 180, default: null },
  teamWorkDays: { type: [Number], default: null },
  personalShiftStartTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  personalShiftEndTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  personalShiftGraceMinutes: { type: Number, min: 0, max: 180, default: null },
  personalWorkDays: { type: [Number], default: null },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  refreshTokenHash: { type: String, select: false, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, autoIndex: false });

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });
userSchema.pre('validate', function validateAuthenticationMethod() {
  // Password hashes and Firebase UIDs are select:false. Existing records loaded
  // for profile/role edits won't include them, so only enforce this on account
  // creation or when an authentication field itself is being changed.
  const authenticationChanged = this.isNew || this.isModified('passwordHash') || this.isModified('firebaseUid');
  if (authenticationChanged && !this.passwordHash && !this.firebaseUid) {
    this.invalidate('passwordHash', 'An account must have a password or a verified Firebase identity.');
  }
});
export default mongoose.model('User', userSchema);
