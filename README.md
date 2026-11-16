# School Student Data Entry Application

A modern and responsive full-stack CRUD application for managing school student records.

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas (via Mongoose)

## Project Structure
```
frontend/
  index.html
  style.css
  script.js

backend/
  package.json
  server.js
  db.js
  .env.example
  models/
    Student.js
  routes/
    studentRoutes.js
  controllers/
    studentController.js

database/
  school_management.sql
```

## Features
- Add, view, update, delete student records
- Form validation with error messages
- Search by student ID/name/parent/phone
- Sort by name, class, roll number, newest
- Filter by class and section
- Delete confirmation popup
- Responsive dashboard design for desktop/tablet/mobile

## API Endpoints
- `POST /api/add-student`
- `GET /api/students`
- `GET /api/students/:id`
- `PUT /api/update-student/:id`
- `DELETE /api/delete-student/:id`

## Optional SQLite schema
The `database/school_management.sql` file is separate from the MongoDB database used by the app. From the project root, run `sqlite3 school_management.db ".read database/school_management.sql"` to recreate the SQLite `students` table. This drops the existing table and all its records.

## Run Locally
1. Open terminal in project root.
2. Install backend dependencies:
   - `cd backend`
   - `npm install`
3. Configure environment variables:
   - `copy .env.example .env` (Windows PowerShell)
   - Update `MONGODB_URI` in `.env` with your MongoDB Atlas connection string
4. Start backend server:
   - `npm start`
5. Open browser:
   - `http://localhost:5000`

The backend serves the frontend automatically.
