import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { courses, defaultProfile, recommend, timetable, stats, dashboard, chatReply } from "./algorithms.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../client/dist");

app.get("/api/courses", (_req, res) => res.json(courses));

app.post("/api/recommend", (req, res) => {
  res.json(recommend({ ...defaultProfile, ...req.body }));
});

app.post("/api/stats", (req, res) => {
  res.json(stats({ ...defaultProfile, ...req.body }));
});

app.post("/api/dashboard", (req, res) => {
  res.json(dashboard({ ...defaultProfile, ...req.body }));
});

app.post("/api/timetable", (req, res) => {
  res.json(timetable({ ...defaultProfile, ...req.body }));
});

app.post("/api/chat", (req, res) => {
  const message = String(req.body?.message ?? "");
  res.json({ reply: chatReply(message) });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(express.static(clientDist));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Smart Course Advisor running at http://localhost:${port}`);
});
