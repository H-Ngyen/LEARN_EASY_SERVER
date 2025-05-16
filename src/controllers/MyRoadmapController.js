import Roadmap from "../models/roadmap.js";
import mongoose from "mongoose";

async function UpdateMyRoadmap(req, res) {
    try {
        const roadmapId = req.params.id;
        const roadmap = { ...req.body };

        const updateRoadmap = await Roadmap.findOneAndUpdate(
            { id: roadmapId },
            roadmap,
            { new: true, runValidators: true }
        );

        if (!updateRoadmap) {
            return res.status(404).json({
                message: 'Roadmap not found'
            })
        }
        res.status(200).json(updateRoadmap.toObject());
    } catch (error) {
        console.error("Error updating roadmap:", error);
        res.status(500).json({
            message: 'Error updating roadmap',
            error: error.message
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

    const newObjectId = new mongoose.Types.ObjectId();
    const newRoadmapData = {
      ...originalRoadmap.toObject(),
      _id: newObjectId,
      id: newObjectId.toString(), // Tạo id mới
      userId: userId,
      share: '0',
      createdAt: new Date(), // Cập nhật thời gian tạo
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
    SaveRoadmapFromCommunity
};