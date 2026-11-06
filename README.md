# Academy Management System (AMS)

A complete, production-grade, locally hosted **Academy Management System (AMS)** built with the **MERN architecture principles**, using an **Excel Workbook (.xlsx) as the primary database source of truth**.

Developed for managing academy admissions, students, courses, batches, attendance registers, corporate recruiters, job requirements, student placement pipelines, HR follow-ups, and executive analytics.

---

## 🚀 Key Highlights & Architectural Strengths

- **Excel as Primary Source of Truth**: Data is read from and persisted directly to `database/Academy_Database.xlsx` using **ExcelJS**.
- **Concurrency & Concurrency Protection**: Built-in sequential write lock queue ensures single-writer atomic updates and eliminates file corruptions.
- **Automated Dated Backups**: Automatic timestamped backup snapshots are generated in `backups/` before any write operation.
- **Safety First (Zero Accidental Data Loss)**: Records are soft-deleted/archived rather than permanently deleted, preserving all historical placement and attendance logs.
- **Dynamic Real-Time Dashboard**: All 13+ metrics, KPI charts, and operational queues are calculated dynamically from workbook sheets.
- **Complete End-to-End Test Suite**: 100% verified with automated end-to-end integration tests.

---

## 📁 System Architecture & Directory Layout

```
C:\VTECH\TrainingCode\
├── backend/
│   ├── config/
│   │   └── config.js            # Ports, JWT, Paths to Excel & Backups
│   ├── controllers/
│   │   ├── authController.js        # Admin login, JWT, password management
│   │   ├── dashboardController.js   # Dynamic KPI computations & charts
│   │   ├── studentController.js     # Training & Placement Admissions, CRUD, Excel Export
│   │   ├── courseController.js      # Curriculum & tech tracks
│   │   ├── batchController.js       # Batches, trainer assignments, student transfers
│   │   ├── attendanceController.js  # Daily register, duplicate prevention, monthly report
│   │   ├── companyController.js     # Hiring partners directory & placement records
│   │   ├── requirementController.js # Month-wise openings, criteria, vacancy tracking
│   │   ├── applicationController.js # Placement pipeline workflow (Applied -> Selected)
│   │   ├── followupController.js    # HR communication tracker (24h / 48h rules)
│   │   ├── reportsController.js     # Audit matrices and Excel downloads
│   │   └── backupController.js      # Workbook integrity & 1-click restore
│   ├── middleware/
│   │   └── auth.js              # Bearer token JWT verification
│   ├── routes/                  # Express REST API routes
│   ├── services/
│   │   └── excelService.js      # Centralized ExcelJS database engine
│   ├── scripts/
│   │   ├── initDatabase.js      # Database generator & initial seed data
│   │   └── testE2E.js           # Comprehensive automated API & Excel test suite
│   ├── server.js                # Express app entry point (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & session provider
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Collapsible sidebar, header, active route pill
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Styled admin portal login
│   │   │   ├── DashboardPage.jsx # Metrics cards, Recharts visualizations, operational queues
│   │   │   ├── AdmissionsPage.jsx# Training vs Placement admission portal
│   │   │   ├── StudentsPage.jsx # Search, filter, modal forms, profile drawer, export
│   │   │   ├── CoursesPage.jsx  # Curriculum tracks & enrolled cohorts
│   │   │   ├── BatchesPage.jsx  # Batch schedule, student assignment, transfer modal
│   │   │   ├── AttendancePage.jsx # Daily register, quick toggles, monthly grid
│   │   │   ├── CompaniesPage.jsx# Partner company directory & hiring stats
│   │   │   ├── RequirementsPage.jsx # Job openings, deadlines, vacancy monitor
│   │   │   ├── ApplicationsPage.jsx # Workflow stage tracking (Applied to Selected)
│   │   │   ├── FollowupsPage.jsx# HR follow-up tracker with overdue indicators
│   │   │   ├── ReportsPage.jsx  # Analytics tabs with date filters & Excel export
│   │   │   └── SettingsPage.jsx # Workbook health, snapshots list & 1-click restore
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── App.jsx              # Protected client-side routing
│   │   ├── index.css            # Tailwind CSS v4 styling & custom scrollbars
│   │   └── main.jsx
│   ├── vite.config.js           # Vite dev server + proxy to backend (Port 3000)
│   └── package.json
│
├── database/
│   └── Academy_Database.xlsx    # Primary Excel database workbook
├── backups/                     # Automatic dated safety snapshots
├── start-ams.bat                # 1-Click Windows Batch Launcher
├── start-ams.ps1                # 1-Click Windows PowerShell Launcher
└── README.md
```

---

## 📊 Primary Excel Database Schema (`database/Academy_Database.xlsx`)

The workbook consists of 10 structured worksheets with professional headers, automated borders, and sequential primary keys:

| Worksheet | Primary Key | Key Columns |
| :--- | :--- | :--- |
| **Students** | `student_id` (STU-1001) | Full Name, Email, Phone, Address, Admission Category, Course ID, Batch ID, Admission Date, Qualification, Training Status, Placement Eligibility, Student Status |
| **Courses** | `course_id` (CRS-101) | Course Name, Description, Duration, Technologies Covered, Start Date, Course Status |
| **Batches** | `batch_id` (BAT-201) | Batch Name, Course ID, Trainer Name, Start Date, End Date, Batch Status |
| **Enrollments** | `enrollment_id` (ENR-301) | Student ID, Course ID, Batch ID, Enrollment Date, Enrollment Status |
| **Companies** | `company_id` (CMP-401) | Company Name, Industry, Location, HR Name, HR Email, HR Phone, Website, Notes, Status |
| **Requirements**| `requirement_id` (REQ-501)| Company ID, Company Name, Job Role, Description, Required Skills, Eligibility, Vacancies, Opening Date, Application Deadline, Salary Details, Status |
| **Applications**| `application_id` (APP-601)| Student ID, Student Name, Company ID, Company Name, Requirement ID, Job Role, Application Date, Resume Status, Interview Date, Interview Round, Result |
| **Attendance** | `attendance_id` (ATT-701) | Student ID, Batch ID, Attendance Date, Attendance Status (Present/Absent/Late/Excused), Remarks |
| **HR_Followups**| `followup_id` (FLW-801) | Requirement ID, Company ID, Company Name, HR Contact, Follow-up Date, Method, Summary, HR Response, Next Follow-up Date, Status |
| **Admin** | `admin_id` (ADM-001) | Full Name, Email, Password Hash (bcrypt), Role, Status |

---

## 🔐 Default Admin Credentials

- **URL**: `http://localhost:3000`
- **Email**: `admin@ams.local`
- **Password**: `admin123`

---

## ⚡ How to Run on Windows

### Option A: One-Click Launcher (Recommended)
Simply double-click:
```
start-ams.bat
```
*(Or right-click `start-ams.ps1` and select "Run with PowerShell")*

This will automatically launch the Express backend, the Vite React frontend, and open your browser at `http://localhost:3000`.

---

### Option B: Manual Terminal Execution

#### 1. Start the Backend Server (Terminal 1)
```powershell
cd C:\VTECH\TrainingCode\backend
npm start
```
*Backend runs on `http://localhost:5000`.*

#### 2. Start the Frontend Client (Terminal 2)
```powershell
cd C:\VTECH\TrainingCode\frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

#### 3. Run Automated End-to-End Verification Tests
```powershell
cd C:\VTECH\TrainingCode\backend
node scripts/testE2E.js
```

---

## 🛡️ Data Protection & Workbook Integrity

1. **Write Locking**: All Excel modifications are funneled through a strict single-writer mutex queue to prevent concurrency lockups.
2. **Atomic Writes**: Writes are completed to temporary files first and renamed atomically to prevent partial writes.
3. **Automated Safety Backups**: Every write automatically captures a snapshot in `backups/Backup_pre_update_*.xlsx`. The system preserves the last 25 snapshots.
4. **Instant Restore**: Navigate to **Settings** in the application to view all snapshots with timestamps and restore previous states with 1-click.

