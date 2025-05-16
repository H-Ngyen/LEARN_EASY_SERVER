import Roadmap from "../models/roadmap.js";

async function updateMyRoadmap(req, res) {
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

export default {
    updateMyRoadmap
};