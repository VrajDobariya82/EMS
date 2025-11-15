import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  position: { type: String, default: '' },
  department: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
  joinDate: { type: String }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);


