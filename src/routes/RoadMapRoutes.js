import express from 'express';
import RoadMapController from '../controllers/RoadMapController.js'

const router = express.Router();

router.post('/', RoadMapController.CreateRoadmap)

export default router;