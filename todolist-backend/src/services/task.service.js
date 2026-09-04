const pool = require("../db");

// Services own the SQL and the rules. They never see req or res, so they
// return plain values (a row, or true/false) and let the caller decide
// what that means for the HTTP response.

async function list() {
  const { rows } = await pool.query(
    "SELECT id, text, image, done FROM tasks ORDER BY created_at"
  );
  return rows;
}

async function create(text, image) {
  const { rows } = await pool.query(
    "INSERT INTO tasks (text, image) VALUES ($1, $2) RETURNING id, text, image, done",
    [text, image]
  );
  return rows[0];
}

async function setDone(id, done) {
  const { rows } = await pool.query(
    "UPDATE tasks SET done = $1 WHERE id = $2 RETURNING id, text, image, done",
    [done, id]
  );
  return rows[0] || null; // null means there was no such task
}

async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { list, create, setDone, remove };
