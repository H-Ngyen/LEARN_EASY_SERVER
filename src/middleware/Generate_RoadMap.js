import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

// Cấu hình API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Service tạo roadmap
const generateRoadmap = async ({ topic, level, duration }) => {
  const levelMap = {
    '0': 'beginner, focusing on basic concepts and simple tools',
    '1': 'intermediate, including moderately complex topics and practical applications',
    '2': 'advanced, covering in-depth and specialized topics'
  };
  const durationMap = {
    '0': '1 month, with 4-6 concise steps',
    '1': '3 months, with 6-8 detailed steps',
    '2': '6 months, with 8-10 comprehensive steps'
  };
  const levelDesc = levelMap[level];
  const durationDesc = durationMap[duration];

  const prompt = `
    Generate a learning roadmap for ${topic} tailored for a ${levelDesc} level, spanning ${durationDesc}. For each step, include:
    - Step number and name.
    - A description (2-3 sentences) about the step.
    - Dependency (the step number it depends on, such as None, Step 1, Step 2, or multiple steps like Step 5, Step 7).
    Format each step as:
    "Step <number>: <name> | Description: <description> | Depends on: <None or Step X or Step X, Step Y>"
    Example:
    "Step 1: Programming Fundamentals | Description: Learn the basics of programming including data structures and algorithms. This foundational knowledge is crucial for backend development. | Depends on: None"
    "Step 2: Choose a Backend Language | Description: Select a language like Python (Django/Flask) or JavaScript (Node.js). Learn its syntax and core libraries. | Depends on: Step 1"
    "Step 8: Deployment & DevOps | Description: Explore CI/CD and Docker for deployment. Ensure scalability and reliability. | Depends on: Step 5, Step 7"
    Strictly use "Step X" for dependencies (e.g., Step 1, not Step1 or names). Do not include ** or titles, only the steps.
  `;

  const result = await model.generateContent(prompt);
  const roadmapText = await result.response.text();
  return roadmapText;
};

export default generateRoadmap;