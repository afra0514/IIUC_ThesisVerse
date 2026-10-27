# IIUC ThesisVerse

A full-stack **MERN** (MongoDB Atlas, Express.js, React, Node.js) thesis supervision, research archive, and academic management portal developed for **International Islamic University Chittagong (IIUC)**.

---

## 🚀 Overview

**IIUC ThesisVerse** streamlines the undergraduate and graduate thesis lifecycle for both students and faculty members in the Department of Computer Science & Engineering (CSE) and Department of Electrical & Electronic Engineering (EEE).

### Key Features
- **Supervisor Directory & Live Slot Tracking**: Browse verified faculty profiles by research domain (NLP, Machine Learning, Computer Vision, Cybersecurity, IoT, Power Systems) with live open-slot availability.
- **Supervision Request Management**: Students can submit thesis proposals and group member details; supervisors can review, accept, or reject requests with feedback notes.
- **Personalized Dashboards**:
  - **Student Dashboard**: Track submitted requests, view supervisor decisions, manage saved guidelines and journal papers.
  - **Supervisor Dashboard**: Accept/reject incoming student requests, manage research slots, update public faculty profile.
- **AI Thesis Assistant**: Real-time intelligent chatbot answering student queries regarding faculty research areas, journal search portals, LaTeX/Overleaf packages, and defense rubrics.
- **Thesis & Defense Guidelines**: Official 3-stage defense criteria (Proposal Defense 30%, Pre-Defense 20%, Final Defense 50%), literature gap matrices, and academic profile tutorials (Google Scholar, ResearchGate, ORCID).
- **Template Hub**: Direct downloads for official IIUC thesis report (`.docx`), LaTeX package (`.zip`) with IEEE BibTeX styling, and defense slide decks (`.pptx`).
- **Journal Discovery Portals**: Direct query links into IEEE Xplore, ScienceDirect, SpringerLink, Scopus, arXiv, and Google Scholar with predatory journal guidance.
- **Independent Admin Panel (`/admin`)**: Analytics dashboard, complete student and supervisor user CRUD management, dynamic guidelines/templates/journals manager, and admin account settings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **API Architecture** | RESTful JSON APIs with CORS and role-based middleware |

---

## 📁 Project Structure

```
IIUC_Thesis_Verse/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # Mongoose MongoDB Atlas connection
│   │   │   └── seed.js           # Default admin, faculty, & guidelines seeder
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── bookmarkController.js
│   │   │   ├── chatController.js
│   │   │   ├── contentController.js
│   │   │   ├── notificationController.js
│   │   │   ├── requestController.js
│   │   │   └── supervisorController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT & role verification (admin, supervisor, student)
│   │   │   └── errorHandler.js   # Centralized error handler
│   │   ├── models/
│   │   │   ├── Bookmark.js
│   │   │   ├── Guideline.js
│   │   │   ├── Journal.js
│   │   │   ├── Notification.js
│   │   │   ├── SupervisionRequest.js
│   │   │   ├── SupervisorProfile.js
│   │   │   ├── Template.js
│   │   │   └── User.js
│   │   ├── routes/               # Express REST route definitions
│   │   └── index.js              # Server entry point
│   ├── .env                      # Environment variables (git-ignored)
│   ├── .env.example              # Example environment template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── downloads/            # DOCX, ZIP, and PPTX thesis templates
│   │   └── images/
│   ├── src/
│   │   ├── admin/                # Dedicated Admin Single Page App
│   │   │   ├── pages/            # Overview, Users, Guidelines, Templates, Journals, Settings
│   │   │   ├── AdminApp.jsx
│   │   │   └── AdminLogin.jsx
│   │   ├── components/           # Modular React components
│   │   ├── context/              # AuthContext, AppDataContext, ContentContext, ChatContext
│   │   ├── data/                 # Initial reference dataset
│   │   ├── services/
│   │   │   ├── api.js            # Centralized API service client
│   │   │   ├── adminApi.js       # Admin portal API bridge
│   │   │   └── mockDb.js         # Reactive cross-tab synchronizer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── admin.html                # Admin portal HTML entry
│   ├── index.html                # Public portal HTML entry
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── .env.example
├── package.json                  # Root npm scripts
└── README.md
```

---

## ⚙️ Environment Setup

### 1. Backend Configuration
Create a `.env` file in the `backend/` folder (or copy from `backend/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@mern1.fethu.mongodb.net/iiuc_thesisverse?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

> **Note**: Credentials must never be committed to Git. The `.env` file is excluded in `.gitignore`.

### 2. Frontend Configuration
Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Installation & Running Locally

### Step 1: Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*Or install separately:*
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start the Backend Server
```bash
cd backend
npm run dev
# or
npm start
```
The backend server runs at `http://localhost:5000`. On first launch, it connects to MongoDB Atlas and seeds default admin, supervisor profiles, guidelines, templates, and journal portals automatically.

### Step 3: Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

### Step 4: Build for Production
```bash
cd frontend
npm run build
```

---

## 🔑 Default Credentials

### Admin Control Panel (`http://localhost:5173/admin`)
- **Email**: `admin@iiuc.ac.bd`
- **Password**: `Admin@12345`

### Student Demo Registration
Students can register directly via the **Sign In → New Registration** modal on the website homepage:
- **Role**: Student
- **Student ID**: e.g., `C223001`
- **Email**: e.g., `student@ugrad.iiuc.ac.bd`
- **Password**: Minimum 6 characters

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register student or supervisor | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update user account & supervisor profile | Authenticated |

### Supervision Requests (`/api/requests`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/requests` | List user's supervision requests | Authenticated |
| `POST` | `/api/requests` | Submit a new supervision request | Students |
| `PATCH`| `/api/requests/:id/status` | Accept or reject request with feedback | Supervisors |

### Supervisors (`/api/supervisors`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/supervisors` | Get all supervisors with live slot counts | Public |
| `GET` | `/api/supervisors/:id` | Get individual supervisor details | Public |
| `PUT` | `/api/supervisors/:id` | Update supervisor profile details | Supervisors / Admin |

### Dynamic Content (`/api/content/:kind`)
*(kind: `guidelines` \| `templates` \| `journals`)*
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/content/:kind` | Get sorted items for specified kind | Public |
| `POST` | `/api/content/:kind` | Create or update content item | Admin |
| `POST` | `/api/content/:kind/move` | Reorder item up or down | Admin |
| `POST` | `/api/content/:kind/reset` | Reset kind to official IIUC defaults | Admin |
| `DELETE`| `/api/content/:kind/:id` | Delete content item | Admin |

### Admin Management (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/admin/login` | Admin authentication | Public |
| `GET` | `/api/admin/session` | Validate admin session | Admin |
| `PUT` | `/api/admin/account` | Update admin account details & password | Admin |
| `GET` | `/api/admin/stats` | Retrieve live system statistics | Public / Admin |
| `GET` | `/api/admin/users` | List all registered students & supervisors | Admin |
| `POST` | `/api/admin/users` | Create user account from admin panel | Admin |
| `PUT` | `/api/admin/users/:id` | Edit user account from admin panel | Admin |
| `DELETE`| `/api/admin/users/:id`| Remove user and clean up dependencies | Admin |

### Notifications & AI Assistant
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | Fetch user's notification feed | Authenticated |
| `PATCH`| `/api/notifications/:id/read` | Mark individual notification as read | Authenticated |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read | Authenticated |
| `POST` | `/api/chat` | AI chatbot domain search & recommendations | Public |
| `GET` | `/api/bookmarks` | Fetch student's bookmarked items | Authenticated |
| `POST` | `/api/bookmarks` | Persist student bookmarks in MongoDB | Authenticated |

---

## 🔒 Security & Data Integrity
1. **Password Hashing**: User and admin passwords are encrypted with `bcryptjs` salt rounds before persisting to MongoDB Atlas.
2. **Credential Safety**: No production passwords or connection strings are tracked by Git. `.env` is ignored across root, frontend, and backend.
3. **Database Isolation**: The application exclusively operates in its designated MongoDB Atlas database (`iiuc_thesisverse`) and never mutates or drops other databases on the cluster.
