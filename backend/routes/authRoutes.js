import express from 'express';
import { googleLogin } from '../controller/authController.js';

const router = express.Router();
router.post('/auth/google', googleLogin);

export default router;
