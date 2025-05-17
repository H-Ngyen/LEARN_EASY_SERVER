import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true },
  share: { type: String, default: '0', enum: ['0', '1'] },
  topic: { type: String, required: true },
  level: { type: String, required: true, enum: ['0', '1', '2'] },
  duration: { type: String, enum: ['0', '1', '2'] },
  timeSpent: { type: Date, default: null },
  downloadCount: { type: Number, default: 0 }, // Thêm thuộc tính downloadCount
  nodes: [
    {
      idNote: String,
      data: {
        label: String,
        status: { type: String, default: '0', enum: ['0', '1', '2'] },
        description: String,
      },
      position: { x: Number, y: Number },
    },
  ],
  edges: [
    {
      idEdge: String,
      source: String,
      target: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;