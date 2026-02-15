import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  user_id: mongoose.Types.ObjectId;
  check_in_time: Date;
  check_out_time?: Date;
  date: string; // Format: YYYY-MM-DD
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    check_in_time: {
      type: Date,
      required: [true, 'Check-in time is required'],
      default: Date.now,
    },
    check_out_time: {
      type: Date,
      default: null,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'on_leave', 'remote'],
      default: 'present',
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance per day
attendanceSchema.index({ user_id: 1, date: 1 }, { unique: true });

// Index for date queries
attendanceSchema.index({ date: -1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
