import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Manager', 'Employee'], default: 'Employee' },
  profilePending: { type: Boolean, default: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);


