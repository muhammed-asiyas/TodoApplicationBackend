const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.run(`
      CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0
      );
    `);

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log("DB Error:", error.message);
  }
};

initializeDbAndServer();

app.post("/todos/", async (request, response) => {
  const { todo } = request.body;
  if (!todo) {
    res.status(400).send({ error: "Todo text required" });
    return;
  }
  const addTodoQuery = `INSERT INTO todo (todo, isCompleted)
    VALUES ('${todo}', 0);`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.get("/todos", async (request, response) => {
  const getTodosQuery = `SELECT * FROM todo;`;
  const todoArray = await db.all(getTodosQuery);
  response.send(todoArray);
});

app.get("/todos/:todoId", async (request, response) => {
  const todoId = request.params.todoId;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

app.delete("/todos/:todoId", async (request, response) => {
  const todoId = request.params.todoId;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { todo } = req.body;

  try {
    const updateQuery = `
      UPDATE todo
      SET todo = '${todo}'
      WHERE id = ${id};
    `;

    await db.run(updateQuery);

    res.send({ message: "Todo Updated Successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to update todo" });
  }
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;

  await db.run(`
    UPDATE todo
    SET isCompleted = ${isCompleted}
    WHERE id = ${id};
  `);

  res.send({ message: "Todo Status Updated" });
});


module.exports = app;
