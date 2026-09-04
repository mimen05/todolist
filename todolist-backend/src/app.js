const path = require("path");
const express = require("express");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json({ limit: "10mb" })); // parse JSON request bodies
app.use(express.static(path.join(__dirname, "..", "..", "todolist-frontend")));

app.use("/api", routes);

app.use(errorHandler); // must be registered last

// Exported without listening, so server.js (or a test) decides when to start.
module.exports = app;
