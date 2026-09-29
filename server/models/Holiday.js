import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  description: { type: String, trim: true, maxlength: 300, default: '' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, autoIndex: false });

holidaySchema.index({ organizationId: 1, date: 1, name: 1 }, { unique: true });
export default mongoose.model('Holiday', holidaySchema);
