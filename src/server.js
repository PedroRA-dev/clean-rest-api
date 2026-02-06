const express = require("express");
const cors = require("cors");
const { validate } = require("./validate");
const { httpError } = require("./errors");
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} = require("./schemas");

const { errorHandler } = require("./errors");

const app = express();

app.use(cors());
app.use(express.json());

const { randomUUID } = require("crypto")
// "Base de datos" en memoria
let tasks = [];

// Helper: buscar por id
function findTaskIndexById(id) {
  return tasks.findIndex((t) => t.id === id);
}


app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    })
})

app.post("/tasks", validate({ bodySchema: createTaskSchema }), (req, res) => {
  const { title, status } = req.body;

  const task = {
    id: randomUUID(),
    title,
    status: status ?? "todo",
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});


app.get("/tasks", validate({ querySchema: listTasksQuerySchema }), (req, res) => {
  // Force-parse here to guarantee defaults + correct types
  const parsedQuery = listTasksQuerySchema.parse(req.query);

  const { page, limit, status, search, sortBy, order } = parsedQuery;

  // 1) Filter
  let filtered = [...tasks];

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
  }

  // 2) Sort
  filtered.sort((a, b) => {
    let av = a[sortBy];
    let bv = b[sortBy];

    if (sortBy === "createdAt") {
      av = new Date(av).getTime();
      bv = new Date(bv).getTime();
    } else {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }

    if (av < bv) return order === "asc" ? -1 : 1;
    if (av > bv) return order === "asc" ? 1 : -1;
    return 0;
  });

  // 3) Paginate
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({
    data,
    meta: { page, limit, total, totalPages },
  });
});

app.get("/tasks/:id", (req, res, next) => {
  const { id } = req.params;

  const task = tasks.find((t) => t.id === id);
  if (!task) return next(httpError(404, "NOT_FOUND", "Task not found"));

  res.json(task);
});

app.patch(
  "/tasks/:id",
  validate({ bodySchema: updateTaskSchema }),
  (req, res, next) => {
    const { id } = req.params;

    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return next(httpError(404, "NOT_FOUND", "Task not found"));

    tasks[idx] = { ...tasks[idx], ...req.body };
    res.json(tasks[idx]);
  }
);

app.delete("/tasks/:id", (req, res, next) => {
  const { id } = req.params;

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return next(httpError(404, "NOT_FOUND", "Task not found"));

  tasks.splice(idx, 1);
  res.status(204).send();
});









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});

// 404 not found
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});


app.use(errorHandler);
