const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();
const PORT = 3000;
const FILE = path.join(__dirname, "tasks.json");

app.use(express.json({ limit: "10mb" })); // parse JSON request bodies
app.use(express.static(__dirname)); // serve index.html, style.css, app.js

// same job loadTasks/saveTasks used to do, but the drawer is a file on disk
async function read() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function write(tasks) {
  await fs.writeFile(FILE, JSON.stringify(tasks, null, 2));
}

app.get("/api/tasks", async (req, res) => {
  res.json(await read());
});

app.post("/api/tasks", async (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" });

  const tasks = await read();
  const task = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    image: req.body.image || null,
    done: false,
  };
  tasks.push(task);
  await write(tasks);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const tasks = await read();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "No such task" });

  task.done = Boolean(req.body.done);
  await write(tasks);
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const tasks = await read();
  const remaining = tasks.filter((t) => t.id !== req.params.id);
  if (remaining.length === tasks.length) {
    return res.status(404).json({ error: "No such task" });
  }
  await write(remaining);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
