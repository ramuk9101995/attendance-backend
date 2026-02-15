import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
