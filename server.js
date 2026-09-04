const express = require("express");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Start with: npm run dev");
  process.exit(1);
}

const app = express();
const PORT = 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json({ limit: "10mb" })); // parse JSON request bodies
app.use(express.static(__dirname)); // serve index.html, style.css, app.js

app.get("/api/tasks", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, text, image, done FROM tasks ORDER BY created_at"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (text, image) VALUES ($1, $2) RETURNING id, text, image, done",
      [text, req.body.image || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "UPDATE tasks SET done = $1 WHERE id = $2 RETURNING id, text, image, done",
      [Boolean(req.body.done), req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "No such task" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "No such task" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// anything thrown in a route lands here instead of crashing the server
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
