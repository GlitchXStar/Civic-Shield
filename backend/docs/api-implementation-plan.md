# Civic Shield: Step 4 API Implementation Plan

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target:** Adapting the Civic Shield Backend & Integrating with Muskan's Redesigned Frontend  
**Prerequisites:** Completion of Step 3 API Compatibility Audit (`frontend-backend-compatibility.md`)

---

## 1. Overview & Phased Roadmap

This plan provides an actionable, dependency-ordered engineering blueprint for integrating the Civic Shield frontend and backend.

```text
Phase 1: Critical Security & Backend Schema Bug Fixes (P0)
   └── Phase 2: Frontend API Client & Real Authentication (P1)
          └── Phase 3: Citizen Complaint Lifecycle (P1)
                 └── Phase 4: Admin Case Assignment & Oversight (P1)
                        └── Phase 5: Police Investigation Workflow (P1)
                               └── Phase 6: Evidence & Notification Systems (P2)
                                      └── Phase 7: Analytics, Audit Logs & Integration Verification (P2/P3)
```

---

## Phase 1: Critical Security & Backend Schema Bug Fixes (P0)

**Goal:** Eliminate privilege escalation vulnerabilities, fix Express 5 TypeScript errors, and correct internal Mongoose schema violations that currently crash backend controller operations.

### Task 1.1: Resolve TypeScript Compilation Errors (Express 5 Compatibility)
- **Affected Files:**
  - `backend/src/controllers/admin.controller.ts`
  - `backend/src/controllers/police.controller.ts`
  - `backend/src/controllers/evidence.controller.ts`
- **Prerequisites:** None.
- **Dependencies:** Unblocks `npm run build` and test pipelines.
- **Implementation Details:**
  In Express 5, `req.params.id` is typed as `string | string[]`. Add explicit guards or string assertion (`typeof req.params.id === 'string' ? req.params.id : req.params.id[0]`) before passing parameters into logger calls and database lookups.
- **Acceptance Criteria:** `tsc --noEmit` runs with 0 compilation errors.
- **Security Considerations:** Prevents unexpected parameter array injections.

### Task 1.2: Close Registration Privilege Escalation Vulnerability
- **Affected Files:**
  - `backend/src/validators/auth.validator.ts`
  - `backend/src/controllers/auth.controller.ts`
- **Prerequisites:** None.
- **Dependencies:** Must precede frontend auth integration.
- **Implementation Details:**
  1. Remove `role` from `registerSchema` in `auth.validator.ts`.
  2. In `auth.controller.ts:register`, hardcode user role creation to `UserRole.CITIZEN`.
  3. Ensure only authenticated administrators can create or provision `POLICE` or `ADMIN` roles.
- **Acceptance Criteria:** Any attempt to register with `{ "role": "ADMIN" }` or `{ "role": "POLICE" }` is ignored or rejected; account is strictly created with `role: "CITIZEN"`.
- **Security Considerations:** Eliminates P0 privilege escalation flaw.

### Task 1.3: Fix Mongoose Schema Mismatches Across Controllers
- **Affected Files:**
  - `backend/src/controllers/citizen.controller.ts`
  - `backend/src/controllers/police.controller.ts`
  - `backend/src/controllers/admin.controller.ts`
  - `backend/src/controllers/evidence.controller.ts`
- **Prerequisites:** None.
- **Dependencies:** Required before any workflow endpoint can successfully write to MongoDB.
- **Implementation Details:**
  1. **`CaseStatusHistory` Creation:** Change calls in `citizen.controller.ts` and `police.controller.ts` from `{ caseId, status, remarks }` to:
     ```typescript
     await CaseStatusHistory.create({
       crimeReport: reportId,
       changedBy: userId,
       previousStatus: prevStatus,
       newStatus: newStatus,
       reason: remarks || 'Initial submission',
       changedAt: new Date(),
     });
     ```
  2. **`CaseAssignment` Creation:** In `admin.controller.ts:assignCase`, pass `{ crimeReport: id, assignedTo: officer._id, assignedBy: adminId }`.
  3. **`InvestigationNote` Creation:** In `police.controller.ts:addInvestigationNote`, pass `{ crimeReport: id, author: userId, content: data.note, isInternalOnly: true }`.
  4. **`Notification` Lookups:** In `citizen.controller.ts`, query `{ recipient: userId }` instead of `{ userId }`.
  5. **`AuditLog` Creation:** Replace `{ userId, entityType, entityId, metadata }` with `{ user: userId, action, resource, resourceId, details }`.
- **Acceptance Criteria:** Report submission, note addition, status changes, and case assignments write to database without Mongoose `ValidationError`.
- **Security Considerations:** Preserves audit trail integrity and database consistency.

### Task 1.4: Mount Static File Upload Route
- **Affected Files:**
  - `backend/src/app.ts`
- **Prerequisites:** None.
- **Dependencies:** Unblocks evidence viewing and downloads.
- **Implementation Details:**
  Add static middleware in `app.ts`:
  ```typescript
  app.use('/uploads', express.static(env.UPLOAD_DIR));
  ```
- **Acceptance Criteria:** Uploaded evidence at `/uploads/<filename>` returns the file with proper MIME type.
- **Security Considerations:** Verify that directory traversal is prevented and execute permissions are not granted.

---

## Phase 2: Frontend API Client & Real Authentication (P1)

**Goal:** Replace frontend `localStorage` authentication with real JWT token exchange, secure storage, and authenticated API requests.

### Task 2.1: Implement Centralized Frontend API Client
- **Affected Files:**
  - `frontend/src/services/api.js` (new file)
  - `frontend/vite.config.js`
- **Prerequisites:** Backend Phase 1 complete.
- **Dependencies:** Core foundation for all subsequent frontend tasks.
- **Implementation Details:**
  1. Create an Axios or Fetch client wrapper with base URL configurable via `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`.
  2. Add request interceptor to inject `Authorization: Bearer <token>`.
  3. Add response interceptor to handle errors, unwrap standard `{ success, data, message }` responses, and handle `401 Unauthorized` by triggering logout.
- **Acceptance Criteria:** All outbound frontend requests include standard headers and JWT when available.

### Task 2.2: Refactor Frontend AuthContext and Login Flow
- **Affected Files:**
  - `frontend/src/auth/AuthContext.jsx`
  - `frontend/src/auth/Login.jsx`
- **Prerequisites:** Task 2.1.
- **Dependencies:** Unblocks role-protected dashboard routes.
- **Implementation Details:**
  1. Update `AuthContext.jsx` to store `{ user, token }` in state and `localStorage.getItem('civicshield_token')`.
  2. In `Login.jsx`, remove client-side `crimeconnect_users` check. Call `POST /api/auth/login`.
  3. On success, save JWT token, normalize role (e.g. `user.role.toLowerCase()`), update context, and navigate to corresponding role home.
- **Acceptance Criteria:** Valid credentials return token and navigate to portal; invalid credentials show server error message; password never stored in `localStorage`.
- **Security Considerations:** Passwords are sent over HTTPS/HTTP payload directly to backend bcrypt verification.

### Task 2.3: Connect Registration Flow
- **Affected Files:**
  - `frontend/src/auth/Register.jsx`
- **Prerequisites:** Task 2.1, Task 1.2.
- **Dependencies:** None.
- **Implementation Details:**
  1. Adapt `Register.jsx` form: split full name into `firstName` and `lastName`, add `phone` field, enforce minimum 8-character password.
  2. Remove client-side role dropdown for public users (defaults to `citizen`).
  3. Call `POST /api/auth/register`. On success, redirect to `/login` with success banner.
- **Acceptance Criteria:** Submitting form creates citizen user on backend, returns success response, and user can immediately log in.

---

## Phase 3: Citizen Complaint Lifecycle (P1)

**Goal:** Enable citizens to create complaints with location coordinates and attachments, view their submitted reports, and track timelines.

### Task 3.1: Implement Citizen Dashboard Summary Endpoint
- **Affected Files:**
  - `backend/src/routes/citizen.routes.ts`
  - `backend/src/controllers/citizen.controller.ts`
  - `frontend/src/citizen/Dashboard.jsx`
- **Prerequisites:** Phase 2 complete.
- **Dependencies:** None.
- **Implementation Details:**
  1. Add `GET /api/citizen/dashboard` endpoint in backend.
  2. Query counts for total reports, active cases, and resolved cases for `req.user.id`.
  3. Return recent 5 reports and OpenStreetMap coordinates.
  4. In `frontend/src/citizen/Dashboard.jsx`, fetch data on mount and render real numbers and map pins.
- **Acceptance Criteria:** Citizen dashboard displays actual user stats and incident pins instead of placeholder dashes.

### Task 3.2: Connect Citizen Crime Reporting Form
- **Affected Files:**
  - `frontend/src/citizen/ReportCrime.jsx`
  - `backend/src/validators/citizen.validator.ts`
  - `backend/src/controllers/citizen.controller.ts`
- **Prerequisites:** Task 1.3, Task 2.1.
- **Dependencies:** Unblocks report creation workflow.
- **Implementation Details:**
  1. In `ReportCrime.jsx`, bind inputs for category, date, time, description, address, city, state, pincode, and Leaflet map coordinates.
  2. Convert Leaflet coordinates `[lat, lng]` into GeoJSON `[lng, lat]` for backend schema.
  3. Map UI category (e.g. `"Theft"`) to backend enum (`"THEFT"`).
  4. Submit to `POST /api/citizen/reports`.
  5. If files are selected, upload them via `POST /api/evidence/cases/:id` using the returned report ID.
- **Acceptance Criteria:** Valid complaint creates `CrimeReport`, returns tracking ID (e.g. `CR-20261012-1234`), and redirects to My Reports.

### Task 3.3: Connect My Reports and Case Tracking
- **Affected Files:**
  - `frontend/src/citizen/MyReports.jsx`
  - `frontend/src/citizen/TrackCase.jsx`
  - `backend/src/controllers/citizen.controller.ts`
- **Prerequisites:** Task 3.2.
- **Dependencies:** None.
- **Implementation Details:**
  1. In `MyReports.jsx`, call `GET /api/citizen/reports` with status filter and search query; render report cards/table.
  2. In `TrackCase.jsx`, call `GET /api/citizen/reports/:id` and `GET /api/citizen/reports/:id/timeline`.
  3. In `citizen.controller.ts:getReportTimeline`, ensure query matches `crimeReport: id`.
- **Acceptance Criteria:** Citizen can browse own reports and inspect chronological history of status changes.

---

## Phase 4: Admin Case Assignment & Oversight (P1)

**Goal:** Allow administrators / SHOs to review incoming complaints, view eligible police personnel, and assign cases.

### Task 4.1: Connect Admin Reports and Dashboard
- **Affected Files:**
  - `frontend/src/admin/Dashboard.jsx`
  - `frontend/src/admin/Reports.jsx`
- **Prerequisites:** Phase 2 complete.
- **Dependencies:** None.
- **Implementation Details:**
  1. In `admin/Dashboard.jsx`, call `GET /api/admin/dashboard` to populate user, officer, report counts and map markers.
  2. In `admin/Reports.jsx`, call `GET /api/admin/reports` with status filter, search, and pagination.
- **Acceptance Criteria:** Admin dashboard renders live system statistics; reports table renders all system reports.

### Task 4.2: Connect Case Assignment Interface
- **Affected Files:**
  - `frontend/src/admin/CaseAssignment.jsx`
  - `backend/src/controllers/admin.controller.ts`
- **Prerequisites:** Task 1.3, Task 4.1.
- **Dependencies:** Unblocks police assigned case workflow.
- **Implementation Details:**
  1. In `CaseAssignment.jsx`, fetch unassigned cases via `GET /api/admin/cases/unassigned`.
  2. Fetch eligible officers via `GET /api/admin/officers`.
  3. Populate select controls.
  4. On submit, call `POST /api/admin/cases/:id/assign` with `{ officerId }`.
- **Acceptance Criteria:** Assigned case transitions to `ASSIGNED` status; `CaseAssignment` record is created; case disappears from unassigned queue.

---

## Phase 5: Police Investigation Workflow (P1)

**Goal:** Enable police officers to view assigned cases, record internal investigation notes, and update investigation statuses under strict authorization rules.

### Task 5.1: Enforce Broken Object-Level Authorization (BOLA)
- **Affected Files:**
  - `backend/src/controllers/police.controller.ts`
- **Prerequisites:** Phase 1 complete.
- **Dependencies:** Critical prerequisite for police portal actions.
- **Implementation Details:**
  In `getCaseDetails`, `getInvestigation`, `addInvestigationNote`, and `updateCaseStatus`, verify that:
  ```typescript
  if (!report.assignedTo?.equals(req.user.id) && req.user.role !== UserRole.ADMIN) {
    throw new AppError('You are not authorized to access or modify this case.', 403, 'FORBIDDEN');
  }
  ```
- **Acceptance Criteria:** Officers attempting to access unassigned cases receive 403 Forbidden; assigned officers succeed.
- **Security Considerations:** Closes P0 BOLA/IDOR vulnerability.

### Task 5.2: Enforce Case Status State Machine Transitions
- **Affected Files:**
  - `backend/src/controllers/police.controller.ts`
- **Prerequisites:** Task 5.1.
- **Dependencies:** None.
- **Implementation Details:**
  In `updateCaseStatus`, import and evaluate `isValidStatusTransition(report.status, data.status)`. Throw `AppError('Invalid status transition', 400, 'INVALID_TRANSITION')` if transition is illegal.
- **Acceptance Criteria:** Transitioning `ASSIGNED` -> `UNDER_INVESTIGATION` succeeds; jumping `ASSIGNED` -> `CLOSED` is rejected with 400.

### Task 5.3: Connect Police Portal Screens
- **Affected Files:**
  - `frontend/src/police/Dashboard.jsx`
  - `frontend/src/police/AssignedCases.jsx`
  - `frontend/src/police/NewReports.jsx`
  - `frontend/src/police/CaseDetails.jsx`
  - `frontend/src/police/Investigation.jsx`
- **Prerequisites:** Task 5.1, Task 5.2.
- **Dependencies:** None.
- **Implementation Details:**
  1. Connect `Dashboard.jsx` to `GET /api/police/dashboard`.
  2. Connect `AssignedCases.jsx` to `GET /api/police/cases`.
  3. Connect `NewReports.jsx` to `GET /api/police/reports/new`.
  4. Connect `CaseDetails.jsx` to `GET /api/police/cases/:id`.
  5. Connect `Investigation.jsx` to `GET /api/police/cases/:id/investigation` and `POST /api/police/cases/:id/investigation`.
- **Acceptance Criteria:** Officers view only allowed cases; investigation notes persist with author name and timestamp.

---

## Phase 6: Evidence & Notification Systems (P2)

**Goal:** Implement full evidence listing and download capabilities, and connect in-app notifications.

### Task 6.1: Implement Case Evidence Listing Endpoint
- **Affected Files:**
  - `backend/src/routes/evidence.routes.ts`
  - `backend/src/controllers/evidence.controller.ts`
- **Prerequisites:** Task 1.4.
- **Dependencies:** Unblocks evidence tab on citizen and police screens.
- **Implementation Details:**
  Add `GET /api/evidence/cases/:id` endpoint:
  ```typescript
  export async function getCaseEvidence(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const evidence = await Evidence.find({ crimeReport: id }).populate('uploadedBy', 'name role');
    res.json(successResponse({ evidence }));
  }
  ```
- **Acceptance Criteria:** Returns array of evidence metadata for a given case.

### Task 6.2: Connect Frontend Evidence Interfaces
- **Affected Files:**
  - `frontend/src/police/Evidence.jsx`
  - `frontend/src/citizen/TrackCase.jsx`
- **Prerequisites:** Task 6.1.
- **Dependencies:** None.
- **Implementation Details:**
  1. Fetch and render list of attached files with file size, type, and download link (`http://localhost:5000${fileUrl}`).
  2. Connect file upload dropzone to `POST /api/evidence/cases/:id`.
- **Acceptance Criteria:** Uploaded files immediately appear in the evidence list and can be downloaded or previewed.

### Task 6.3: Connect Notification System
- **Affected Files:**
  - `frontend/src/citizen/Notifications.jsx`
  - `frontend/src/components/PortalHeader.jsx`
  - `backend/src/controllers/citizen.controller.ts`
- **Prerequisites:** Task 1.3.
- **Dependencies:** None.
- **Implementation Details:**
  1. Fix `citizen.controller.ts` query: `Notification.find({ recipient: userId })`.
  2. In `Notifications.jsx`, render notifications list; provide "Mark as Read" action.
  3. In `PortalHeader.jsx`, display badge count of unread notifications.
- **Acceptance Criteria:** Notifications triggered by case events appear in real-time in the citizen notification center.

---

## Phase 7: Analytics, Audit Logs & Integration Verification (P2/P3)

**Goal:** Connect administrative insights and audit trails, and perform end-to-end integration verification.

### Task 7.1: Connect Admin Analytics and Audit Logs
- **Affected Files:**
  - `frontend/src/admin/Analytics.jsx`
  - `frontend/src/admin/AuditLogs.jsx`
  - `backend/src/controllers/admin.controller.ts`
- **Prerequisites:** Phase 4 complete.
- **Dependencies:** None.
- **Implementation Details:**
  1. In `admin.controller.ts:getAuditLogs`, fix `.populate('user', 'name email role')`.
  2. Connect `Analytics.jsx` to `GET /api/admin/analytics` and render distribution charts.
  3. Connect `AuditLogs.jsx` to `GET /api/admin/audit-logs` and render searchable events table.
- **Acceptance Criteria:** All system activities (logins, report creations, status changes, assignments) are auditable in the UI.

### Task 7.2: End-to-End Workflow Verification
- **Affected Files:** Entire repository.
- **Prerequisites:** Phases 1–7 complete.
- **Dependencies:** Final milestone gate.
- **Implementation Details:**
  Execute full walkthrough:
  1. Citizen registration & login -> submit theft report with coordinates & files.
  2. Admin login -> verify report in queue -> assign to police officer.
  3. Police officer login -> view assigned case -> add investigation note -> advance status to `UNDER_INVESTIGATION` -> `RESOLVED`.
  4. Citizen login -> verify timeline updates and notification.
  5. Admin login -> verify audit log entries for all steps.
- **Acceptance Criteria:** Zero console errors, zero unhandled rejections, complete business lifecycle passes smoothly.
