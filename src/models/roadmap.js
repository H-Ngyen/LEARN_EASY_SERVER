import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true },
  share: { type: String, default: '0', enum: ['0', '1'] }, // 0(!share), 1(share)
  topic: { type: String, require: true },
  level: { type: String, require: true, enum: ['0', '1', '2'] }, // 0: mới bắt đầu, 1: trung cấp, 2: nâng cao
  duration: { type: String, enum: ['0', '1', '2'] }, // 0: 1 tháng, 1: 3 tháng, 2: 6 tháng
  nodes: [
    {
      idNote: String,
      data: {
        label: String,
        status: { type: String, default: '0', enum: ['0', '1', '2'] }, // 0: todo, 1:in-process, 2: done
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