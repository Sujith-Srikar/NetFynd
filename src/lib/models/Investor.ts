import mongoose, { Schema, Document } from "mongoose";

export interface IInvestor extends Document {
  name: string;
  category: string;
  type: "Investor" | "Mentor";
}

const InvestorSchema = new Schema<IInvestor>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ["Investor", "Mentor"], required: true },
});

export default mongoose.models.Investor || mongoose.model<IInvestor>("Investor", InvestorSchema);
