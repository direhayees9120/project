import express from "express";
import { rateLimit } from "express-rate-limit";
import { register, signIn } from "../controllers/authController.js";

// IP Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});

const router = express.Router();

// Authentication Routes with Rate Limiting
router.post("/register", limiter, register);
router.post("/login", limiter, signIn);

export default router;
