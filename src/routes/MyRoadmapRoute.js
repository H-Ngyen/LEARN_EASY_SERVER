import express from 'express';
import MyRoadmapController from '../controllers/MyRoadmapController.js';

const router = express.Router();

// api/my/roadmap
router.put('/:id', MyRoadmapController.updateMyRoadmap)

export default router;