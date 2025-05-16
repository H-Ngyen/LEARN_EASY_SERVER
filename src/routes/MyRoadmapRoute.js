import express from 'express';
import MyRoadmapController from '../controllers/MyRoadmapController.js';

const router = express.Router();

// api/my/roadmap
router.put('/update/:id', MyRoadmapController.UpdateMyRoadmap)
router.post('/community/save', MyRoadmapController.SaveRoadmapFromCommunity)

export default router;