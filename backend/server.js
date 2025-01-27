import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import expressSanitizer from "express-sanitizer";

import mongoSanitize from "express-mongo-sanitize";

import dbConnection from "./dbConfig/dbConnection.js";
import router from "./routes/index.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// MongoDB Connection
dbConnection();

// Middlewares
app.use(cors());
app.use(expressSanitizer());
app.use(mongoSanitize());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use(router);

// Error Middleware
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});
