# Civic Shield — Frontend → Backend API Map

This document maps every frontend page, user action, and UI element to the required backend endpoint.

---

## 1. Authentication (Public)

### `/login` → Login.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Submit login form | `POST /api/auth/login` | POST | `{ email, password }` | `{ success, data: { token, user: { id, name, email, role } } }` | PUBLIC |

**Form Fields:** email (required), password (required), remember me (checkbox — client-only)

---

### `/register` → Register.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Submit registration | `POST /api/auth/register` | POST | `{ firstName, lastName, email, phone, password, confirmPassword }` | `{ success, data: { token, user } }` | PUBLIC |

**Form Fields:** first name, last name, email, phone, password, confirm password
**Note:** Registration is labeled "Citizen registration" — only CITIZEN accounts can self-register.

---

### `/forgot-password` → ForgotPassword.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Request password reset | `POST /api/auth/forgot-password` | POST | `{ email }` | `{ success, message }` | PUBLIC |

---

### Authenticated User Info
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Get current user | `GET /api/auth/me` | GET | — | `{ success, data: { user } }` | ANY |

---

## 2. Citizen Portal

### `/citizen/dashboard` → citizen/Dashboard.jsx
| UI Element | Backend Endpoint | Method | Response Fields | Role |
|---|---|---|---|---|
| Stat: "Total reports" | `GET /api/citizen/dashboard` | GET | `totalReports` | CITIZEN |
| Stat: "Active cases" | same | GET | `activeCases` | CITIZEN |
| Stat: "Resolved cases" | same | GET | `resolvedCases` | CITIZEN |
| Section: "Recent reports" | same | GET | `recentReports[]` | CITIZEN |

---

### `/citizen/report-crime` → citizen/ReportCrime.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Submit crime report | `POST /api/reports` | POST | See fields below | `{ success, data: { report: { id, caseNumber, ... } } }` | CITIZEN |
| Upload evidence files | `POST /api/reports/:id/evidence` | POST | `multipart/form-data` | `{ success, data: { evidence } }` | CITIZEN |

**Report Form Fields:**
- `category` — select: Theft, Fraud, Cyber crime, Harassment, Missing person, Other (required)
- `incidentDate` — date (required)
- `incidentTime` — time (optional)
- `location` — text (required)
- `description` — textarea (required)
- `fullName` — text (required) — citizen's contact name
- `phone` — tel (required)
- `email` — email (optional)
- `contactMethod` — select: Phone, Email (optional)
- `files` — file upload, multiple files accepted
- `confirmation` — checkbox (client-side only)

---

### `/citizen/my-reports` → citizen/MyReports.jsx
| User Action | Backend Endpoint | Method | Query Params | Response | Role |
|---|---|---|---|---|---|
| Load reports list | `GET /api/citizen/reports` | GET | `?search=&status=` | `{ success, data: { reports[] } }` | CITIZEN |
| Search reports | same | GET | `?search=keyword` | filtered list | CITIZEN |
| Filter by status | same | GET | `?status=SUBMITTED` | filtered list | CITIZEN |

**Status filter options in frontend:** All statuses, Submitted, Under review, Closed

---

### `/citizen/my-reports/:id` → citizen/TrackCase.jsx
| UI Element | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Case timeline | `GET /api/citizen/reports/:id/timeline` | GET | `{ success, data: { timeline[] } }` | CITIZEN |
| Report details (sidebar) | `GET /api/citizen/reports/:id` | GET | `{ success, data: { report } }` | CITIZEN |
| Messages section | — (future phase) | — | — | — |
| Evidence section | `GET /api/reports/:id/evidence` | GET | `{ success, data: { evidence[] } }` | CITIZEN |

---

### `/citizen/notifications` → citizen/Notifications.jsx
| User Action | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Load notifications | `GET /api/citizen/notifications` | GET | `{ success, data: { notifications[] } }` | CITIZEN |
| Mark one as read | `PATCH /api/citizen/notifications/:id/read` | PATCH | `{ success }` | CITIZEN |
| Mark all as read | `PATCH /api/citizen/notifications/read-all` | PATCH | `{ success }` | CITIZEN |

---

### `/citizen/profile` → citizen/Profile.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load profile | `GET /api/citizen/profile` | GET | — | `{ success, data: { profile } }` | CITIZEN |
| Save profile | `PATCH /api/citizen/profile` | PATCH | `{ firstName, lastName, email, phone, address }` | `{ success, data: { profile } }` | CITIZEN |

---

## 3. Police Portal

### `/police/dashboard` → police/Dashboard.jsx
| UI Element | Backend Endpoint | Method | Response Fields | Role |
|---|---|---|---|---|
| Stat: "New reports" | `GET /api/police/dashboard` | GET | `newReports` | POLICE |
| Stat: "Assigned cases" | same | GET | `assignedCases` | POLICE |
| Stat: "Reports" | same | GET | `totalReports` | POLICE |
| "Incoming work" section | same | GET | `incomingWork[]` | POLICE |

---

### `/police/new-reports` → police/NewReports.jsx
| User Action | Backend Endpoint | Method | Query Params | Response | Role |
|---|---|---|---|---|---|
| Load new reports | `GET /api/police/reports/new` | GET | `?search=&priority=` | `{ success, data: { reports[] } }` | POLICE |

**Priority filter options:** All priorities, High, Medium, Low

---

### `/police/assigned-cases` → police/AssignedCases.jsx
| User Action | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Load assigned cases | `GET /api/police/cases` | GET | `{ success, data: { cases[] } }` | POLICE |

---

### `/police/cases/:id` → police/CaseDetails.jsx
| UI Element | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Case information | `GET /api/police/cases/:id` | GET | `{ success, data: { case } }` | POLICE |
| Links: Investigation / Evidence | Client-side navigation | — | — | — |

---

### `/police/cases/:id/investigation` → police/Investigation.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load investigation notes | `GET /api/police/cases/:id/investigation` | GET | — | `{ success, data: { notes[] } }` | POLICE |
| Add investigation note | `POST /api/police/cases/:id/investigation` | POST | `{ note }` | `{ success, data: { note } }` | POLICE |

---

### `/police/cases/:id/evidence` → police/Evidence.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load evidence | `GET /api/police/cases/:id/evidence` | GET | — | `{ success, data: { evidence[] } }` | POLICE |
| Upload evidence | `POST /api/police/cases/:id/evidence` | POST | `multipart/form-data` | `{ success, data: { evidence } }` | POLICE |

---

### `/police/reports` → police/Reports.jsx
| User Action | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Load all reports | `GET /api/police/reports` | GET | `{ success, data: { reports[] } }` | POLICE |
| Export | `GET /api/police/reports/export` | GET | file download | POLICE |

---

### `/police/profile` → police/Profile.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load profile | `GET /api/police/profile` | GET | — | `{ success, data: { profile } }` | POLICE |
| Save profile | `PATCH /api/police/profile` | PATCH | `{ name, email, badgeId, station }` | `{ success, data: { profile } }` | POLICE |

---

## 4. Admin / SHO Portal

### `/admin/dashboard` → admin/Dashboard.jsx
| UI Element | Backend Endpoint | Method | Response Fields | Role |
|---|---|---|---|---|
| Stat: "Users" | `GET /api/admin/dashboard` | GET | `totalUsers` | ADMIN |
| Stat: "Police officers" | same | GET | `totalOfficers` | ADMIN |
| Stat: "Reports" | same | GET | `totalReports` | ADMIN |
| Stat: "Analytics" | same | GET | `analyticsCount` | ADMIN |
| System overview | same | GET | `overview` | ADMIN |

---

### `/admin/users` → admin/Users.jsx
| User Action | Backend Endpoint | Method | Query Params / Body | Response | Role |
|---|---|---|---|---|---|
| Load users | `GET /api/admin/users` | GET | `?search=` | `{ success, data: { users[] } }` | ADMIN |
| Add user | `POST /api/admin/users` | POST | `{ name, email, phone, role, password }` | `{ success, data: { user } }` | ADMIN |
| Update user | `PATCH /api/admin/users/:id` | PATCH | `{ name, email, status }` | `{ success, data: { user } }` | ADMIN |

---

### `/admin/police-officers` → admin/PoliceOfficers.jsx
| User Action | Backend Endpoint | Method | Query Params | Response | Role |
|---|---|---|---|---|---|
| Load officers | `GET /api/admin/officers` | GET | `?search=` | `{ success, data: { officers[] } }` | ADMIN |
| Update officer | `PATCH /api/admin/officers/:id` | PATCH | `{ rank, station, department, status }` | `{ success, data: { officer } }` | ADMIN |

---

### `/admin/reports` → admin/Reports.jsx
| User Action | Backend Endpoint | Method | Query Params | Response | Role |
|---|---|---|---|---|---|
| Load all reports | `GET /api/admin/reports` | GET | `?search=&status=` | `{ success, data: { reports[] } }` | ADMIN |
| View report detail | `GET /api/admin/reports/:id` | GET | — | `{ success, data: { report } }` | ADMIN |

**Status filter options:** All statuses, Submitted, Assigned, Closed

---

### `/admin/case-assignment` → admin/CaseAssignment.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load unassigned cases | `GET /api/admin/cases/unassigned` | GET | — | `{ success, data: { cases[] } }` | ADMIN |
| Load eligible officers | `GET /api/admin/officers` | GET | — | `{ success, data: { officers[] } }` | ADMIN |
| Assign case to officer | `POST /api/admin/cases/:id/assign` | POST | `{ officerId }` | `{ success, data: { assignment } }` | ADMIN |

---

### `/admin/analytics` → admin/Analytics.jsx
| Panel Title | Backend Endpoint | Method | Response | Role |
|---|---|---|---|---|
| Reports over time | `GET /api/admin/analytics/trends` | GET | `{ success, data: { trends[] } }` | ADMIN |
| Resolution overview | `GET /api/admin/analytics/status` | GET | `{ success, data: { statusBreakdown } }` | ADMIN |
| Category distribution | `GET /api/admin/analytics/categories` | GET | `{ success, data: { categories[] } }` | ADMIN |
| Operational workload | `GET /api/admin/analytics/officer-workload` | GET | `{ success, data: { workload[] } }` | ADMIN |

---

### `/admin/audit-logs` → admin/AuditLogs.jsx
| User Action | Backend Endpoint | Method | Query Params | Response | Role |
|---|---|---|---|---|---|
| Load audit logs | `GET /api/admin/audit-logs` | GET | `?search=` | `{ success, data: { logs[] } }` | ADMIN |

---

### `/admin/profile` → admin/Profile.jsx
| User Action | Backend Endpoint | Method | Request Body | Response | Role |
|---|---|---|---|---|---|
| Load profile | `GET /api/admin/profile` | GET | — | `{ success, data: { profile } }` | ADMIN |
| Save profile | `PATCH /api/admin/profile` | PATCH | `{ name, email, role, phone }` | `{ success, data: { profile } }` | ADMIN |

---

## 5. Shared / Cross-cutting Endpoints

| Endpoint | Method | Purpose | Role |
|---|---|---|---|
| `GET /api/health` | GET | Health check | PUBLIC |
| `GET /api/reports/:id/evidence` | GET | Get evidence for a report | CITIZEN (own) / POLICE (assigned) / ADMIN |
| `POST /api/reports/:id/evidence` | POST | Upload evidence | CITIZEN (own) / POLICE (assigned) |
| `GET /api/evidence/:id` | GET | Download single evidence file | CITIZEN (own) / POLICE (assigned) / ADMIN |
| `DELETE /api/evidence/:id` | DELETE | Delete evidence | POLICE (assigned) / ADMIN |
| `PATCH /api/police/cases/:id/status` | PATCH | Update case status | POLICE (assigned) |
| `PATCH /api/admin/cases/:id/status` | PATCH | Admin update case status | ADMIN |

---

## 6. Case Status Enum

```
SUBMITTED → UNDER_REVIEW → ASSIGNED → UNDER_INVESTIGATION → RESOLVED → CLOSED
                         ↘ REJECTED
```

Frontend filter options need updating to show all relevant statuses.

## 7. Priority Enum

```
LOW | MEDIUM | HIGH | CRITICAL
```

## 8. Crime Categories (from frontend select)

```
Theft | Fraud | Cyber crime | Harassment | Missing person | Other
```
