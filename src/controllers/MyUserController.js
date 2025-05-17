import Roadmap from "../models/roadmap.js";

async function getPerformanceFromUser(req, res) {
  try {
    const userId = req.params.id;
    const { timeRange } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing required field: userId is required' });
    }

    let query = { userId };
    if (timeRange && timeRange !== 'all') {
      const days = parseInt(timeRange) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.createdAt = { $gte: startDate };
    }

    const roadmaps = await Roadmap.find(query);
    if (!roadmaps.length) {
      return res.status(404).json({ success: false, error: 'No roadmaps found for this user' });
    }

    let totalRoadmaps = 0;
    let completedRoadmaps = 0;
    let totalTimeSpent = 0;
    let totalEstimatedTime = 0;

    roadmaps.forEach(roadmap => {
      totalRoadmaps++;
      const allNodesCompleted = roadmap.nodes.every(node => node.data.status === '2');
      if (allNodesCompleted) {
        completedRoadmaps++;
        // Tính thời gian thực tế: (timeSpent - createdAt) / (1000 * 60) để ra phút
        if (roadmap.timeSpent && roadmap.createdAt) {
          const timeSpentMinutes = (new Date(roadmap.timeSpent) - new Date(roadmap.createdAt)) / (1000 * 60);
          totalTimeSpent += timeSpentMinutes > 0 ? Math.round(timeSpentMinutes) : 0;
        }

        // Hard-code thời gian dự kiến dựa trên duration
        if (roadmap.duration === '0') totalEstimatedTime += 120; // 1 tháng
        else if (roadmap.duration === '1') totalEstimatedTime += 360; // 3 tháng
        else if (roadmap.duration === '2') totalEstimatedTime += 720; // 6 tháng
      }
    });

    const completionRate = totalRoadmaps > 0 ? (completedRoadmaps / totalRoadmaps) * 100 : 0;
    const efficiency = totalEstimatedTime > 0 ? ((totalEstimatedTime - totalTimeSpent) / totalEstimatedTime) * 100 : 0;
    const performanceScore = (completionRate + efficiency) / 2;
    const timeSaved = totalEstimatedTime - totalTimeSpent > 0 ? totalEstimatedTime - totalTimeSpent : 0;

    const performance = {
      totalRoadmaps,
      completedRoadmaps,
      completionRate,
      totalTimeSpent,
      totalEstimatedTime,
      timeSaved,
      efficiency,
      performanceScore,
    };

    res.status(200).json({ success: true, performance });
  } catch (error) {
    console.error('Error getting performance from user:', error.message);
    res.status(500).json({ success: false, error: 'Failed to get performance from user' });
  }
}

export default {
  getPerformanceFromUser,
};