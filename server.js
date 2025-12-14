const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();

app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, "todoApplication.db");
const db = new Database(dbPath);

// Create table
db.prepare(`
  CREATE TABLE IF NOT EXISTS todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    isCompleted INTEGER DEFAULT 0
  );
`).run();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ================= ROUTES ================= */

// Add Todo
app.post("/todos", (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    return res.status(400).send({ error: "Todo text required" });
  }

  db.prepare(
    "INSERT INTO todo (todo, isCompleted) VALUES (?, 0)"
  ).run(todo);

  res.send({ message: "Todo Successfully Added" });
});

// Get All Todos
app.get("/todos", (req, res) => {
  const todos = db.prepare("SELECT * FROM todo").all();
  res.send(todos);
});

// Get Todo by ID
app.get("/todos/:id", (req, res) => {
  const todo = db
    .prepare("SELECT * FROM todo WHERE id = ?")
    .get(req.params.id);

  res.send(todo);
});

// Delete Todo
app.delete("/todos/:id", (req, res) => {
  db.prepare("DELETE FROM todo WHERE id = ?").run(req.params.id);
  res.send({ message: "Todo Deleted" });
});

// Update Todo text
app.put("/todos/:id", (req, res) => {
  const { todo } = req.body;

  db.prepare(
    "UPDATE todo SET todo = ? WHERE id = ?"
  ).run(todo, req.params.id);

  res.send({ message: "Todo Updated Successfully" });
});

// Update completion status
app.patch("/todos/:id", (req, res) => {
  const { isCompleted } = req.body;

  db.prepare(
    "UPDATE todo SET isCompleted = ? WHERE id = ?"
  ).run(isCompleted, req.params.id);

  res.send({ message: "Todo Status Updated" });
});

module.exports = app;
