import express from 'express';
import userAuth from '../middlewares/authMiddleware.js';
import { getUser, updateUser } from "../controllers/userController.js"; // Use named imports

const router = express.Router();

// GET USER
router.get('/get-user', userAuth, getUser);

// UPDATE USER || PUT
router.put('/update-user', userAuth, updateUser);

export default router;
