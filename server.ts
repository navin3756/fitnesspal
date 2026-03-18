import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database("app.db");
db.pragma('journal_mode = WAL'); // Optimize for concurrency

// Initialize Database with Indexes for Scale
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    total_score INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active_date TEXT,
    goal TEXT,
    weight REAL,
    waist REAL,
    bp_sys INTEGER,
    bp_dia INTEGER,
    glucose INTEGER,
    last_reality_check TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_users_score ON users(total_score DESC);
  
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    score INTEGER DEFAULT 0,
    water_intake INTEGER DEFAULT 0,
    completed_ids TEXT,
    UNIQUE(user_id, date)
  );
  CREATE INDEX IF NOT EXISTS idx_logs_user_date ON daily_logs(user_id, date);

  CREATE TABLE IF NOT EXISTS nudges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER,
    to_user_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS community_fails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reality_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    weight REAL,
    waist REAL,
    bp_sys INTEGER,
    bp_dia INTEGER,
    glucose INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
  );
  CREATE INDEX IF NOT EXISTS idx_reality_user ON reality_checks(user_id, date DESC);
`);

// Migration for existing users table
try {
  db.exec("ALTER TABLE users ADD COLUMN weight REAL;");
  db.exec("ALTER TABLE users ADD COLUMN waist REAL;");
  db.exec("ALTER TABLE users ADD COLUMN bp_sys INTEGER;");
  db.exec("ALTER TABLE users ADD COLUMN bp_dia INTEGER;");
  db.exec("ALTER TABLE users ADD COLUMN glucose INTEGER;");
  db.exec("ALTER TABLE users ADD COLUMN last_reality_check TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE daily_logs ADD COLUMN water_intake INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE daily_logs ADD COLUMN completed_ids TEXT;");
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  // Enable CORS for mobile app requests
  app.use(cors());

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev simplicity with Vite, enable in prod
  }));
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    keyGenerator: (req) => {
      return (req.headers['x-forwarded-for'] as string) || 
             (req.headers['forwarded'] as string) || 
             req.socket.remoteAddress || 
             'unknown';
    }
  });
  app.use("/api", limiter);

  app.use(express.json({ limit: '10kb' })); // Limit body size

  // API Routes
  app.post("/api/login", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    
    let user = db.prepare("SELECT * FROM users WHERE name = ?").get(name);
    if (!user) {
      const info = db.prepare("INSERT INTO users (name) VALUES (?)").run(name);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    }
    res.json(user);
  });

  app.get("/api/leaderboard", (req, res) => {
    const users = db.prepare("SELECT * FROM users ORDER BY total_score DESC LIMIT 50").all();
    res.json(users);
  });

  app.post("/api/submit", (req, res) => {
    const { userId, date, score, completedIds } = req.body;
    try {
      const existing = db.prepare("SELECT score FROM daily_logs WHERE user_id = ? AND date = ?").get(userId, date) as any;
      if (existing && existing.score > 0) {
        return res.status(400).json({ error: "Already submitted for this date" });
      }

      const idsJson = JSON.stringify(completedIds || []);
      db.prepare(`
        INSERT INTO daily_logs (user_id, date, score, completed_ids) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET score = ?, completed_ids = ?
      `).run(userId, date, score, idsJson, score, idsJson);
      
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      
      // Calculate streak
      const dateObj = new Date(date);
      dateObj.setDate(dateObj.getDate() - 1);
      const yesterday = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      let newStreak = 1;
      if (user.last_active_date === yesterday) {
        newStreak = user.streak + 1;
      } else if (user.last_active_date === date) {
        newStreak = user.streak; // Already submitted today somehow
      }
      
      db.prepare("UPDATE users SET total_score = total_score + ?, streak = ?, last_active_date = ? WHERE id = ?")
        .run(score, newStreak, date, userId);
        
      res.json({ success: true, newStreak });
    } catch (e) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.post("/api/water", (req, res) => {
    const { userId, date, amount } = req.body;
    try {
      db.prepare(`
        INSERT INTO daily_logs (user_id, date, water_intake, score) 
        VALUES (?, ?, ?, 0)
        ON CONFLICT(user_id, date) DO UPDATE SET water_intake = water_intake + ?
      `).run(userId, date, amount, amount);
      
      const log = db.prepare("SELECT water_intake FROM daily_logs WHERE user_id = ? AND date = ?").get(userId, date) as any;
      res.json({ success: true, waterIntake: log.water_intake });
    } catch (e) {
      res.status(400).json({ error: "Failed to update water intake" });
    }
  });

  app.post("/api/goal", (req, res) => {
    const { userId, goal } = req.body;
    db.prepare("UPDATE users SET goal = ? WHERE id = ?").run(goal, userId);
    res.json({ success: true });
  });

  app.get("/api/history/:userId", (req, res) => {
    const logs = db.prepare("SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
    res.json(logs);
  });

  app.post("/api/reality-check", (req, res) => {
    const { userId, weight, waist, bp_sys, bp_dia, glucose, date } = req.body;
    db.prepare(`
      UPDATE users
      SET weight = ?, waist = ?, bp_sys = ?, bp_dia = ?, glucose = ?, last_reality_check = ?
      WHERE id = ?
    `).run(weight, waist, bp_sys, bp_dia, glucose, date, userId);
    // Also persist to history table
    db.prepare(`
      INSERT INTO reality_checks (user_id, date, weight, waist, bp_sys, bp_dia, glucose)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        weight = excluded.weight, waist = excluded.waist,
        bp_sys = excluded.bp_sys, bp_dia = excluded.bp_dia, glucose = excluded.glucose
    `).run(userId, date, weight, waist, bp_sys, bp_dia, glucose);
    res.json({ success: true });
  });

  app.post("/api/nudge", (req, res) => {
    const { fromUserId, toUserId } = req.body;
    db.prepare("INSERT INTO nudges (from_user_id, to_user_id) VALUES (?, ?)").run(fromUserId, toUserId);
    res.json({ success: true });
  });

  app.get("/api/nudges/:userId", (req, res) => {
    const nudges = db.prepare(`
      SELECT n.*, u.name as from_user_name 
      FROM nudges n 
      JOIN users u ON n.from_user_id = u.id 
      WHERE n.to_user_id = ? AND n.read = 0
      ORDER BY n.timestamp DESC
    `).all(req.params.userId);
    res.json(nudges);
  });

  app.post("/api/nudges/read", (req, res) => {
    const { userId } = req.body;
    db.prepare("UPDATE nudges SET read = 1 WHERE to_user_id = ?").run(userId);
    res.json({ success: true });
  });

  app.get("/api/fails", (req, res) => {
    const fails = db.prepare("SELECT * FROM community_fails ORDER BY timestamp DESC LIMIT 50").all();
    res.json(fails);
  });

  app.post("/api/fails", (req, res) => {
    const { userId, userName, content } = req.body;
    db.prepare("INSERT INTO community_fails (user_id, user_name, content) VALUES (?, ?, ?)").run(userId, userName, content);
    res.json({ success: true });
  });

  // AI Chat endpoint (proxies to Gemini, keeps API key server-side)
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "AI service not configured" });
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are Dr. Pal, a funny, direct, and health-conscious doctor specializing in metabolic health. You believe in these 10 Commandments: 1) Waist < 90cm (men) / 80cm (women), 2) Diet quality > exercise (80/20 rule), 3) Time-restricted eating 7AM–7PM, 4) Sleep ≥7h (men) / 8h (women), 5) Meditate ≥7 min daily, 6) Drink ≥2L water daily, 7) Limit cooked rice to ~150g per meal, 8) Exercise ≥20 min at 60-70% max HR, 9) 90-day health reassessment, 10) Stay healthy for your dependents. Use warm humor, light sarcasm, and solid medical reasoning. Keep answers concise and encouraging but firm. Format responses with markdown when helpful.`;

      const contents = messages.map((msg: { role: string; text: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: { systemInstruction },
      });

      res.json({ text: response.text ?? "No response generated." });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "AI response failed" });
    }
  });

  // Reality Check history
  app.get("/api/reality-history/:userId", (req, res) => {
    const checks = db.prepare(
      "SELECT * FROM reality_checks WHERE user_id = ? ORDER BY date DESC LIMIT 10"
    ).all(req.params.userId);
    res.json(checks);
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
}

startServer();
