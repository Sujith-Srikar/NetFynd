import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  credits: number;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    credits: { type: Number, default: 5 },
  },
  { timestamps: true }
);


export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
