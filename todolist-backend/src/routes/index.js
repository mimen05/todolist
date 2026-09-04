const express = require("express");
const taskRoutes = require("./task.routes");

const router = express.Router();

// One place that lists every group of routes. Mounted at /api in app.js,
// so these become /api/tasks/...
router.use("/tasks", taskRoutes);

module.exports = router;
