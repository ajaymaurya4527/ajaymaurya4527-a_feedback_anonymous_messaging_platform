import mongoose, { Schema, Document } from "mongoose";

// 1. Define the Message Interface and Schema
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

export const messageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

// 2. Define the CollectionItem Schema (This makes $pull more reliable)
const CollectionSchema = new Schema({
  publicId: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['image', 'video'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 3. Define the Interfaces
export interface CollectionItem {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  createdAt: Date;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
  collections: CollectionItem[];
}

// 4. Define the User Schema
const userSchema: Schema<User> = new Schema({
  username: { type: String, required: [true, "Username is required"], trim: true, unique: true },
  email: { type: String, required: [true, "Email is required"], unique: true, match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "please use a valid email address"] },
  password: { type: String, required: [true, "Password is required"] },
  verifyCode: { type: String, required: [true, "Verifycode is required"] },
  verifyCodeExpiry: { type: Date, required: [true, "Verifycode expiry is required"] },
  isVerified: { type: Boolean, default: false },
  isAcceptingMessage: { type: Boolean, default: true },
  messages: [messageSchema],
  // Use the sub-document schema here
  collections: [CollectionSchema] 
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema);

export default UserModel;