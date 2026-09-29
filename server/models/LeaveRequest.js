import mongoose from 'mongoose';

export const LEAVE_CATEGORIES = ['Annual leave', 'Sick leave', 'Personal leave', 'Unpaid leave', 'Compensatory time', 'Other'];

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
  category: { type: String, enum: LEAVE_CATEGORIES, required: true },
  startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  reason: { type: String, required: true, trim: true, minlength: 3, maxlength: 1000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  decisionAt: { type: Date, default: null },
  decisionNote: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true, autoIndex: false });

leaveRequestSchema.index({ employeeId: 1, createdAt: -1 });
leaveRequestSchema.index({ approverId: 1, status: 1, createdAt: -1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
