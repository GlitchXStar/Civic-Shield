# Civic Shield: Frontend to Backend API Integration Reference Map

This document serves as the authoritative quick reference mapping each React frontend route and UI action in Civic Shield to its corresponding mounted Express backend endpoint, HTTP method, authentication/role requirements, and payload contracts.

---

## 1. Public & Authentication

| Frontend Route | UI Action | Backend Endpoint | Method | Request Payload | Response Data Shape | Role Required | Integration Status |
|---|---|---|---|---|---|---|---|
| `/login` | Submit login form | `/api/auth/login` | POST | `{ email, password }` | `{ token, user: { id, name, email, role } }` | Public | **MISMATCH** (UI uses `localStorage`) |
| `/register` | Submit registration form | `/api/auth/register` | POST | `{ firstName, lastName, email, phone, password }` | `{ token, user }` | Public | **MISMATCH** (UI lacks fields; backend needs P0 role fix) |
| `/forgot-password` | Request password reset | `/api/auth/forgot-password` | POST | `{ email }` | `{ message }` | Public | **COMPATIBLE** (UI not connected) |
| `/` | Browse public home | None (Static) | — | — | — | Public | Static UI |
| `/emergency` | View emergency contacts | None (Static) | — | — | — | Public | Static UI |
| `/how-it-works` | View process guide | None (Static) | — | — | — | Public | Static UI |
| `/safety-resources`| View safety advice | None (Static) | — | — | — | Public | Static UI |
| `/contact` | View contact details | None (Static) | — | — | — | Public | Static UI |

---

## 2. Citizen Portal

All citizen endpoints require `Authorization: Bearer <token>` and `CITIZEN` role.

| Frontend Route | UI Action | Backend Endpoint | Method | Request Payload / Query | Response Data Shape | Integration Status |
|---|---|---|---|---|---|---|
| `/citizen/dashboard` | View metrics & map | `/api/citizen/dashboard` | GET | None | `{ totalReports, activeCases, resolvedCases, recentReports, markers }` | **MISSING** (Backend endpoint to be added) |
| `/citizen/report-crime`| Submit new complaint | `/api/citizen/reports` | POST | `{ category, incidentDate, incidentTime, location: { address, city, state, pincode, coordinates: [lng, lat] }, description }` | `{ report: CrimeReport }` | **MISMATCH** (Address fields & coordinate inversion needed) |
| `/citizen/report-crime`| Upload crime attachments | `/api/evidence/cases/:id` | POST | `FormData` with field `files` | `{ evidence: Evidence[] }` | **MISMATCH** (UI file input not connected) |
| `/citizen/my-reports` | List & search reports | `/api/citizen/reports` | GET | `?status=&search=&page=&limit=` | `{ data: CrimeReport[], meta: { total, page, totalPages } }` | **MISMATCH** (UI empty state, needs fetch) |
| `/citizen/my-reports/:id`| View case details | `/api/citizen/reports/:id` | GET | None | `{ report: CrimeReport }` | **COMPATIBLE** (UI needs fetch) |
| `/citizen/my-reports/:id`| View case timeline | `/api/citizen/reports/:id/timeline` | GET | None | `{ timeline: CaseStatusHistory[] }` | **MISMATCH** (Backend query bug: `caseId` -> `crimeReport`) |
| `/citizen/notifications`| View notifications | `/api/citizen/notifications` | GET | None | `{ notifications: Notification[] }` | **MISMATCH** (Backend query bug: `userId` -> `recipient`) |
| `/citizen/notifications`| Mark notification read | `/api/citizen/notifications/:id/read` | PATCH | None | `{ success: true }` | **MISMATCH** (Backend query bug: `userId` -> `recipient`) |
| `/citizen/profile` | View profile | `/api/citizen/profile` | GET | None | `{ user: User }` | **COMPATIBLE** (UI needs fetch) |
| `/citizen/profile` | Update profile info | `/api/citizen/profile` | PATCH | `{ firstName, lastName, phone, address }` | `{ user: User }` | **MISMATCH** (Address schema alignment needed) |

---

## 3. Police Portal

All police endpoints require `Authorization: Bearer <token>` and `POLICE` role.

| Frontend Route | UI Action | Backend Endpoint | Method | Request Payload / Query | Response Data Shape | Integration Status |
|---|---|---|---|---|---|---|
| `/police/dashboard` | View operational stats | `/api/police/dashboard` | GET | None | `{ newReports, assignedCases, reports }` | **COMPATIBLE** (UI needs fetch) |
| `/police/new-reports` | Review incoming reports | `/api/police/reports/new` | GET | `?priority=&search=&page=&limit=` | `{ data: CrimeReport[], meta }` | **COMPATIBLE** (UI needs fetch) |
| `/police/assigned-cases`| View officer's cases | `/api/police/cases` | GET | None | `{ cases: CrimeReport[] }` | **COMPATIBLE** (UI needs fetch) |
| `/police/cases/:id` | View case details | `/api/police/cases/:id` | GET | None | `{ report: CrimeReport }` | **MISMATCH** (BOLA check needed) |
| `/police/cases/:id/investigation` | View investigation notes | `/api/police/cases/:id/investigation` | GET | None | `{ notes: InvestigationNote[] }` | **MISMATCH** (Populate field fix: `addedBy` -> `author`) |
| `/police/cases/:id/investigation` | Add investigation note | `/api/police/cases/:id/investigation` | POST | `{ note: string }` | `{ note: InvestigationNote }` | **MISMATCH** (Backend field fix: `addedBy` -> `author`) |
| `/police/cases/:id/evidence` | View case evidence files | `/api/evidence/cases/:id` | GET | None | `{ evidence: Evidence[] }` | **MISSING** (Backend endpoint to be added) |
| `/police/cases/:id/evidence` | Upload evidence file | `/api/evidence/cases/:id` | POST | `FormData` with field `files` | `{ evidence: Evidence[] }` | **COMPATIBLE** (UI needs file upload trigger) |
| `/police/cases/:id` (Modal) | Change case status | `/api/police/cases/:id/status` | PATCH | `{ status, remarks }` | `{ history: CaseStatusHistory }` | **MISMATCH** (State transition check & schema fix) |
| `/police/reports` | Export / review reports | `/api/police/reports` | GET | None | `{ reports: CrimeReport[] }` | **COMPATIBLE** (UI needs download trigger) |
| `/police/profile` | View profile | `/api/police/profile` | GET | None | `{ user: User, profile: PoliceProfile }` | **COMPATIBLE** (UI needs fetch) |
| `/police/profile` | Update profile info | `/api/police/profile` | PATCH | `{ firstName, lastName, phone, badgeNumber, department }` | `{ user: User, profile: PoliceProfile }` | **MISMATCH** (Field name alignment with UI) |

---

## 4. Admin / SHO Portal

All admin endpoints require `Authorization: Bearer <token>` and `ADMIN` role.

| Frontend Route | UI Action | Backend Endpoint | Method | Request Payload / Query | Response Data Shape | Integration Status |
|---|---|---|---|---|---|---|
| `/admin/dashboard` | View administration stats | `/api/admin/dashboard` | GET | None | `{ users, officers, reports, stats: { activeCases, resolvedCases } }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/users` | List & search citizens | `/api/admin/users` | GET | `?search=&page=&limit=` | `{ data: User[], meta }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/police-officers`| List & search officers | `/api/admin/officers` | GET | `?search=&page=&limit=` | `{ data: OfficerWithProfile[], meta }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/reports` | Review all system reports | `/api/admin/reports` | GET | `?status=&search=&page=&limit=` | `{ data: CrimeReport[], meta }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/case-assignment`| Fetch unassigned cases | `/api/admin/cases/unassigned` | GET | None | `{ cases: CrimeReport[] }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/case-assignment`| Assign case to officer | `/api/admin/cases/:id/assign` | POST | `{ officerId: string }` | `{ report, assignment }` | **MISMATCH** (Schema fix: `caseId` -> `crimeReport`) |
| `/admin/analytics` | View analytics metrics | `/api/admin/analytics` | GET | None | `{ casesByCategory, casesByStatus }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/audit-logs` | Review activity audit logs | `/api/admin/audit-logs` | GET | `?search=&page=&limit=` | `{ data: AuditLog[], meta }` | **MISMATCH** (Populate field fix: `userId` -> `user`) |
| `/admin/profile` | View admin profile | `/api/admin/profile` | GET | None | `{ user: User }` | **COMPATIBLE** (UI needs fetch) |
| `/admin/profile` | Update admin profile | `/api/admin/profile` | PATCH | `{ firstName, lastName, phone }` | `{ user: User }` | **COMPATIBLE** (UI needs fetch) |

---

## 5. File Uploads & Static Evidence Serving

| Action | Backend Endpoint | Method | Expected Format | Access Control | Notes |
|---|---|---|---|---|---|
| Upload Evidence Files | `/api/evidence/cases/:id` | POST | `multipart/form-data` (Field: `files`, Max: 10 files, 10MB each) | Authenticated (Complainant, Assigned Officer, Admin) | Supported MIME types: JPEG, PNG, WEBP, PDF, MP4 |
| Get Evidence Details | `/api/evidence/:id` | GET | None | Authenticated (Complainant, Assigned Officer, Admin) | Returns single evidence metadata |
| Delete Evidence File | `/api/evidence/:id` | DELETE | None | Authenticated (Original Uploader or Admin) | Removes file from disk and database |
| Static File Download / Preview | `/uploads/:filename` | GET | Direct HTTP GET | Public or token-guarded static route | **Requires mounting `express.static` in `app.ts`** |
