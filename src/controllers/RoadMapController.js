import generateRoadmap from "../middleware/Generate_RoadMap.js";
import Roadmap from '../models/roadmap.js';
import User from '../models/user.js'

async function createRoadmap(req, res) {
  try {
    const { topic, userId, level, duration } = req.body;

    const roadmapText = await generateRoadmap({ topic, level, duration });
    const roadmap = HandleString(roadmapText, userId, topic, level, duration);

    const newRoadmap = new Roadmap(roadmap);
    const saveRoadmap = await newRoadmap.save();

    console.log(roadmap);
    res.json({ success: true, roadmap: saveRoadmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to generate roadmap" });
  }
}

function HandleString(roadmapText, userId, topic, level, duration) {
  const lines = roadmapText.split("\n").filter((line) => line.trim());
  const nodes = [];
  const edges = [];

  const columnPositions = {
    c1: 0,
    c2: 250,
    c3: 500,
  };

  const cycle = ['c2', 'c1', 'c3', 'c1'];

  lines.forEach((line, index) => {
    const match = line.match(/Step (\d+): (.+?) \| Description: (.+?) \| Depends on: (.+)$/);
    if (!match) {
      console.warn(`Invalid line format: ${line}`);
      return;
    }

    const [, stepNum, label, description, dependency] = match;
    const idNote = stepNum;

    // Tính vị trí cột (x) dựa trên chu kỳ
    let column = cycle[index % 4];

    // step cuối nằm ở c2
    if (index === lines.length - 1 && column !== 'c2') {
      column = 'c2';
    }

    const x = columnPositions[column];

    // Tính vị trí hàng (y) dựa trên chỉ số index
    const y = 150 * index; // Dọc xuống, mỗi hàng cách 150px

    nodes.push({
      idNote,
      data: {
        label,
        status: '0', // Đảm bảo là chuỗi để khớp với schema
        description,
      },
      position: { x, y },
    });

    if (dependency !== "None") {
      const dependencies = dependency
        .split(", ")
        .map((dep) => dep.trim().replace(/^Step\s*/i, ""))
        .filter((depId) => depId);
      dependencies.forEach((depId) => {
        edges.push({
          idEdge: `e${depId}-${idNote}`,
          source: depId,
          target: idNote,
        });
      });
    }
  });

  return {
    userId,
    share: '0',
    topic,
    level,
    duration,
    nodes,
    edges,
  };
}

async function getRoadmapByUser(req, res) {
  try {
    const userId = req.params.userId;
    const roadmaps = await Roadmap.find({ userId: userId });
    res.json({ success: true, roadmaps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to get roadmaps" });
  }
}

async function getRoadmapById(req, res) {
  try {
    const id = req.params.id;
    const roadmap = await Roadmap.findOne({ id: id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to get roadmap" });
  }
}


async function getRoadmapByCommunity(req, res) {
  try {
    // Chỉ lấy các trường cần thiết: id, userId, topic, level, duration, downloadCount, createdAt
    const roadmaps = await Roadmap.find({ share: "1" })
      .select('id userId topic level duration downloadCount createdAt')
      .lean(); // Sử dụng lean() để tăng hiệu suất, trả về plain JavaScript objects

    const roadmapsWithAuthor = await Promise.all(
      roadmaps.map(async (roadmap) => {
        // Tối ưu hóa truy vấn User, chỉ lấy trường name
        const user = await User.findOne({ userId: roadmap.userId }, 'name').lean();
        return {
          id: roadmap.id,
          userId: roadmap.userId,
          topic: roadmap.topic,
          level: roadmap.level,
          duration: roadmap.duration,
          downloadCount: roadmap.downloadCount || 0,
          createdAt: roadmap.createdAt,
          author: {
            name: user ? user.name : 'Unknown Author',
          },
        };
      })
    );

    res.json({ success: true, roadmaps: roadmapsWithAuthor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to get shared roadmaps" });
  }
}

export default {
  createRoadmap,
  getRoadmapByUser,
  getRoadmapByCommunity,
  getRoadmapById
};