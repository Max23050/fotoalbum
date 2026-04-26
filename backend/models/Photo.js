import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Photo", photoSchema);
