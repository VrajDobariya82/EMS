# EMS Backend (Node/Express + MongoDB)

## Setup
1. Create env file:
   - Create a file named `.env` in `backend/` with:
   
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ems
   JWT_SECRET=change_me_to_a_long_random_string
   CORS_ORIGIN=http://localhost:3000
   ```
2. Install deps:
   ```bash
   cd backend
   npm install
   ```
3. Run dev:
   ```bash
   npm run dev
   ```
   API at http://localhost:5000

## Endpoints
- Auth
  - POST /api/auth/signup { name, email, password, role }
  - POST /api/auth/login { email, password } -> { token, user }
- Employees (JWT)
  - GET /api/employees
  - POST /api/employees (Admin/HR/Manager)
  - PUT /api/employees/:id
  - DELETE /api/employees/:id (Admin/HR/Manager)
- Attendance (JWT)
  - GET /api/attendance/:email
  - POST /api/attendance/:email { date, status, clockIn, clockOut }
- Leaves (JWT)
  - POST /api/leaves
  - GET /api/leaves (Admin/HR/Manager)
  - GET /api/leaves/mine/:email
  - PUT /api/leaves/:id/status { status, adminJustification } (Admin/HR/Manager)
- Meetings (JWT)
  - POST /api/meetings (Admin/HR/Manager)
  - PUT /api/meetings/:id (Admin/HR/Manager)
  - DELETE /api/meetings/:id (Admin/HR/Manager)
  - GET /api/meetings (Admin/HR/Manager)
  - GET /api/meetings/mine/:email

Include header: `Authorization: Bearer <token>`

