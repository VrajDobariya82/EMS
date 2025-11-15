import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  timeStart: { type: String, required: true },
  timeEnd: { type: String, default: '' },
  allEmployees: { type: Boolean, default: true },
  invitees: { type: [String], default: [] }, // employee emails
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);


