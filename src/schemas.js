const { z } = require("zod");

const TaskStatus = z.enum(["todo", "doing", "done"]);

// Body: crear task
const createTaskSchema = z.object({
  title: z.string().min(3).max(80),
  status: TaskStatus.optional(),
});

// Body: actualizar task (parcial)
const updateTaskSchema = z.object({
  title: z.string().min(3).max(80).optional(),
  status: TaskStatus.optional(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "At least one field must be provided",
});

// Query: listar tasks (paginación + filtros + sort + search)
const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: TaskStatus.optional(),
  search: z.string().min(1).max(80).optional(),
  sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
};
