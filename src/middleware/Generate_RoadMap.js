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
    - A detailed description (100-130 words) covering: the specific learning objectives, recommended tools or resources (e.g., books, online courses, software), a practical example or exercise, and why this step is crucial in the roadmap. Use 4-5 sentences to elaborate.
    - Dependency (the step number it depends on, such as None, Step 1, Step 2, etc.).
    The roadmap must follow a strict sequential flow: each step must depend only on the immediately preceding step (e.g., Step 2 depends on Step 1, Step 3 depends on Step 2, etc.). Step 1 must have "Depends on: None".
    Format each step as:
    "Step <number>: <name> | Description: <description> | Depends on: <None or Step X>"
    Example:
    "Step 1: Learn HTML Basics | Description: Master the fundamentals of web development by understanding HTML structure, including tags, attributes, and semantic elements. Use resources like W3Schools or the 'HTML & CSS' book by Jon Duckett, and practice by building a simple personal webpage. This step is essential as it forms the foundation for all subsequent web development skills. | Depends on: None"
    "Step 2: Master CSS | Description: Dive into styling web pages with CSS, learning selectors, flexbox, and responsive design techniques. Utilize tools like CSS-Tricks and Codecademy courses, and create a responsive portfolio layout as a hands-on project. This step is critical to enhance the visual appeal and usability of your HTML structures. | Depends on: Step 1"
    "Step 3: Introduction to JavaScript | Description: Explore JavaScript to add interactivity, focusing on variables, functions, and DOM manipulation for dynamic web pages. Recommended resources include freeCodeCamp and 'Eloquent JavaScript' by Marijn Haverbeke, with a project like a to-do list application. This step is vital as it enables interactive and user-friendly web experiences. | Depends on: Step 2"
    Strictly use "Step X" for dependencies (e.g., Step 1, not Step1 or names). Do not include ** or titles, only the steps.
  `;

  const result = await model.generateContent(prompt);
  const roadmapText = await result.response.text();
  return roadmapText;
};

export default generateRoadmap;