<div align="center">

# 🎓 VEYRO

### *Next-Generation Full-Stack Distance Education & Learning Management Platform*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Rotation-FF6C37?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Veyro</b> is a production-engineered Learning Management System engineered with the MERN stack.<br/>
  Featuring server-authoritative anti-cheat assessments, real-time video progress verification, dynamic PDF certificate generation, and an ultra-modern dark glassmorphism interface.
</p>

[Explore Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-quick-start) • [API Reference](#-api-endpoints) • [Security](#-security-design)

---

</div>

## 🌟 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🛡️ Enterprise Authentication & RBAC</h3>
      <ul>
        <li>Dual-token authentication with short-lived access JWTs & automatic refresh rotation.</li>
        <li>Role-based access control for <b>Students</b>, <b>Instructors</b>, and <b>Admins</b>.</li>
        <li>Multi-device session revocation and per-device state.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>⏱️ Server-Authoritative Quiz Engine</h3>
      <ul>
        <li>Anti-cheat timer calculated strictly server-side (immune to client DOM tamper).</li>
        <li>Dynamic question and option permutation per attempt.</li>
        <li>Live tab-switch violation monitoring with automatic submission triggers.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 True Video Progress Auditing</h3>
      <ul>
        <li>Granular playback audit logging via HTML5 timeupdate streams.</li>
        <li>Non-gameable completion threshold (requires $\ge 90\%$ unique playback).</li>
        <li>Automatic timestamp resumption across devices.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📜 Dynamic Certificate Engine</h3>
      <ul>
        <li>On-the-fly programmatic vector PDF certificate generation via PDFKit.</li>
        <li>Unique cryptographic verification hash stamped on every certificate.</li>
        <li>Public, zero-auth verification portal for instant authenticity validation.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏛️ Architecture

```
Veyro/
├── 📁 frontend/               # React 18 + Vite SPA client
│   ├── src/
│   │   ├── api/              # Axios instance & token interceptors
│   │   ├── components/       # Design system (Navbar, Cards, Modals)
│   │   ├── pages/            # Dashboard, Catalog, Studio, Quiz, Certs
│   │   ├── routes/           # RoleRoute & ProtectedRoute wrappers
│   │   └── store/            # Zustand global reactive state
│   └── vite.config.js
│
└── 📁 backend/                # Express 5 API Server & Services
    ├── src/
    │   ├── config/           # MongoDB Atlas connection
    │   ├── controllers/      # Course, Auth, Quiz, Progress, Cert controllers
    │   ├── middleware/       # JWT Auth, Role Guard, Global Error Handler
    │   ├── models/           # Mongoose ODM schemas
    │   ├── routes/           # REST endpoint routers
    │   └── utils/            # JWT helpers, Multer storage, PDFKit engine
    ├── uploads/              # Local media storage (/videos, /pdfs, /certs)
    ├── server.js             # HTTP server entrypoint
    └── .env.example          # Environment blueprint
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **MongoDB**: Atlas Cluster URI or local instance

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template and fill secrets
cp .env.example .env

# (Optional) Seed initial administrator
npm run seed:admin

# Launch development server
npm run dev
```
> API runs on `http://localhost:5000`

---

### 3. Frontend Setup

```bash
# Navigate to frontend (in a separate terminal)
cd frontend

# Install dependencies
npm install

# Launch Vite HMR dev server
npm run dev
```
> Client runs on `http://localhost:5173` (with built-in API proxy to `:5000`)

---

## 📡 API Endpoints

<details>
<summary><b>View Key REST API Endpoints</b></summary>

<br/>

| Scope | Method | Route | Access | Purpose |
|---|:---:|---|:---:|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Register student or instructor |
| | `POST` | `/api/auth/login` | Public | Issue access & refresh token |
| | `POST` | `/api/auth/refresh` | Public | Rotate refresh token |
| | `POST` | `/api/auth/logout` | User | Revoke current device session |
| **Courses** | `GET` | `/api/courses` | Public | Browse course catalog |
| | `POST` | `/api/courses` | Instructor | Create course curriculum |
| | `PATCH` | `/api/courses/:id/review` | Admin | Approve / Reject course submission |
| | `POST` | `/api/courses/:id/enroll` | Student | Enroll in course |
| **Lessons** | `POST` | `/api/lessons/:id/progress` | Student | Stream granular video watch time |
| **Quizzes** | `POST` | `/api/quizzes/:id/start` | Student | Start timer-enforced quiz session |
| | `PATCH` | `/api/quizzes/attempts/:id/answer` | Student | Persist attempt answer |
| | `POST` | `/api/quizzes/attempts/:id/submit` | Student | Score attempt and finalize results |
| | `POST` | `/api/quizzes/attempts/:id/violation` | Student | Report tab-switch anti-cheat violation |
| **Verification** | `GET` | `/api/verify/:code` | Public | Validate issued PDF certificate authenticity |

</details>

---

## 🔒 Security & Resilience Design

- **Secret Safety**: Strict `.gitignore` boundaries protect all `.env` files and Atlas connection keys.
- **Server Authoritative**: Timer calculations, attempt deadlines, and score evaluations never rely on client state.
- **Pluggable Storage**: Multer relative disk storage design allows drop-in AWS S3 or Cloudinary adapters with zero schema migrations.

---

<div align="center">

Made with ❤️ for modern engineering.

**[⬆ Back to Top](#-veyro)**

</div>
