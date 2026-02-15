import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [255, 'Title cannot exceed 255 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    due_date: {
      type: Date,
      default: null,
      index: true,
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
taskSchema.index({ user_id: 1, status: 1 });
taskSchema.index({ user_id: 1, priority: 1 });
taskSchema.index({ due_date: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
