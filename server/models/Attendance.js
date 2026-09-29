import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
  workDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  scheduledStartTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  scheduledEndTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/, default: null },
  scheduledWorkDays: { type: [Number], default: null },
  graceMinutes: { type: Number, min: 0, max: 180, default: null },
  checkInAt: { type: Date, required: true },
  punctualityStatus: { type: String, enum: ['On time', 'Slightly late', 'Late'], default: 'On time' },
  checkOutAt: { type: Date, default: null },
  note: { type: String, trim: true, maxlength: 200, default: '' }
}, { timestamps: true, autoIndex: false });

attendanceSchema.index({ employeeId: 1, workDate: 1 }, { unique: true });
attendanceSchema.index({ organizationId: 1, workDate: -1 });
export default mongoose.model('Attendance', attendanceSchema);
