# Backend - Hostel Leave Management System (HLMS)

This is the backend for the **Hostel Leave Management System**, built with **Node.js, Express.js, and PostgreSQL**. It serves as the secure RESTful API powering the 48+ screens of the frontend, supporting Student, Parent, Warden, and Admin portals.

---

## 🌟 Core Features

- **PostgreSQL Database with Auto-Bootstrap**: Automatically creates tables and seeds default data on the first run.
- **Offline Mock Fallback (File DB)**: If the PostgreSQL server is unreachable or `DATABASE_URL` is omitted, the system seamlessly transitions to using an offline persistent JSON file (`config/db.json`).
- **Secure JWT Authentication**: Role-based access control protecting all routes via secure JWT session issuing.
- **Password Cryptography**: Passwords are fundamentally secured and hashed with `bcryptjs`.
- **Modular Route Structure**: 40+ API endpoints strictly logically separated into domain folders (e.g. `leaveRoutes`, `studentRoutes`, `qrPassRoutes`).
- **Built-in Swagger Documentation**: View live API endpoint documentation dynamically generated from the source via `swagger-ui-express`.

---

## 💻 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (interfaced via `pg`)
- **Security**: JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), CORS
- **Email/Notifications**: Nodemailer

---

## 🚀 Getting Started

### 1. Installation

Navigate into the backend directory and install all node modules:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend/` root directory (if it doesn't already exist) and configure it as needed. For example:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://user:password@localhost:5432/hostel_leave_db
```
*(If `DATABASE_URL` is not provided, the server will automatically start in offline mock database mode using `config/db.json`!)*

### 3. Run the Server

To start the server in development mode (with hot reloading via nodemon):

```bash
npm run dev
```

To run in production mode:
```bash
npm start
```

The server should now be running on `http://localhost:5000`.

---

## 📖 API Documentation

The backend includes a fully built-in Swagger UI to explore and test the endpoints. Once the server is running, you can access the interactive API docs at:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 📂 Project Structure

```bash
backend/
├── config/
│   ├── db.js         # Connection pooling, DB initialization, Mock DB Fallback logic
│   └── db.json       # The persistent mock JSON database file
├── controllers/      # Handles business logic for API endpoints
├── middleware/       # JWT Auth verification (`authMiddleware.js`)
├── routes/           # Express router files mapped to endpoints
├── scripts/          # Utilities, e.g. `seed.js`
├── server.js         # Main server bootstrap entrypoint
└── package.json      # Dependencies and scripts
```
