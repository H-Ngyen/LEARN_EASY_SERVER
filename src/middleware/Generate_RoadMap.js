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
    - Dependency (the step number it depends on, such as None, Step 1, Step 2, etc.).
    The roadmap must follow a strict sequential flow: each step must depend only on the immediately preceding step (e.g., Step 2 depends on Step 1, Step 3 depends on Step 2, etc.). Step 1 must have "Depends on: None".
    Format each step as:
    "Step <number>: <name> | Description: <description> | Depends on: <None or Step X>"
    Example:
    "Step 1: Learn HTML Basics | Description: Understand the structure of web pages using HTML. Learn tags, attributes, and semantic HTML. | Depends on: None"
    "Step 2: Master CSS | Description: Style web pages using CSS. Learn about selectors, layouts, and responsive design. | Depends on: Step 1"
    "Step 3: Introduction to JavaScript | Description: Add interactivity to web pages with JavaScript. Focus on variables, functions, and DOM manipulation. | Depends on: Step 2"
    Strictly use "Step X" for dependencies (e.g., Step 1, not Step1 or names). Do not include ** or titles, only the steps.
  `;

  const result = await model.generateContent(prompt);
  const roadmapText = await result.response.text();
  return roadmapText;
};

export default generateRoadmap;