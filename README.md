🛠️ Attendance & Task Management API (Backend)

A secure REST API for attendance tracking and task management built with Node.js, Express, TypeScript, and MongoDB.

🚀 Tech Stack

Runtime: Node.js (v18+)

Framework: Express.js

Language: TypeScript

Database: MongoDB (Mongoose ODM)

Authentication: JWT

Validation: Zod

Security: Helmet, CORS, bcryptjs, express-rate-limit

Logging: Winston

✨ Features
🔐 Authentication

JWT-based authentication

Password hashing (bcrypt – 12 salt rounds)

Email validation

Protected routes middleware

🗓️ Attendance System

Daily check-in / check-out

No duplicate attendance per day (compound unique index)

Attendance history with pagination

✅ Task Management

CRUD operations

Status tracking (pending, in_progress, completed, cancelled)

Priority levels (low, medium, high)

Filtering & sorting

Due date management

🗄️ Database Schema
Users Collection
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  full_name: String,
  role: String,
  is_active: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Attendance Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  check_in_time: Date,
  check_out_time: Date,
  date: String,
  status: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}


✅ Unique index on (user_id, date)

Tasks Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  description: String,
  status: String,
  priority: String,
  due_date: Date,
  completed_at: Date,
  createdAt: Date,
  updatedAt: Date
}

🔒 Security Features

Bcrypt password hashing

JWT token expiration

Helmet security headers

CORS configuration

Rate limiting (100 req / 15 min)

Zod request validation

Environment-based configuration

⚙️ Setup Instructions
1️⃣ Install Dependencies
cd backend
npm install

2️⃣ Configure Environment Variables

Create .env file:

PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

3️⃣ Build & Run
npm run build
npm run dev


Server runs at:

http://localhost:5000

📚 API Base URL
http://localhost:5000/api

🔐 Authentication Endpoints
POST /auth/signup
POST /auth/login
GET /auth/profile (Protected)
🗓️ Attendance Endpoints

POST /attendance/checkin

POST /attendance/checkout

GET /attendance/today

GET /attendance/history

✅ Task Endpoints

POST /tasks

GET /tasks

GET /tasks/:id

PUT /tasks/:id

DELETE /tasks/:id

🚀 Deployment
Render.com

Build Command:

npm install && npm run build


Start Command:

npm start


Add environment variables in Render dashboard.