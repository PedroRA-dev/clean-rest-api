# clean-rest-api

Minimal Express REST API with CRUD, Zod validation, consistent error responses, pagination and basic filtering.

## Run
```bash
npm install
npm run dev
Health:

curl http://localhost:3000/health
Endpoints
Create:

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","status":"todo"}'
List (pagination + filters):

curl "http://localhost:3000/tasks?page=1&limit=5&status=todo&search=buy&sortBy=createdAt&order=desc"
Get by id:

curl http://localhost:3000/tasks/<TASK_ID>
Update:

curl -X PATCH http://localhost:3000/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'
Delete:

curl -i -X DELETE http://localhost:3000/tasks/<TASK_ID>
Error format
{
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid request", "details": [] }


