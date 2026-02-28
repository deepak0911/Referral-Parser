import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("referrals.db");

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Initialize database (Drop and recreate for schema update in MVP)
db.exec("DROP TABLE IF EXISTS referrals");
db.exec(`
  CREATE TABLE referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    role_title TEXT NOT NULL,
    job_ids TEXT NOT NULL,
    why_fit TEXT NOT NULL,
    context TEXT NOT NULL,
    resume_text TEXT,
    fit_score INTEGER,
    fit_summary TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const app = express();
const PORT = 3000;

app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Routes
app.post("/api/referrals", upload.single("resume"), async (req, res) => {
  try {
    const { candidate_name, candidate_email, role_title, job_ids, why_fit, context } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume is required" });
    }

    const resumeText = "Simulated resume content for " + candidate_name;

    // Call Gemini for Fit Check
    const prompt = `
      Analyze this candidate for the following roles: ${job_ids}.
      Primary Role Title: ${role_title}
      Candidate's "Why I'm a fit": ${why_fit}
      Resume Content: ${resumeText}

      Provide a Fit Score (1-10) based on the overall match for these roles and a 3-bullet point summary of pros/cons.
      Format the response as JSON:
      {
        "score": number,
        "summary": "bullet 1\\nbullet 2\\nbullet 3"
      }
    `;

    const model = "gemini-3-flash-preview";
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let analysis;
    try {
      analysis = JSON.parse(result.text || "{}");
    } catch (e) {
      console.error("Failed to parse Gemini response:", result.text);
      analysis = { score: 5, summary: "AI analysis failed, manual review required." };
    }

    const stmt = db.prepare(`
      INSERT INTO referrals (candidate_name, candidate_email, role_title, job_ids, why_fit, context, resume_text, fit_score, fit_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      candidate_name,
      candidate_email,
      role_title,
      job_ids,
      why_fit,
      context,
      resumeText,
      analysis.score || 0,
      analysis.summary || "No summary provided"
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing referral:", error);
    res.status(500).json({ error: "Failed to process referral" });
  }
});

app.get("/api/referrals", (req, res) => {
  const referrals = db.prepare("SELECT * FROM referrals ORDER BY fit_score DESC").all();
  res.json(referrals);
});

app.patch("/api/referrals/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.prepare("UPDATE referrals SET status = ? WHERE id = ?").run(status, id);
  res.json({ success: true });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
