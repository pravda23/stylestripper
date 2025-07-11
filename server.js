import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import inferenceHandler from "./api/inference.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Enable JSON body parsing for POST requests
app.use(express.json());

// API route
app.post("/api/inference", inferenceHandler);

// Fallback to index.html
app.get("/api/inference", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
