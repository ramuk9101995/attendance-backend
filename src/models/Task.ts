import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  status: 'Pending' | 'Completed';
}

const TaskSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
});

export default mongoose.model<ITask>('Task', TaskSchema);