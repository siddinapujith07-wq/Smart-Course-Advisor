import { courses, defaultProfile, recommend, timetable, stats, dashboard, chatReply } from "../server/algorithms.js";

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const path = new URL(req.url, "https://course-advisor.vercel.app").pathname;

  try {
    if (req.method === "GET" && path.endsWith("/courses")) {
      send(res, 200, courses);
      return;
    }

    if (req.method === "POST" && path.endsWith("/recommend")) {
      const body = await readBody(req);
      send(res, 200, recommend({ ...defaultProfile, ...body }));
      return;
    }

    if (req.method === "POST" && path.endsWith("/stats")) {
      const body = await readBody(req);
      send(res, 200, stats({ ...defaultProfile, ...body }));
      return;
    }

    if (req.method === "POST" && path.endsWith("/dashboard")) {
      const body = await readBody(req);
      send(res, 200, dashboard({ ...defaultProfile, ...body }));
      return;
    }

    if (req.method === "POST" && path.endsWith("/timetable")) {
      const body = await readBody(req);
      send(res, 200, timetable({ ...defaultProfile, ...body }));
      return;
    }

    if (req.method === "POST" && path.endsWith("/chat")) {
      const body = await readBody(req);
      send(res, 200, { reply: chatReply(String(body.message ?? "")) });
      return;
    }

    send(res, 404, { error: "API route not found" });
  } catch (error) {
    send(res, 500, { error: "Server error", detail: error.message });
  }
}
