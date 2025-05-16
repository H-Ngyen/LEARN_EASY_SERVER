import express from 'express';
import RoadMapController from '../controllers/RoadMapController.js'

const router = express.Router();

// api/roadmap
router.get('/', RoadMapController.getRoadmapByUser);
router.get('/shared', RoadMapController.getRoadmapByShare);
router.post('/', RoadMapController.createRoadmap);

export default router;