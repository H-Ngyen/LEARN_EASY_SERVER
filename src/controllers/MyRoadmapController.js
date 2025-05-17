import Roadmap from "../models/roadmap.js";
import mongoose from "mongoose";

async function UpdateMyRoadmap(req, res) {
  try {
    const roadmapId = req.params.id;
    const roadmap = { ...req.body };

    // Tìm roadmap hiện tại để lấy createdAt và nodes
    const currentRoadmap = await Roadmap.findOne({ id: roadmapId });
    if (!currentRoadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Nếu roadmap.nodes không được gửi đầy đủ, sử dụng nodes từ currentRoadmap
    roadmap.nodes = roadmap.nodes && roadmap.nodes.length > 0 ? roadmap.nodes : currentRoadmap.nodes;

    // Log chi tiết để debug
    console.log('Received roadmap.nodes:', roadmap.nodes);
    console.log('Current roadmap.nodes:', currentRoadmap.nodes);

    // Chuẩn hóa status về chuỗi và kiểm tra tất cả nodes
    const normalizedNodes = roadmap.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: node.data.status === 2 ? '2' : node.data.status.toString(), // Chuyển số 2 thành chuỗi '2'
      },
    }));

    // Kiểm tra nếu tất cả nodes đã hoàn thành (status: '2') dựa trên currentRoadmap
    const allNodesCompleted = currentRoadmap.nodes.every(node => normalizedNodes.find(n => n.idNote === node.idNote)?.data.status === '2');
    console.log('All nodes completed:', allNodesCompleted); // Debug log

    // Nếu tất cả nodes hoàn thành và timeSpent chưa được cập nhật
    if (allNodesCompleted) {
      roadmap.timeSpent = new Date();
      console.log('Calculated timeSpent:', roadmap.timeSpent); // Debug log
    }

    // Cập nhật roadmap trong MongoDB
    const updateRoadmap = await Roadmap.findOneAndUpdate(
      { id: roadmapId },
      { ...roadmap, nodes: normalizedNodes }, // Sử dụng nodes đã chuẩn hóa
      { new: true, runValidators: true }
    );

    if (!updateRoadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.status(200).json(updateRoadmap.toObject());
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({
      message: 'Error updating roadmap',
      error: error.message,
    });
  }
}

async function SaveRoadmapFromCommunity(req, res) {
  try {
    const { id, userId } = req.body;

    if (!id || !userId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: id and userId are required' });
    }

    const originalRoadmap = await Roadmap.findOne({ id, share: '1' });
    if (!originalRoadmap) {
      return res.status(404).json({ success: false, error: 'Roadmap not found or not shared' });
    }

    // Tăng downloadCount
    await Roadmap.updateOne(
      { id },
      { $inc: { downloadCount: 1 } }
    );

    const newObjectId = new mongoose.Types.ObjectId();
    const newRoadmapData = {
      ...originalRoadmap.toObject(),
      _id: newObjectId,
      id: newObjectId.toString(),
      userId: userId,
      share: '0',
      createdAt: new Date(),
      timeSpent: null,
      downloadCount: 0, // Reset downloadCount cho roadmap mới
      nodes: originalRoadmap.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: '0',
        },
      })),
    };

    console.log(newRoadmapData);

    const newRoadmap = new Roadmap(newRoadmapData);
    const savedRoadmap = await newRoadmap.save();

    res.status(201).json({ success: true, roadmap: savedRoadmap });
  } catch (error) {
    console.error('Error saving roadmap from community:', error);
    res.status(500).json({ success: false, error: 'Failed to save roadmap from community' });
  }
}

export default {
  UpdateMyRoadmap,
  SaveRoadmapFromCommunity,
};