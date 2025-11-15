import mongoose from 'mongoose';

const daySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent', 'Unmarked'], default: 'Unmarked' },
  clockIn: { type: String, default: null },
  clockOut: { type: String, default: null }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  employeeEmail: { type: String, required: true, index: true },
  records: { type: [daySchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);


