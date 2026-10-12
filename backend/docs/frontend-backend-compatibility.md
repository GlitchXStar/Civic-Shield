# Civic Shield: Complete Frontend–Backend API Compatibility Audit Report

**Date of Audit:** October 2026  
**Auditor:** Antigravity AI Pair Programmer  
**System Version:** Civic Shield 1.0.0  
**Scope:** Complete repository inspection of `frontend/` (React 19 + Vite + TailwindCSS 4 + Leaflet) and `backend/` (Node.js + Express 5 + TypeScript 5.8 + Mongoose 8.10 + Zod 3.25).

---

## 1. Executive Summary

This audit establishes the concrete integration state between the redesigned Civic Shield frontend (developed by Muskan) and the existing TypeScript/Express backend. 

### Key Findings Summary:
1. **Frontend API Disconnection (100% Mocked UI):**
   - The frontend currently makes **zero HTTP network requests** (`0/32` features connected).
   - Authentication and authorization in the frontend are entirely simulated using `localStorage` keys (`crimeconnect_users` and `crimeconnect_current_user`), storing user records including **plaintext passwords**.
   - All forms (`ReportCrime.jsx`, `CaseAssignment.jsx`, `Investigation.jsx`, `Profile.jsx`) and dashboards contain dummy event handlers that display amber warning banners stating `"API is not connected yet"`.
   - The frontend lacks an HTTP client library (such as Axios or an instantiated fetch wrapper), an API base URL environment variable, request/response interceptors, and JWT token management.

2. **Backend API Readiness & Internal Schema Faults:**
   - The backend implements **37 mounted routes** across 6 routers (`health`, `auth`, `citizen`, `police`, `admin`, `evidence`).
   - However, **critical backend controller bugs and schema mismatches prevent core backend workflows from executing successfully**, even if the frontend were connected today:
     - **`CaseStatusHistory` Schema Crash:** The Mongoose model requires `crimeReport`, `changedBy`, `previousStatus`, and `newStatus`. Both `citizen.controller.ts` and `police.controller.ts` pass `{ caseId, status, remarks }`, which causes Mongoose validation exceptions on report creation and status updates.
     - **`CaseAssignment` Schema Crash:** The Mongoose model requires `crimeReport` and `assignedTo`. The `admin.controller.ts` passes `{ caseId, officerId }`, causing case assignment to fail validation.
     - **`InvestigationNote` Schema Crash:** The Mongoose model requires `author`. The `police.controller.ts` passes `{ addedBy }`, causing note creation to fail validation.
     - **`Notification` Field Mismatch:** The model stores `recipient`. The `citizen.controller.ts` queries `{ userId }`, causing notification lookups to always return empty arrays and mark-as-read to return 404.
     - **`AuditLog` Schema Crash:** The model requires `resource`. Controllers in `citizen`, `police`, and `admin` pass `{ userId, entityType, entityId, metadata }` instead of `{ user, action, resource, resourceId, details }`, causing Mongoose validation failures on audited actions.
   - **Static File Hosting Missing:** While `multer` uploads files to `uploads/`, `app.ts` does not mount `express.static('uploads')`, making uploaded evidence inaccessible via HTTP.

3. **Critical Security Vulnerabilities Identified:**
   - **Privilege Escalation on Registration (P0):** `POST /api/auth/register` accepts a client-provided `role` enum (`CITIZEN`, `POLICE`, `ADMIN`). Any public user can register an administrator or police officer account.
   - **Broken Object-Level Authorization / BOLA in Police Portal (P0):** In `police.controller.ts`, endpoints for viewing case details (`/cases/:id`), viewing investigation notes (`/cases/:id/investigation`), adding notes, and updating case status do not verify whether the case is assigned to the requesting officer. Any officer can view or mutate any case in the system.
   - **Unenforced State Machine Transitions (P1):** In `police.controller.ts:updateCaseStatus`, `isValidStatusTransition` defined in `constants/index.ts` is never checked. An officer can force any invalid status jump (e.g., from `SUBMITTED` directly to `RESOLVED`).

---

## 2. Actual Frontend and Backend Architecture

### 2.1 Frontend Architecture
- **Framework & Build:** React 19.0.0, Vite 8.3.2, `@vitejs/plugin-react` 5.0.0.
- **Styling:** TailwindCSS 4.3.3 via `@tailwindcss/vite`.
- **Icons & Mapping:** `lucide-react` 0.468.0, `leaflet` 1.9.4, `react-leaflet` 5.0.0.
- **Routing:** `react-router-dom` 7.0.0.
- **State & Auth Management:** 
  - `src/auth/AuthContext.jsx`: Provides React Context with roles `citizen`, `police`, `admin`.
  - `src/auth/ProtectedRoute.jsx`: Client-side guard checking `localStorage.getItem("crimeconnect_current_user")`. Normalizes roles (`police_officer` -> `police`, `administrator` -> `admin`).
  - **No HTTP Client:** No Axios or Fetch utility exists in `frontend/src`.
- **Portals:**
  - Citizen: Dashboard, Report Crime (Leaflet map coordinates), My Reports, Track Case timeline, Notifications, Profile.
  - Police: Dashboard, New Reports, Assigned Cases, Case Details, Investigation, Evidence, Reports, Profile.
  - Admin/SHO: Dashboard, Users, Police Officers, Reports, Case Assignment, Analytics, Audit Logs, Profile.

### 2.2 Backend Architecture
- **Runtime & Language:** Node.js (ES modules: `"type": "module"`), Express 5.1.0, TypeScript 5.8.0 executed via `tsx` 4.19.0.
- **Database:** MongoDB via Mongoose 8.10.1.
- **Security & Headers:** `helmet` 8.1.0, `cors` 2.8.5, `express-rate-limit` 7.5.0, `bcryptjs` 3.0.2, `jsonwebtoken` 9.0.2.
- **Validation:** Zod 3.25.0 in controller logic and `validation.middleware.ts`.
- **File Uploads:** `multer` 2.0.1 storing to disk (`uploads/`).
- **Logging:** Structured logging with `pino` 10.4.0, `picocolors` 1.1.1, `uuid` 11.1.0 (`X-Request-ID`), and payload sanitization in `sanitizeLogger.ts`.
- **Application Structure:**
  - Router mounted at `/api` in `src/app.ts`.
  - Sub-routers: `/api/health`, `/api/auth`, `/api/citizen`, `/api/police`, `/api/admin`, `/api/evidence`.

---

## 3. Complete Frontend Route Inventory

| Route | Component | Layout | Protected | Allowed Roles | Backend Integration Status |
|---|---|---|---|---|---|
| `/` | `Home.jsx` | `PublicLayout` | No | Public | Static UI — No API required |
| `/how-it-works` | `HowItWorks.jsx` | `PublicLayout` | No | Public | Static UI — No API required |
| `/emergency` | `Emergency.jsx` | `PublicLayout` | No | Public | Static UI — No API required |
| `/safety-resources` | `SafetyResources.jsx` | `PublicLayout` | No | Public | Static UI — No API required |
| `/contact` | `Contact.jsx` | `PublicLayout` | No | Public | Static UI — No API required |
| `/login` | `Login.jsx` | `PublicLayout` | No | Public | **Disconnected:** Reads `localStorage` |
| `/register` | `Register.jsx` | `PublicLayout` | No | Public | **Disconnected:** Writes `localStorage` |
| `/forgot-password` | `ForgotPassword.jsx` | `PublicLayout` | No | Public | **Disconnected:** Dummy banner |
| `/citizen/dashboard` | `Dashboard.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Hardcoded dashes & mock markers |
| `/citizen/report-crime` | `ReportCrime.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Uncontrolled form & dummy banner |
| `/citizen/my-reports` | `MyReports.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Static empty state |
| `/citizen/my-reports/:id`| `TrackCase.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Static timeline & dummy cards |
| `/citizen/notifications`| `Notifications.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Static empty state |
| `/citizen/profile` | `Profile.jsx` | `CitizenLayout` | Yes | `citizen` | **Disconnected:** Uncontrolled form & dummy banner |
| `/police/dashboard` | `Dashboard.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Hardcoded dashes & mock markers |
| `/police/new-reports` | `NewReports.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Static empty state |
| `/police/assigned-cases`| `AssignedCases.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Static empty state |
| `/police/cases/:id` | `CaseDetails.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Static navigation cards |
| `/police/cases/:id/investigation` | `Investigation.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Dummy form submit banner |
| `/police/cases/:id/evidence` | `Evidence.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** File input unhandled |
| `/police/reports` | `Reports.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Dummy export button |
| `/police/profile` | `Profile.jsx` | `PoliceLayout` | Yes | `police` | **Disconnected:** Dummy form submit banner |
| `/admin/dashboard` | `Dashboard.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Hardcoded dashes & mock markers |
| `/admin/users` | `Users.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Static text and dummy button |
| `/admin/police-officers`| `PoliceOfficers.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Static empty state |
| `/admin/reports` | `Reports.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Static empty state |
| `/admin/case-assignment`| `CaseAssignment.jsx`| `AdminLayout` | Yes | `admin` | **Disconnected:** Empty select boxes & dummy banner |
| `/admin/analytics` | `Analytics.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Static placeholder cards |
| `/admin/audit-logs` | `AuditLogs.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Static empty state |
| `/admin/profile` | `Profile.jsx` | `AdminLayout` | Yes | `admin` | **Disconnected:** Dummy form submit banner |

---

## 4. Complete Backend Endpoint Inventory

| Mounted URL | Method | Router File | Controller Function | Auth | Required Role | Primary Models Touched | Status in Backend |
|---|---|---|---|---|---|---|---|
| `/api/health` | GET | `health.routes.ts` | Inline handler | Public | None | None | Working |
| `/api/auth/register` | POST | `auth.routes.ts` | `authController.register` | Public | None | `User`, `AuditLog` | Working (Security flaw: role self-assignment) |
| `/api/auth/login` | POST | `auth.routes.ts` | `authController.login` | Public | None | `User`, `AuditLog` | Working |
| `/api/auth/forgot-password` | POST | `auth.routes.ts` | `authController.forgotPassword` | Public | None | `User` | Simulated / Logged only |
| `/api/auth/reset-password` | POST | `auth.routes.ts` | `authController.resetPassword` | Public | None | None | Throws 400 NOT_IMPLEMENTED |
| `/api/auth/me` | GET | `auth.routes.ts` | `authController.getMe` | Bearer | Any (`CITIZEN`, `POLICE`, `ADMIN`) | `User` | Working |
| `/api/citizen/reports` | POST | `citizen.routes.ts` | `citizenController.submitReport` | Bearer | `CITIZEN` | `CrimeReport`, `CaseStatusHistory`, `AuditLog` | **Broken:** Schema mismatch on `CaseStatusHistory` & `AuditLog` |
| `/api/citizen/reports` | GET | `citizen.routes.ts` | `citizenController.getMyReports` | Bearer | `CITIZEN` | `CrimeReport` | Working |
| `/api/citizen/reports/:id`| GET | `citizen.routes.ts` | `citizenController.getReportDetails` | Bearer | `CITIZEN` | `CrimeReport` | Working |
| `/api/citizen/reports/:id/timeline` | GET | `citizen.routes.ts` | `citizenController.getReportTimeline` | Bearer | `CITIZEN` | `CrimeReport`, `CaseStatusHistory` | **Broken:** Queries `caseId` instead of `crimeReport` |
| `/api/citizen/notifications` | GET | `citizen.routes.ts` | `citizenController.getNotifications` | Bearer | `CITIZEN` | `Notification` | **Broken:** Queries `userId` instead of `recipient` |
| `/api/citizen/notifications/:id/read` | PATCH | `citizen.routes.ts` | `citizenController.readNotification` | Bearer | `CITIZEN` | `Notification` | **Broken:** Queries `userId` instead of `recipient` |
| `/api/citizen/profile` | GET | `citizen.routes.ts` | `citizenController.getProfile` | Bearer | `CITIZEN` | `User` | Working |
| `/api/citizen/profile` | PATCH | `citizen.routes.ts` | `citizenController.updateProfile` | Bearer | `CITIZEN` | `User`, `AuditLog` | **Broken:** Schema mismatch on `AuditLog` & `address` |
| `/api/police/dashboard` | GET | `police.routes.ts` | `policeController.getDashboardStats` | Bearer | `POLICE` | `CrimeReport` | Working |
| `/api/police/reports/new` | GET | `police.routes.ts` | `policeController.getNewReports` | Bearer | `POLICE` | `CrimeReport` | Working |
| `/api/police/cases` | GET | `police.routes.ts` | `policeController.getAssignedCases` | Bearer | `POLICE` | `CrimeReport` | Working |
| `/api/police/cases/:id` | GET | `police.routes.ts` | `policeController.getCaseDetails` | Bearer | `POLICE` | `CrimeReport` | Working (BOLA vulnerability) |
| `/api/police/cases/:id/investigation` | GET | `police.routes.ts` | `policeController.getInvestigation` | Bearer | `POLICE` | `CrimeReport`, `InvestigationNote` | **Broken:** Populates `addedBy` instead of `author` |
| `/api/police/cases/:id/investigation` | POST | `police.routes.ts` | `policeController.addInvestigationNote` | Bearer | `POLICE` | `CrimeReport`, `InvestigationNote`, `AuditLog` | **Broken:** Schema mismatch on `InvestigationNote` & `AuditLog` |
| `/api/police/cases/:id/status` | PATCH | `police.routes.ts` | `policeController.updateCaseStatus` | Bearer | `POLICE` | `CrimeReport`, `CaseStatusHistory`, `AuditLog` | **Broken:** Schema mismatch on `CaseStatusHistory` & `AuditLog` |
| `/api/police/reports` | GET | `police.routes.ts` | `policeController.exportReports` | Bearer | `POLICE` | `CrimeReport` | Working (Basic JSON dump) |
| `/api/police/profile` | GET | `police.routes.ts` | `policeController.getProfile` | Bearer | `POLICE` | `User`, `PoliceProfile` | Working |
| `/api/police/profile` | PATCH | `police.routes.ts` | `policeController.updateProfile` | Bearer | `POLICE` | `User`, `PoliceProfile`, `AuditLog` | **Broken:** Schema mismatch on `AuditLog` |
| `/api/admin/dashboard` | GET | `admin.routes.ts` | `adminController.getDashboardStats` | Bearer | `ADMIN` | `User`, `CrimeReport` | Working |
| `/api/admin/users` | GET | `admin.routes.ts` | `adminController.getUsers` | Bearer | `ADMIN` | `User` | Working |
| `/api/admin/officers` | GET | `admin.routes.ts` | `adminController.getOfficers` | Bearer | `ADMIN` | `User`, `PoliceProfile` | Working |
| `/api/admin/reports` | GET | `admin.routes.ts` | `adminController.getAllReports` | Bearer | `ADMIN` | `CrimeReport` | Working |
| `/api/admin/cases/unassigned` | GET | `admin.routes.ts` | `adminController.getUnassignedCases` | Bearer | `ADMIN` | `CrimeReport` | Working |
| `/api/admin/cases/:id/assign` | POST | `admin.routes.ts` | `adminController.assignCase` | Bearer | `ADMIN` | `CrimeReport`, `User`, `CaseAssignment`, `AuditLog` | **Broken:** Schema mismatch on `CaseAssignment` & `AuditLog` |
| `/api/admin/analytics` | GET | `admin.routes.ts` | `adminController.getAnalytics` | Bearer | `ADMIN` | `CrimeReport` | Working |
| `/api/admin/audit-logs` | GET | `admin.routes.ts` | `adminController.getAuditLogs` | Bearer | `ADMIN` | `AuditLog` | **Broken:** Populates `userId` instead of `user` |
| `/api/admin/profile` | GET | `admin.routes.ts` | `adminController.getProfile` | Bearer | `ADMIN` | `User` | Working |
| `/api/admin/profile` | PATCH | `admin.routes.ts` | `adminController.updateProfile` | Bearer | `ADMIN` | `User`, `AuditLog` | **Broken:** Schema mismatch on `AuditLog` |
| `/api/evidence/cases/:id` | POST | `evidence.routes.ts`| `evidenceController.uploadEvidence` | Bearer | `CITIZEN`, `POLICE`, `ADMIN` | `CrimeReport`, `Evidence`, `AuditLog` | **Broken:** Schema mismatch on `AuditLog` |
| `/api/evidence/:id` | GET | `evidence.routes.ts`| `evidenceController.getEvidenceDetails` | Bearer | `CITIZEN`, `POLICE`, `ADMIN` | `Evidence`, `CrimeReport` | Working |
| `/api/evidence/:id` | DELETE | `evidence.routes.ts`| `evidenceController.deleteEvidence` | Bearer | Uploader or `ADMIN` | `Evidence`, `AuditLog` | **Broken:** Schema mismatch on `AuditLog` |

---

## 5. Full API Compatibility Matrix

The table below audits every frontend user-facing feature against the backend implementation.

| Feature | User role | Frontend page | Frontend action | Current API call | Expected request | Expected response | Existing backend endpoint | Backend implementation | Authentication | Authorization | Compatibility status | Required change | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| User Login | Public | `frontend/src/auth/Login.jsx` | Submit form | NONE (`localStorage`) | `POST /api/auth/login` Body: `{ email, password }` | `{ success: true, data: { token, user: { id, name, email, role } } }` | `POST /api/auth/login` | `auth.routes.ts` -> `auth.controller.ts:login` -> `User.findOne` | Public | Public | **MISMATCH** | Replace `localStorage` mock logic with API client call. Store JWT token securely. | P1 |
| User Registration | Public | `frontend/src/auth/Register.jsx` | Submit form | NONE (`localStorage`) | `POST /api/auth/register` Body: `{ name, email, password, confirmPassword, role }` | `{ success: true, data: { token, user } }` | `POST /api/auth/register` | `auth.routes.ts` -> `auth.controller.ts:register` -> `User.create` | Public | Public | **MISMATCH** | 1. Backend requires `firstName`, `lastName`, `phone`, `password` (min 8). Split `name` or adjust schema. 2. Remove role self-assignment on backend. | P0 |
| Forgot Password | Public | `frontend/src/auth/ForgotPassword.jsx` | Submit email | NONE (Dummy banner) | `POST /api/auth/forgot-password` Body: `{ email }` | `{ success: true, message: string }` | `POST /api/auth/forgot-password` | `auth.routes.ts` -> `auth.controller.ts:forgotPassword` | Public | Public | **COMPATIBLE** | Connect API call in form submit handler. | P2 |
| Citizen Dashboard Stats | Citizen | `frontend/src/citizen/Dashboard.jsx` | Page mount | NONE | `GET /api/citizen/dashboard` | `{ success: true, data: { totalReports, activeCases, resolvedCases, recentReports: [], mapMarkers: [] } }` | NONE | NONE | Bearer | `CITIZEN` | **MISSING** | Add `GET /api/citizen/dashboard` in `citizen.routes.ts` and `citizen.controller.ts`. | P1 |
| Citizen Report Crime | Citizen | `frontend/src/citizen/ReportCrime.jsx` | Form submit | NONE (Dummy banner) | `POST /api/citizen/reports` (FormData with files & fields) | `{ success: true, data: { report } }` | `POST /api/citizen/reports` | `citizen.routes.ts` -> `citizen.controller.ts:submitReport` | Bearer | `CITIZEN` | **MISMATCH** | 1. Backend requires `address, city, state, pincode` in `location`. Frontend only provides map coordinates. 2. Category case mismatch (`"Theft"` vs `"THEFT"`). 3. Attach file upload middleware or dual-step evidence upload. 4. Fix `CaseStatusHistory` & `AuditLog` controller creation. | P1 |
| Citizen My Reports | Citizen | `frontend/src/citizen/MyReports.jsx` | Mount & search/filter | NONE (Empty card) | `GET /api/citizen/reports?search=&status=&page=&limit=` | `{ success: true, data: { data: CrimeReport[], meta: { total, page, totalPages } } }` | `GET /api/citizen/reports` | `citizen.routes.ts` -> `citizen.controller.ts:getMyReports` | Bearer | `CITIZEN` (Own reports) | **MISMATCH** | Wire up `useEffect` fetch with pagination and search. Adapt response unwrapping (`res.data.data`). | P1 |
| Track Case Timeline | Citizen | `frontend/src/citizen/TrackCase.jsx` | Mount with `:id` | NONE | `GET /api/citizen/reports/:id/timeline` | `{ success: true, data: { timeline: CaseStatusHistory[] } }` | `GET /api/citizen/reports/:id/timeline` | `citizen.routes.ts` -> `citizen.controller.ts:getReportTimeline` | Bearer | `CITIZEN` (Owner) | **MISMATCH** | 1. Backend controller queries `{ caseId: id }` instead of `{ crimeReport: id }`. 2. Wire up frontend fetch and render timeline events. | P1 |
| Track Case Details | Citizen | `frontend/src/citizen/TrackCase.jsx` | Mount with `:id` | NONE | `GET /api/citizen/reports/:id` | `{ success: true, data: { report: CrimeReport } }` | `GET /api/citizen/reports/:id` | `citizen.routes.ts` -> `citizen.controller.ts:getReportDetails` | Bearer | `CITIZEN` (Owner) | **COMPATIBLE** | Wire up frontend fetch and display case metadata. | P1 |
| Citizen Notifications | Citizen | `frontend/src/citizen/Notifications.jsx` | Mount | NONE | `GET /api/citizen/notifications` | `{ success: true, data: { notifications: Notification[] } }` | `GET /api/citizen/notifications` | `citizen.routes.ts` -> `citizen.controller.ts:getNotifications` | Bearer | `CITIZEN` | **MISMATCH** | 1. Backend queries `{ userId }` instead of `{ recipient }`. 2. Wire up frontend fetch. | P2 |
| Read Notification | Citizen | `frontend/src/citizen/Notifications.jsx` | Click mark read | NONE | `PATCH /api/citizen/notifications/:id/read` | `{ success: true, data: { success: true } }` | `PATCH /api/citizen/notifications/:id/read` | `citizen.routes.ts` -> `citizen.controller.ts:readNotification` | Bearer | `CITIZEN` | **MISMATCH** | Backend queries `{ _id: id, userId }` instead of `{ _id: id, recipient: userId }`. Wire up UI. | P2 |
| Citizen Profile View | Citizen | `frontend/src/citizen/Profile.jsx` | Mount | NONE | `GET /api/citizen/profile` | `{ success: true, data: { user: User } }` | `GET /api/citizen/profile` | `citizen.routes.ts` -> `citizen.controller.ts:getProfile` | Bearer | `CITIZEN` | **COMPATIBLE** | Wire up frontend `useEffect` fetch and pre-fill form fields. | P2 |
| Citizen Profile Update | Citizen | `frontend/src/citizen/Profile.jsx` | Submit form | NONE (Dummy banner) | `PATCH /api/citizen/profile` Body: `{ firstName, lastName, phone, address }` | `{ success: true, data: { user: User } }` | `PATCH /api/citizen/profile` | `citizen.routes.ts` -> `citizen.controller.ts:updateProfile` | Bearer | `CITIZEN` | **MISMATCH** | 1. Frontend address is textarea string; backend validator expects `{ street, city, state, pincode }` while model has `String`. 2. Fix `AuditLog` call. | P2 |
| Police Dashboard Stats | Police | `frontend/src/police/Dashboard.jsx` | Mount | NONE | `GET /api/police/dashboard` | `{ success: true, data: { newReports: number, assignedCases: number, reports: CrimeReport[] } }` | `GET /api/police/dashboard` | `police.routes.ts` -> `police.controller.ts:getDashboardStats` | Bearer | `POLICE` | **COMPATIBLE** | Wire up frontend fetch to populate stat cards, recent list, and map markers. | P1 |
| Police New Reports | Police | `frontend/src/police/NewReports.jsx` | Mount, search & filter | NONE | `GET /api/police/reports/new?priority=&search=&page=` | `{ success: true, data: { data: CrimeReport[], meta } }` | `GET /api/police/reports/new` | `police.routes.ts` -> `police.controller.ts:getNewReports` | Bearer | `POLICE` | **COMPATIBLE** | Wire up frontend fetch, priority filter dropdown, and table rendering. | P1 |
| Police Assigned Cases | Police | `frontend/src/police/AssignedCases.jsx` | Mount | NONE | `GET /api/police/cases` | `{ success: true, data: { cases: CrimeReport[] } }` | `GET /api/police/cases` | `police.routes.ts` -> `police.controller.ts:getAssignedCases` | Bearer | `POLICE` (Assigned only) | **COMPATIBLE** | Wire up frontend fetch to render assigned case cards. | P1 |
| Police Case Details | Police | `frontend/src/police/CaseDetails.jsx` | Mount with `:id` | NONE | `GET /api/police/cases/:id` | `{ success: true, data: { report: CrimeReport } }` | `GET /api/police/cases/:id` | `police.routes.ts` -> `police.controller.ts:getCaseDetails` | Bearer | `POLICE` | **MISMATCH** | Add BOLA authorization check: officer must be assigned or SHO/Admin. Wire up UI. | P0 |
| Police Investigation Notes View | Police | `frontend/src/police/Investigation.jsx` | Mount with `:id` | NONE | `GET /api/police/cases/:id/investigation` | `{ success: true, data: { notes: InvestigationNote[] } }` | `GET /api/police/cases/:id/investigation` | `police.routes.ts` -> `police.controller.ts:getInvestigation` | Bearer | `POLICE` | **MISMATCH** | 1. Backend populates `addedBy` instead of `author`. 2. Add assignment check. 3. Wire up UI. | P1 |
| Police Add Investigation Note | Police | `frontend/src/police/Investigation.jsx` | Submit note | NONE (Dummy banner) | `POST /api/police/cases/:id/investigation` Body: `{ note }` | `{ success: true, data: { note: InvestigationNote } }` | `POST /api/police/cases/:id/investigation` | `police.routes.ts` -> `police.controller.ts:addInvestigationNote` | Bearer | `POLICE` | **MISMATCH** | 1. Backend passes `addedBy` and `isInternal` instead of `author` and `isInternalOnly`. 2. Fix `AuditLog` call. 3. Wire up UI. | P1 |
| Police Evidence List | Police | `frontend/src/police/Evidence.jsx` | Mount with `:id` | NONE | `GET /api/police/cases/:id/evidence` or `GET /api/evidence/cases/:id` | `{ success: true, data: { evidence: Evidence[] } }` | NONE | NONE | Bearer | `POLICE` | **MISSING** | Implement endpoint to list evidence records for a case in `evidence.routes.ts`. | P2 |
| Police Add Evidence File | Police | `frontend/src/police/Evidence.jsx` | File selection / submit | NONE | `POST /api/evidence/cases/:id` (FormData with `files`) | `{ success: true, data: { evidence: Evidence[] } }` | `POST /api/evidence/cases/:id` | `evidence.routes.ts` -> `evidence.controller.ts:uploadEvidence` | Bearer | `POLICE` / Uploader | **MISMATCH** | Fix `AuditLog` call in `evidence.controller.ts`. Wire up frontend upload handler. | P2 |
| Police Update Case Status | Police | `frontend/src/police/CaseDetails.jsx` | Action modal submit | NONE | `PATCH /api/police/cases/:id/status` Body: `{ status, remarks }` | `{ success: true, data: { history: CaseStatusHistory } }` | `PATCH /api/police/cases/:id/status` | `police.routes.ts` -> `police.controller.ts:updateCaseStatus` | Bearer | `POLICE` | **MISMATCH** | 1. Enforce `isValidStatusTransition`. 2. Fix `CaseStatusHistory` (`previousStatus`, `newStatus`, `reason`). 3. Fix `AuditLog`. | P1 |
| Police Reports Export | Police | `frontend/src/police/Reports.jsx` | Click export | NONE | `GET /api/police/reports` | `{ success: true, data: { reports: CrimeReport[] } }` | `GET /api/police/reports` | `police.routes.ts` -> `police.controller.ts:exportReports` | Bearer | `POLICE` | **COMPATIBLE** | Wire up export button to download CSV/JSON from API. | P3 |
| Police Profile View | Police | `frontend/src/police/Profile.jsx` | Mount | NONE | `GET /api/police/profile` | `{ success: true, data: { user: User, profile: PoliceProfile } }` | `GET /api/police/profile` | `police.routes.ts` -> `police.controller.ts:getProfile` | Bearer | `POLICE` | **COMPATIBLE** | Wire up frontend fetch to pre-fill name, email, badge, station. | P2 |
| Police Profile Update | Police | `frontend/src/police/Profile.jsx` | Submit form | NONE (Dummy banner) | `PATCH /api/police/profile` Body: `{ firstName, lastName, phone, badgeNumber, department }` | `{ success: true, data: { user, profile } }` | `PATCH /api/police/profile` | `police.routes.ts` -> `police.controller.ts:updateProfile` | Bearer | `POLICE` | **MISMATCH** | Frontend provides `"Full name", "Official email", "Badge / employee ID", "Station"`. Align form payload with validator and fix `AuditLog`. | P2 |
| Admin Dashboard Stats | Admin | `frontend/src/admin/Dashboard.jsx` | Mount | NONE | `GET /api/admin/dashboard` | `{ success: true, data: { users, officers, reports, stats: { activeCases, resolvedCases } } }` | `GET /api/admin/dashboard` | `admin.routes.ts` -> `admin.controller.ts:getDashboardStats` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up frontend fetch to populate stat numbers and map markers. | P1 |
| Admin Users List | Admin | `frontend/src/admin/Users.jsx` | Mount & search | NONE | `GET /api/admin/users?search=&page=&limit=` | `{ success: true, data: { data: User[], meta } }` | `GET /api/admin/users` | `admin.routes.ts` -> `admin.controller.ts:getUsers` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up frontend table rendering, search query debounce, and pagination. | P2 |
| Admin Police Officers List | Admin | `frontend/src/admin/PoliceOfficers.jsx`| Mount & search | NONE | `GET /api/admin/officers?search=&page=&limit=` | `{ success: true, data: { data: OfficerWithProfile[], meta } }` | `GET /api/admin/officers` | `admin.routes.ts` -> `admin.controller.ts:getOfficers` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up frontend table rendering and officer search. | P2 |
| Admin All Reports | Admin | `frontend/src/admin/Reports.jsx` | Mount, search & filter | NONE | `GET /api/admin/reports?status=&search=&page=&limit=` | `{ success: true, data: { data: CrimeReport[], meta } }` | `GET /api/admin/reports` | `admin.routes.ts` -> `admin.controller.ts:getAllReports` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up frontend table rendering with status filter dropdown. | P1 |
| Admin Unassigned Cases | Admin | `frontend/src/admin/CaseAssignment.jsx`| Mount | NONE | `GET /api/admin/cases/unassigned` | `{ success: true, data: { cases: CrimeReport[] } }` | `GET /api/admin/cases/unassigned` | `admin.routes.ts` -> `admin.controller.ts:getUnassignedCases` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up frontend select options for unassigned cases. | P1 |
| Admin Case Assignment | Admin | `frontend/src/admin/CaseAssignment.jsx`| Submit form | NONE (Dummy banner) | `POST /api/admin/cases/:id/assign` Body: `{ officerId }` | `{ success: true, data: { report, assignment } }` | `POST /api/admin/cases/:id/assign` | `admin.routes.ts` -> `admin.controller.ts:assignCase` | Bearer | `ADMIN` | **MISMATCH** | 1. Backend controller passes `{ caseId, officerId }` instead of `{ crimeReport, assignedTo }` to `CaseAssignment.create`. 2. Fix `AuditLog`. 3. Wire up UI. | P1 |
| Admin Analytics | Admin | `frontend/src/admin/Analytics.jsx` | Mount | NONE | `GET /api/admin/analytics` | `{ success: true, data: { casesByCategory, casesByStatus } }` | `GET /api/admin/analytics` | `admin.routes.ts` -> `admin.controller.ts:getAnalytics` | Bearer | `ADMIN` | **COMPATIBLE** | Wire up charts/cards using aggregated analytics response. | P2 |
| Admin Audit Logs | Admin | `frontend/src/admin/AuditLogs.jsx` | Mount & search | NONE | `GET /api/admin/audit-logs?search=&page=&limit=` | `{ success: true, data: { data: AuditLog[], meta } }` | `GET /api/admin/audit-logs` | `admin.routes.ts` -> `admin.controller.ts:getAuditLogs` | Bearer | `ADMIN` | **MISMATCH** | 1. Backend controller populates `userId` instead of `user`. 2. Wire up audit log table in frontend. | P2 |
| Admin Profile View/Update | Admin | `frontend/src/admin/Profile.jsx` | Mount / submit | NONE | `GET /api/admin/profile` & `PATCH /api/admin/profile` | `{ success: true, data: { user: User } }` | `GET /api/admin/profile` & `PATCH /api/admin/profile` | `admin.routes.ts` -> `admin.controller.ts:getProfile` / `updateProfile` | Bearer | `ADMIN` | **MISMATCH** | Fix `AuditLog` call in `updateProfile`. Wire up frontend form. | P2 |

---

## 6. Authentication and Role Compatibility

### 6.1 Role Representation Mismatch
- **Frontend Definition:**
  ```javascript
  // frontend/src/auth/AuthContext.jsx
  export const ROLES = {
    CITIZEN: "citizen",
    POLICE: "police",
    ADMIN: "admin",
  };
  ```
- **Backend Definition:**
  ```typescript
  // backend/src/constants/index.ts
  export const UserRole = {
    CITIZEN: 'CITIZEN',
    POLICE: 'POLICE',
    ADMIN: 'ADMIN',
  } as const;
  ```
- **Impact:**
  - Token payload issues `role: "CITIZEN"`.
  - Frontend `ProtectedRoute.jsx` normalizes with `.toLowerCase()`, but `AuthContext.jsx` checks exact equality (`allowedRoles.includes(session.role)`).
  - If backend returns `{ user: { role: 'CITIZEN' } }` and frontend stores it directly, `ROLES.CITIZEN` (`"citizen"`) will not match unless transformed.
  - **Correction:** Standardize authentication response mapping in the frontend auth provider or normalize uniformly.

### 6.2 Token Storage & Authorization Headers
- **Frontend Current State:** No token handling. Session stored in `localStorage` under `"crimeconnect_current_user"` as `{ role, name, email }`.
- **Backend Current State:** Requires `Authorization: Bearer <jwt_token>` header on all protected routes.
- **Correction:**
  - Introduce an API client (e.g. `src/services/api.js`) that attaches `Authorization: Bearer ${token}` via request interceptor.
  - Update `AuthContext.jsx` to store both `token` and `user` object.
  - Handle `401 Unauthorized` responses by automatically clearing session and redirecting to `/login`.

---

## 7. Business Workflow Compatibility

### 7.1 Citizen Complaint Lifecycle
1. **Submission:**
   - Frontend captures Category, Date, Time, Map Coordinates (Leaflet `[lat, lng]`), Description, Contact info, and Files.
   - Backend requires `location.address`, `location.city`, `location.state`, `location.pincode` (regex `^[1-9][0-9]{5}$`), and coordinates formatted as GeoJSON `[lng, lat]`.
   - Backend `POST /api/citizen/reports` has **no Multer middleware** attached, failing if submitted with files as multipart.
   - On submission, backend controller attempts to create `CaseStatusHistory` with `{ caseId, status }` and `AuditLog` with `{ userId, entityType }`, causing Mongoose validation errors.
2. **Citizen Tracking:**
   - Timeline lookup `/api/citizen/reports/:id/timeline` filters by `{ caseId: id }`, which returns `[]` because the model field is `crimeReport`.

### 7.2 Police Investigation Workflow
1. **Access Control:**
   - Police officer accesses `/police/cases/:id`. Controller `getCaseDetails` finds by ID without verifying if `report.assignedTo == req.user.id`.
   - Any officer can view all cases, read all notes, post notes, and transition statuses for cases assigned to other officers.
2. **Investigation Notes:**
   - `InvestigationNote.create` passes `{ addedBy }` instead of `{ author }`. Because `author` is required, database write crashes.
3. **Status Transitions:**
   - Controller updates status without verifying `isValidStatusTransition()`.

### 7.3 Admin / SHO Case Assignment Workflow
1. **Assignment Execution:**
   - Admin selects case and officer at `/admin/case-assignment`.
   - Controller calls `CaseAssignment.create({ caseId, officerId, assignedBy })`.
   - `CaseAssignmentSchema` strictly requires `crimeReport` and `assignedTo`. The write throws a Mongoose ValidationError and fails.

---

## 8. Request/Response Contract Mismatches

| Route | Field / Contract | Frontend Expectation | Backend Actual Behavior | Impact |
|---|---|---|---|---|
| `POST /api/auth/register` | User Full Name | Single string: `name` | Expects separate `firstName` and `lastName` | Zod validation rejects registration |
| `POST /api/auth/register` | Phone Number | Not present in UI form | Required (`min(10)`) | Zod validation rejects registration |
| `POST /api/auth/register` | Password Length | UI allows `>= 6` chars | Zod requires `>= 8` chars | Registration fails for 6–7 char passwords |
| `POST /api/citizen/reports` | Location coordinates | Leaflet format: `[latitude, longitude]` | GeoJSON format: `coordinates: [longitude, latitude]` | Inverted geo coordinates in database |
| `POST /api/citizen/reports` | Location address | Only map coords selected | Requires `address, city, state, pincode` | Zod validation rejects report submission |
| `POST /api/citizen/reports` | Crime Category | Form values: `"Theft"`, `"Fraud"`, `"Cyber crime"` | Enum values: `"THEFT"`, `"FRAUD"`, `"CYBER_CRIME"` | Zod validation rejects category |
| `GET /api/citizen/reports` | Response shape | Expects array of reports | Paginated: `{ data: { data: CrimeReport[], meta: {...} } }` | Frontend cannot read `.map()` directly without extracting `data.data` |
| `PATCH /api/citizen/profile` | Address format | Plain text string (`textarea`) | Validator requires object `{ street, city, state, pincode }` | Zod validation rejects profile update |
| `GET /api/admin/audit-logs` | User reference | Populates actor details | Controller runs `.populate('userId')` (field is `user`) | Actor details return empty/unpopulated |

---

## 9. Security and Data Integrity Audit

### Finding 1: Public Privilege Escalation on User Registration
- **Affected File:** `backend/src/validators/auth.validator.ts:9` and `backend/src/controllers/auth.controller.ts:31`
- **Severity:** Critical (P0)
- **Evidence:**
  ```typescript
  // auth.validator.ts
  export const registerSchema = z.object({
    ...
    role: z.enum(['CITIZEN', 'POLICE', 'ADMIN']).optional().default('CITIZEN'),
  });
  ```
  ```typescript
  // auth.controller.ts
  const user = await User.create({
    ...
    role: data.role,
  });
  ```
- **Impact:** Any unauthenticated caller can send `{ "role": "ADMIN" }` or `{ "role": "POLICE" }` and gain instant administrative control of the system.
- **Correction:** Restrict public registration to `UserRole.CITIZEN`. Police officer and administrator accounts must only be created by an authenticated administrator or through a dedicated provisioning command/endpoint.

### Finding 2: Plaintext Passwords in Browser Storage
- **Affected File:** `frontend/src/auth/Register.jsx:50-61` and `frontend/src/auth/Login.jsx:29-45`
- **Severity:** Critical (P0)
- **Evidence:**
  `Register.jsx` stores passwords directly into `localStorage.getItem("crimeconnect_users")` as unhashed strings.
- **Impact:** Any client script, XSS vector, or browser inspection exposes all test account credentials.
- **Correction:** Remove client-side mock registration and login storage. Authenticate solely against the backend bcrypt-hashed credentials.

### Finding 3: Broken Object-Level Authorization (BOLA) in Police Operations
- **Affected File:** `backend/src/controllers/police.controller.ts` (lines 81, 96, 116, 150)
- **Severity:** Critical (P0)
- **Evidence:**
  ```typescript
  export async function getCaseDetails(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const report = await CrimeReport.findById(id).populate('submittedBy', 'name email phone');
    ...
  }
  ```
- **Impact:** Any police officer can inspect complainant details, view sensitive investigation notes, add notes, and alter status on cases assigned to any other officer or station.
- **Correction:** Add authorization check ensuring `report.assignedTo.equals(req.user.id)` or the user has supervisory (`ADMIN`) role.

### Finding 4: Inaccessible Evidence Files via HTTP
- **Affected File:** `backend/src/app.ts` and `backend/src/middleware/upload.middleware.ts`
- **Severity:** High (P1)
- **Evidence:**
  `multer` saves files to disk, and `Evidence` records store `fileUrl: /uploads/${filename}`. However, `app.ts` never declares:
  ```typescript
  app.use('/uploads', express.static(env.UPLOAD_DIR));
  ```
- **Impact:** Any attempt to download, view, or preview evidence files in the browser yields a 404 error.
- **Correction:** Add `express.static` middleware with proper security headers for uploaded assets.

### Finding 5: Runtime Schema Validation Crashes across Controllers
- **Affected Files:**
  - `backend/src/controllers/citizen.controller.ts:50, 57`
  - `backend/src/controllers/police.controller.ts:127, 134, 165, 172, 253`
  - `backend/src/controllers/admin.controller.ts:177, 184, 282`
  - `backend/src/controllers/evidence.controller.ts:50, 122`
- **Severity:** Critical (P0)
- **Evidence:**
  `AuditLog.create` calls omit required field `resource`.
  `CaseStatusHistory.create` calls omit required fields `previousStatus`, `newStatus`, `crimeReport`.
  `CaseAssignment.create` calls omit required fields `crimeReport`, `assignedTo`.
  `InvestigationNote.create` calls omit required field `author`.
- **Impact:** Legitimate requests that pass route and Zod validation crash during database persistence with Mongoose ValidationErrors.
- **Correction:** Align controller creation payloads with model schemas.

---

## 10. Missing Endpoints and Incomplete Features

1. **Citizen Dashboard Aggregation Endpoint:**
   - Required URL: `GET /api/citizen/dashboard`
   - Purpose: Returns summary statistics (`totalReports`, `activeCases`, `resolvedCases`), recent 5 reports, and incident coordinates for OpenStreetMap.
2. **Case Evidence Retrieval Endpoint:**
   - Required URL: `GET /api/evidence/cases/:id`
   - Purpose: Returns the array of evidence metadata records uploaded for a specific case.
3. **Police Case Evidence Upload Integration:**
   - Required URL: Accessible as `POST /api/evidence/cases/:id` or alias `POST /api/police/cases/:id/evidence`.
4. **Password Reset Service:**
   - Endpoint: `POST /api/auth/reset-password` currently returns `400 NOT_IMPLEMENTED`.
5. **Admin Add User Endpoint:**
   - UI trigger: "Add User" button in `admin/Users.jsx`. Needs `POST /api/admin/users`.

---

## 11. Prioritized Recommended Changes (P0–P3)

### Priority P0: Critical Security & Startup Blockers
1. **Fix Registration Privilege Escalation:** Force `role = UserRole.CITIZEN` in `auth.controller.ts:register` and remove role from `registerSchema`.
2. **Fix Internal Controller Schema Crashes:**
   - Correct `CaseStatusHistory.create` in citizen and police controllers (`crimeReport`, `previousStatus`, `newStatus`, `reason`).
   - Correct `CaseAssignment.create` in admin controller (`crimeReport`, `assignedTo`, `assignedBy`).
   - Correct `InvestigationNote.create` in police controller (`crimeReport`, `author`, `isInternalOnly`).
   - Correct `AuditLog.create` in all controllers (`user`, `resource`, `resourceId`, `details`).
3. **Fix Express 5 TypeScript Compilation Errors:**
   - Cast or guard `req.params.id as string` in `admin.controller.ts`, `police.controller.ts`, and `evidence.controller.ts` to satisfy compiler checks.

### Priority P1: Core Workflow & API Integration Blockers
1. **Establish Frontend API Client:**
   - Implement Axios/Fetch client with base URL from `VITE_API_URL`.
   - Add JWT request interceptor and 401 response redirect.
   - Connect `Login.jsx` and `Register.jsx`.
2. **Citizen Complaint Creation:**
   - Add missing address fields (Address, City, State, Pincode) to `ReportCrime.jsx` or make them optional in validator.
   - Invert coordinates from Leaflet `[lat, lng]` to GeoJSON `[lng, lat]`.
   - Map category strings to uppercase enums (`"Theft"` -> `"THEFT"`).
3. **Police Case Assignment & Investigation:**
   - Fix `police.controller.ts` queries to populate `author`.
   - Enforce assigned officer ownership check on case actions.
   - Validate status transitions using `isValidStatusTransition()`.
4. **Admin Case Assignment:**
   - Connect `CaseAssignment.jsx` to fetch unassigned cases and police officers.
   - Post assignment to `/api/admin/cases/:id/assign`.

### Priority P2: Evidence, Notifications, Profiles & Analytics
1. **Evidence Management:**
   - Mount static file serving in `app.ts`: `app.use('/uploads', express.static(env.UPLOAD_DIR))`.
   - Add `GET /api/evidence/cases/:id` endpoint.
   - Connect file upload inputs in `Evidence.jsx` and `ReportCrime.jsx`.
2. **Notifications:**
   - Fix `citizen.controller.ts` to query `recipient: userId` instead of `userId`.
   - Connect `Notifications.jsx` and badge in `PortalHeader.jsx`.
3. **Profile Management:**
   - Fix address schema inconsistency between User model (`String`) and validator (`Object`).
   - Connect profile forms for Citizen, Police, and Admin.
4. **Dashboards & Analytics:**
   - Implement `GET /api/citizen/dashboard`.
   - Connect `Analytics.jsx` to render aggregated charts.
   - Connect `AuditLogs.jsx` table with pagination.

### Priority P3: Polish & Nonessential Enhancements
1. **Report Export:**
   - Format `GET /api/police/reports` into structured CSV/PDF download rather than raw JSON.
2. **Admin User Management:**
   - Implement modal for "Add User" button in `admin/Users.jsx`.

---

## 12. Affected Files Inventory

### Frontend Files Requiring Integration:
- `frontend/src/services/api.js` *(new file)*
- `frontend/src/auth/AuthContext.jsx`
- `frontend/src/auth/Login.jsx`
- `frontend/src/auth/Register.jsx`
- `frontend/src/auth/ForgotPassword.jsx`
- `frontend/src/citizen/Dashboard.jsx`
- `frontend/src/citizen/ReportCrime.jsx`
- `frontend/src/citizen/MyReports.jsx`
- `frontend/src/citizen/TrackCase.jsx`
- `frontend/src/citizen/Notifications.jsx`
- `frontend/src/citizen/Profile.jsx`
- `frontend/src/police/Dashboard.jsx`
- `frontend/src/police/NewReports.jsx`
- `frontend/src/police/AssignedCases.jsx`
- `frontend/src/police/CaseDetails.jsx`
- `frontend/src/police/Investigation.jsx`
- `frontend/src/police/Evidence.jsx`
- `frontend/src/police/Reports.jsx`
- `frontend/src/police/Profile.jsx`
- `frontend/src/admin/Dashboard.jsx`
- `frontend/src/admin/Users.jsx`
- `frontend/src/admin/PoliceOfficers.jsx`
- `frontend/src/admin/Reports.jsx`
- `frontend/src/admin/CaseAssignment.jsx`
- `frontend/src/admin/Analytics.jsx`
- `frontend/src/admin/AuditLogs.jsx`
- `frontend/src/admin/Profile.jsx`

### Backend Files Requiring Bug Fixes & Additions:
- `backend/src/app.ts` (Static upload route mounting)
- `backend/src/validators/auth.validator.ts` (Remove role self-assignment)
- `backend/src/validators/citizen.validator.ts` (Address schema alignment)
- `backend/src/controllers/auth.controller.ts` (Enforce CITIZEN role)
- `backend/src/controllers/citizen.controller.ts` (Schema fixes for CaseStatusHistory, AuditLog, Notification)
- `backend/src/controllers/police.controller.ts` (BOLA check, status transition check, schema fixes)
- `backend/src/controllers/admin.controller.ts` (CaseAssignment & AuditLog schema fixes, populate fixes)
- `backend/src/controllers/evidence.controller.ts` (Add list evidence endpoint, AuditLog fix)
- `backend/src/routes/evidence.routes.ts` (Add GET `/cases/:id`)
- `backend/src/routes/citizen.routes.ts` (Add GET `/dashboard`)

---

## 13. Testing Requirements and Acceptance Criteria

1. **Authentication:**
   - Registration creates user with `CITIZEN` role only; passwords stored as bcrypt hashes; JWT returned.
   - Login with valid credentials returns JWT; invalid credentials return 401 with structured error.
   - Protected routes reject unauthenticated requests with 401.
2. **Citizen Reporting:**
   - Report submission succeeds with coordinates and address data; tracking ID generated (e.g. `CR-YYYYMMDD-XXXX`).
   - `CaseStatusHistory` and `AuditLog` documents successfully created in MongoDB without schema validation errors.
   - Citizen can only query their own reports.
3. **Police Investigation:**
   - Police officer sees assigned cases; unassigned cases blocked from unauthorized status updates.
   - Investigation notes persist with valid `author` reference.
   - Invalid status transitions (e.g., `SUBMITTED` -> `CLOSED`) return 400 Bad Request.
4. **Admin Assignment:**
   - Admin can assign unassigned reports to police officers; `CaseAssignment` record persists with `crimeReport` and `assignedTo`.
   - Audit log captures assignment action with `resource: 'CrimeReport'`.
5. **Evidence Handling:**
   - Files uploaded to `/api/evidence/cases/:id` saved to `uploads/` and accessible via `GET /uploads/<filename>`.
