<div align="center">

# 🎓 VEYRO LMS
### *Enterprise Learning Management System with Cryptographic Verification & Proctored Assessment Engine*

[![Production Frontend](https://img.shields.io/badge/Production%20Web-veyroofficial.vercel.app-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://veyroofficial.vercel.app/)
[![Production API](https://img.shields.io/badge/Production%20API-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://veyro-y6gj.onrender.com/api/health)
[![Test Suite](https://img.shields.io/badge/E2E%20Verification-80%2F80%20Passed-00C853?style=for-the-badge&logo=jest&logoColor=white)](#-automated-verification--test-suite)
[![License](https://img.shields.io/badge/License-ISC-3B82F6?style=for-the-badge)](LICENSE)

<br/>

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Dual_Token_Rotation-FF6C37?style=flat-square&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

<p align="center">
  <b>Veyro</b> is an enterprise-engineered, full-stack Learning Management System designed for academic institutions, corporate academies, and modern technical bootcamps.<br/>
  Engineered with a secure MERN architecture featuring <b>server-authoritative anti-cheat assessments</b>, <b>granular 90% video playback verification</b>, <b>cryptographic SHA-256 certificate generation</b>, and a dedicated <b>Student Profile Dashboard</b>.
</p>

[Live Application](https://veyroofficial.vercel.app/) • [Student Portal](#-1-student-experience--learning-portal) • [Instructor Studio](#-2-instructor-studio--faculty-workspace) • [Administrator Suite](#-3-administrator-governance--compliance) • [Anti-Cheat Engine](#-live-cheating-detection--proctored-assessment-suite) • [Quick Start](#-quick-start)

---

</div>

## 🌐 Production Deployments

| Component | Provider | Live URL | Status |
|---|---|---|:---:|
| **Official Frontend** | Vercel Edge | [`https://veyroofficial.vercel.app`](https://veyroofficial.vercel.app) | `ONLINE` |
| **Backend REST API** | Render Web Service | [`https://veyro-y6gj.onrender.com/api`](https://veyro-y6gj.onrender.com/api) | `ONLINE` |
| **System Health Check** | Render Automated | [`https://veyro-y6gj.onrender.com/api/health`](https://veyro-y6gj.onrender.com/api/health) | `HEALTHY` |
| **Database Cluster** | MongoDB Atlas | AWS us-east-1 Replica Set | `CONNECTED` |

---

## 🏛️ Comprehensive Role Architecture

Veyro implements three strictly isolated, role-based workflows designed for complete educational lifecycle management.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              VEYRO LMS                                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  STUDENT PORTAL  │      │INSTRUCTOR STUDIO │      │  ADMIN CONSOLE   │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│• Interactive UI  │      │• Curriculum Edit │      │• Audit Ledger    │
│• Video 90% Audit │      │• Grade Targeting │      │• Moderation Flow │
│• Anti-Cheat Quiz │      │• Safe Versioning │      │• User Governance │
│• SHA-256 Diplomas│      │• Cohort Roster   │      │• CSV/JSON Export │
│• AI Study Mentor │      │• Quiz Creation   │      │• IP Limiter Mgmt │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

### 🎓 1. Student Experience & Learning Portal

Designed with an executive, modern SaaS interface tailored for focused learning, self-paced progress tracking, and peer discovery:

* **Executive Student Profile Dashboard (`/profile`)**:
  * **Real-time Statistics**: Circular progress indicator with level badge, monthly activity percentage breakdown, and three instant KPI metric cards (*In progress*, *Upcoming*, and *Completed*).
  * **Enrolled Courses Carousel**: Interactive course cards showing completion percentages, class milestones, and assigned mentor credentials.
  * **Weekly Study Process Graph**: Multi-metric vertical visualization benchmarking *Engage* (66%), *Grow* (40%), highlighted *Skills* mastery (87%), and *Completion Rate* (56%).
  * **Integrated AI Study Assistant**: Interactive contextual study assistant that answers curriculum questions, highlights exam guidelines, and reviews anti-cheat rules.
  * **Student Directory**: Instant access to peer student profiles, academic grade levels, verified hobbies, and learning tracks.
* **Onboarding & Grade Alignment**:
  * Multi-step onboarding upon student registration: Legal name verification (for official diplomas), academic class selection (Grade 6 through Undergraduate & Professional), and passion/hobby tags.
* **Granular 90% Video Watch Verification**:
  * Client sends periodic playback heartbeat telemetry. The server guarantees completion **only** when unique watch time reaches $\ge 90\%$ of total video duration.
  * Eliminates video skipping or scrub manipulation; auto-resumes playback across multiple devices.
* **Cryptographic SHA-256 PDF Certificates**:
  * Programmatically generated single-page PDF diploma via `PDFKit` upon satisfying 100% lesson and quiz completion criteria.
  * Features a cryptographic verification code and direct public QR/link verification at `/api/verify/:code`.
* **Safe Enrollment Lifecycle**:
  * One-click course enrollment, historical progress preservation on drop, and race-condition-free re-activation.

---

### 👨‍🏫 2. Instructor Studio & Faculty Workspace

A comprehensive curriculum authoring and cohort analytics suite for educators and course creators:

* **Modular Curriculum Builder**:
  * Author multi-chapter courses containing high-definition video lectures, downloadable PDF course packs, and formatted rich-text articles.
  * Define structured learning objectives, course prerequisites, pricing, tags, and category classifications.
* **Target Grade & Class Assignment**:
  * Explicitly assign courses to specific academic grades (*All Grades*, *Grade 6* through *Grade 12*, *Undergraduate*, or *Professional / Lifelong*).
  * Enables institutions to tailor curricula directly to appropriate age and skill cohorts.
* **Safe Course Versioning & Retraction**:
  * **Mutation Prevention**: Published courses cannot be accidentally altered or broken while students are enrolled.
  * **Branching Revisions (v1 &rarr; v2)**: Clone published courses into new draft revisions, update curriculum content, and publish without resetting or invalidating active learner progress.
  * **Submission Retraction**: Recall submissions from moderation back to draft status at any time before admin approval.
* **Cohort Roster & Analytics Engine**:
  * Real-time roster tracking showing student enrollment statuses (*active*, *completed*, *dropped*).
  * Cohort progress distribution, quiz submission breakdown, average scores, and individual attempt inspection.

---

### 🛡️ 3. Administrator Governance & Compliance

A robust governance suite for academic boards, university registrars, and platform administrators:

* **Curriculum Moderation Pipeline**:
  * Centralized approval queue for submitted instructor courses.
  * Formal audit trail with mandatory documented reason required for any course rejection.
* **Immutable Append-Only Audit Ledger**:
  * Cryptographic audit log tracking every critical event: authentication lifecycle, course creation/edits/submissions, review actions, user status changes, and quiz submissions.
  * Strictly append-only design prevents ledger modification by any user role.
* **Compliance Data Export**:
  * One-click streaming export of platform audit records to standard **CSV** and **JSON** formats with automated sanitization of sensitive metadata.
* **User & Security Management**:
  * Global user directory with instant account activation/deactivation toggles.
  * Reverse proxy trust configuration (`trust proxy: 1`) preventing false-positive rate limiting lockouts across shared network gateways.

---

## 🕵️‍♂️ Live Cheating Detection & Proctored Assessment Suite

Veyro provides an assessment framework engineered to prevent cheating and protect academic integrity:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SERVER-AUTHORITATIVE ANTI-CHEAT                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌──────────────────┐
│ SERVER TIMER  │          │ FISHER-YATES  │          │ TAB-SWITCH & BLUR│
├───────────────┤          ├───────────────┤          ├──────────────────┤
│• MongoDB clock│          │• Per-attempt  │          │• Page blur event │
│• Strict limit │          │  permutation  │          │• Counter tracked │
│• Auto-submit  │          │• Options hide │          │• Instant forced  │
│  on expiry    │          │  answer key   │          │  submission      │
└───────────────┘          └───────────────┘          └──────────────────┘
```

1. **Server-Authoritative Clock & Deadlines**:
   * Assessment time limits are computed and locked on the backend at `startedAt`.
   * Client-side clock tampering, browser freezing, or DOM manipulation cannot extend the examination deadline. Submissions received after the server deadline are scored as expired.
2. **Fisher-Yates Algorithmic Randomization**:
   * Every quiz attempt undergoes cryptographic question and option permutation using the Fisher-Yates shuffle algorithm.
   * Neighboring students never receive the same question sequence or identical option letter assignments ($A, B, C, D$).
3. **Correct-Answer Masking (Zero-Knowledge Client Payload)**:
   * The quiz payload served to students completely strips and redacts `correctOptionIndex`. It is physically impossible to retrieve the answer key by inspecting browser DevTools or network payloads.
4. **Live Tab-Switch & Blur Violation Telemetry**:
   * The examination client attaches HTML5 visibility and window blur listeners.
   * Switching tabs, opening unauthorized windows, or losing browser focus sends an immediate violation ping to the backend.
   * If violations exceed the configured threshold, the server automatically terminates the attempt, calculates the current score, and locks the quiz.
5. **Single-Attempt Enforcement & IDOR Protection**:
   * Prevents parallel session exploitation. Quizzes validate attempt limits and enforce instructor ownership validation on all grading endpoints.

---

## 💻 Tech Stack & Infrastructure

```
Frontend:
├── React 19 (TypeScript)
├── Vite 8.2 (Fast HMR & Optimized Chunks)
├── Tailwind CSS v4 (High-Performance Modern Styling)
├── Zustand (Predictable State Management)
├── Lucide React (Executive Iconography)
└── Axios (Authenticated Interceptors & Token Rotation)

Backend:
├── Node.js 20+ LTS
├── Express 5 (Modern REST Architecture)
├── MongoDB Atlas (Mongoose 8 ODM)
├── JSON Web Tokens (RS256/HS256 Dual Token Rotation)
├── PDFKit (Dynamic Vector PDF Diploma Engine)
├── Express Rate Limit (Tiered IP & Auth Protection)
└── Multer (Modular Asset Storage & Proxying)
```

---

## 🧪 Automated Verification & Test Suite

Veyro includes a comprehensive automated test harness covering end-to-end workflows:

```bash
# Run the complete verification test suite
cd backend
node test_suite.js
```

### ✅ Verification Results (80/80 Tests Passing)

* **Group 1**: Authentication & JWT Lifecycle (4/4 passed)
* **Group 2**: RBAC Server-Side Middleware (3/3 passed)
* **Group 3**: Granular Video Progress & 90% Audit Engine (4/4 passed)
* **Group 4**: Quiz Anti-Cheat Engine & Server-Side Scoring (7/7 passed)
* **Group 5**: Course Completion & Certificate Eligibility (3/3 passed)
* **Group 6**: Dynamic PDF Certificate & Verification (1/1 passed)
* **Group 7**: Course Submission & Lifecycle Security (3/3 passed)
* **Group 8**: Course Visibility & Catalog Security (2/2 passed)
* **Group 9**: Admin Moderation & Status Engine (3/3 passed)
* **Group 10**: Course Analytics & Learner Cohort Metrics (5/5 passed)
* **Group 11**: Immutable Platform Audit Log & RBAC Security (6/6 passed)
* **Group 12**: Enrollment Lifecycle & Roster Metrics (6/6 passed)
* **Group 13**: Course Retraction, Versioning & Learner Safety Engine (6/6 passed)
* **Group 14**: Server-Authoritative IDOR & Actor Security (3/3 passed)
* **Group 15**: Platform Notifications & Real-Time Alert Engine (9/9 passed)
* **Group 16**: Audit Log Export & Compliance Engine (6/6 passed)
* **Group 17**: Course Revision Lifecycle & Learner Invariance (4/4 passed)
* **Group 18**: Render Production Readiness & Health Monitoring (5/5 passed)

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0+` or `v20.0.0+`
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env
npm run dev
```
> Server runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Application launches on `http://localhost:5173`

---

## 👥 Default Platform Credentials

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Administrator** | `admin@veyro.com` | `Admin@123` | `/dashboard` (Admin Audit & Review Console) |
| **Instructor** | `preetham@gmail.com` | *(Registered password)* | `/dashboard` (Instructor Studio & Course Builder) |
| **Student** | `student@veyro.com` | `Student@123` | `/profile` & `/dashboard` (Learning Roadmap & AI Assistant) |

---

<div align="center">

Built with precision for world-class technical education.

**[⬆ Back to Top](#-veyro-lms)**

</div>
