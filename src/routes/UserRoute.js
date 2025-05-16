import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// api/user
router.post('/login', UserController.Login);
router.post('/register', UserController.Register)

export default router;