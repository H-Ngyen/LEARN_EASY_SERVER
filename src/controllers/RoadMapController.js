import generateRoadmap from "../middleware/Generate_RoadMap.js";
// import Roadmap from "../models/Roadmap.js";

async function CreateRoadmap(req, res) {
  try {
    const { topic, userId, level, duration } = req.body;

    const roadmapText = await generateRoadmap({topic, level, duration});
    const roadmap = HandleString(roadmapText, userId, topic, level, duration);

    // const newRoadmap = new Roadmap(roadmap);
    // await newRoadmap.save();

    console.log(roadmap);
    // console.log('roadmapText: ' + roadmapText);

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to generate roadmap" });
  }
}

function HandleString(roadmapText, userId, topic, level, duration) {
  const lines = roadmapText.split("\n").filter((line) => line.trim());
  const nodes = [];
  const edges = [];

  lines.forEach((line, index) => {
    const match = line.match(/Step (\d+): (.+?) \| Description: (.+?) \| Depends on: (.+)$/);
    if (!match) {
      console.warn(`Invalid line format: ${line}`);
      return;
    }

    const [, stepNum, label, description, dependency] = match;
    const idNote = stepNum;

    nodes.push({
      idNote,
      data: {
        label,
        status: 0,
        description,
      },
      position: { x: 250 * (index % 3), y: 150 * Math.floor(index / 3) },
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
    id: `roadmap1`,
    idUser: userId,
    share: '0', // Mặc định không chia sẻ
    topic,
    level,
    duration,
    nodes,
    edges,
  };
}

export default { CreateRoadmap };