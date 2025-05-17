import express from 'express';
import MyUserController from '../controllers/MyUserController.js';

const router = express.Router();

// api/my/roadmap
router.get('/performance/:id', MyUserController.getPerformanceFromUser)

export default router;