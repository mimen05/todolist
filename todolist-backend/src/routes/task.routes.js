const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

// This router is mounted at /api/tasks, so "/" here means /api/tasks
router.get("/", taskController.list);
router.post("/", taskController.create);
router.patch("/:id", taskController.update);
router.delete("/:id", taskController.remove);

module.exports = router;
