import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const dbFile = path.join(__dirname, "data", "todos.json");
const adapter = new JSONFile(dbFile);

// Pass default data as the second argument to Low
const db = new Low(adapter, { todos: [] });

await db.read();
// db.data is already initialized to the default if file is empty/nonexistent
db.data ||= { todos: [] };

app.get("/todos", async (req, res) => {
  await db.read();
  res.json(db.data.todos);
});

app.post("/todos", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const newTodo = { id: Date.now(), text };
  db.data.todos.push(newTodo);
  await db.write();
  res.json(newTodo);
});

app.delete("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  db.data.todos = db.data.todos.filter(t => t.id !== id);
  await db.write();
  res.status(204).send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));