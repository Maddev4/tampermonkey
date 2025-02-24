import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes";
import { connectDB } from "./db";
// import console from "./utils/console";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Endpoint: Handles both Groq and Humanize APIs
app.use("/api", router);

// Start the server
app.listen(PORT, async () => {
  console.info(`Server is running on http://localhost:${PORT}`);
  await connectDB();
});
