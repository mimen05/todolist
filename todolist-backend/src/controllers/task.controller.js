const taskService = require("../services/task.service");

// Controllers read the request, pick the status code, and send the response.
// No SQL lives here. Anything that throws goes to next(err), which lands in
// middlewares/errorHandler.js instead of crashing the server.

async function list(req, res, next) {
  try {
    res.json(await taskService.list());
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const task = await taskService.create(text, req.body.image || null);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const task = await taskService.setDone(
      req.params.id,
      Boolean(req.body.done)
    );
    if (!task) return res.status(404).json({ error: "No such task" });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await taskService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: "No such task" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
