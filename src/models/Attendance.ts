import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  status: string;
}

const AttendanceSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, 
  status: { type: String, default: 'Present' }
});

// Prevent duplicate attendance for the same user on the same day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);