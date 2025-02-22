import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meetingId: { type: String, unique: true, required: true }, // Unique meeting code
  title: { type: String, required: true },
  description: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;
