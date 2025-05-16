import express from 'express';
import RoadMapController from '../controllers/RoadMapController.js';

const router = express.Router();

// api/roadmap
router.get('/user/:userId', RoadMapController.getRoadmapByUser);
router.get('/shared', RoadMapController.getRoadmapByShare);
router.get('/:id', RoadMapController.getRoadmapById);
router.post('/', RoadMapController.createRoadmap);

export default router;