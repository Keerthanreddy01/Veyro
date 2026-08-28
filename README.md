# Veyro — Full-Stack Distance Learning & Education Platform (MERN)

Veyro is an enterprise-grade, modern Learning Management System (LMS) engineered with the MERN stack. It features role-based access control (Student, Instructor, Admin), interactive courses, server-authoritative quiz engines with anti-cheat detection, accurate video progress tracking, and automated cryptographic certificate issuance.

---

## 🌟 Key Features

- **🛡️ Secure Multi-Role Authentication**: JWT access and refresh token rotation with multi-device session management and role-based route protection.
- **📚 Interactive Course Management**: Instructors can author multi-module courses with video lessons, downloadable PDF resources, and quizzes.
- **⏱️ Server-Authoritative Quiz Engine**: Anti-cheat protection with server-side countdown timers, question/option shuffling, and tab-switch violation tracking.
- **📊 Real Video Progress Tracking**: Granular playback tracking preventing false completions — students must watch $\ge 90\%$ of lesson content.
- **🎓 Automated Certificate Generation & Verification**: Dynamic PDF certificate issuance with unique verification codes and a public verification portal.
- **⚡ Modern Dark-Themed UI**: Built with React 18, Vite, Tailwind CSS, Lucide icons, and responsive layouts.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS & Glassmorphism design tokens
- **Routing**: React Router v6+
- **State Management**: Zustand
- **HTTP Client**: Axios (with automatic token refresh interceptors)
- **Icons & Feedback**: Lucide React & React Hot Toast

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: Access Tokens (15m) + Refresh Tokens (7d) with Bcrypt hashing
- **File & Media Handling**: Multer local storage engine (structured for seamless S3/Cloudinary migration)
- **Document Generation**: PDFKit

---

## 📁 Repository Structure

```
Veyro/
├── frontend/                     # React + Vite client application
│   ├── src/
│   │   ├── api/                  # Axios instance and request interceptors
│   │   ├── components/           # Reusable UI components (Navbar, etc.)
│   │   ├── pages/                # Application pages (Dashboard, Courses, Quiz, etc.)
│   │   ├── routes/               # Role-based protected routes
│   │   ├── store/                # Zustand global state (authStore)
│   │   ├── App.jsx               # Main application routing
│   │   └── main.jsx              # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express API server
│   ├── src/
│   │   ├── config/               # Database connection configuration
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Auth, role authorization, error handling
│   │   ├── models/               # Mongoose schemas (User, Course, Quiz, etc.)
│   │   ├── routes/               # Express API endpoints
│   │   ├── scripts/              # Database seeding scripts (admin creation)
│   │   ├── utils/                # JWT helpers, file upload, certificate generator
│   │   └── app.js                # Express app setup and middleware configuration
│   ├── uploads/                  # Uploaded videos, PDFs, thumbnails, certificates
│   ├── server.js                 # HTTP server entry point
│   ├── .env.example              # Template for environment variables
│   └── package.json
│
├── .gitignore                    # Global git ignore definitions
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local MongoDB instance

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   JWT_ACCESS_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. *(Optional)* Seed an initial Admin user:
   ```bash
   npm run seed:admin
   ```

5. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`. Requests to `/api/*` and `/static/*` will be proxied to the backend automatically.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student or instructor |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT tokens |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke device session |
| `GET` | `/api/courses` | Public | Fetch published course catalog |
| `POST` | `/api/courses` | Instructor | Create new course draft |
| `PATCH` | `/api/courses/:id/submit` | Instructor | Submit course for admin review |
| `PATCH` | `/api/courses/:id/review` | Admin | Approve or reject course |
| `POST` | `/api/courses/:id/enroll` | Student | Enroll in a published course |
| `POST` | `/api/lessons/:id/progress` | Student | Track granular video playback |
| `POST` | `/api/quizzes/:id/start` | Student | Initialize timed quiz session |
| `PATCH` | `/api/quizzes/attempts/:id/answer` | Student | Record attempt answer |
| `POST` | `/api/quizzes/attempts/:id/submit` | Student | Submit quiz attempt for scoring |
| `POST` | `/api/quizzes/attempts/:id/violation` | Student | Report tab switch violation |
| `GET` | `/api/verify/:code` | Public | Verify authenticity of completion certificate |
| `GET` | `/api/health` | Public | API health check status |

---

## 🔒 Security & Best Practices

- **Secret Safety**: Environment files (`.env`, `atlas-credentials.env`) are strictly git-ignored.
- **Server Validation**: All quiz answers, deadlines, and video completion metrics are validated on the server.
- **Isolated Storage**: Local media uploads are isolated in `backend/uploads/` with gitkeep markers and can be switched to cloud storage without DB schema modifications.

---

## 📜 License

This project is licensed under the ISC License.
