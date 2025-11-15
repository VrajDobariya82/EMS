import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeEmail: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  type: { type: String, enum: ['Vacation', 'Sick', 'Personal', 'Other'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminJustification: { type: String, default: '' },
  reviewedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);


