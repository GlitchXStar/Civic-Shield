# Frontend to Backend Integration Map

This document maps the Civic Shield React frontend pages to the necessary Node.js/Express backend APIs.

## Public / Authentication
| Frontend Page | User Action | Required Backend Endpoint | HTTP Method | Request Body/Query | Response | Required Role |
| -- | -- | -- | -- | -- | -- | -- |
| `/login` | Submit login form | `/api/auth/login` | POST | `{ email, password }` | `{ token, user }` | Public |
| `/register` | Submit registration | `/api/auth/register` | POST | `{ firstName, lastName, email, phone, password }` | `{ token, user }` | Public |
| `/forgot-password` | Request reset link | `/api/auth/forgot-password` | POST | `{ email }` | `{ message }` | Public |

## Citizen Portal
| Frontend Page | User Action | Required Backend Endpoint | HTTP Method | Request Body/Query | Response | Required Role |
| -- | -- | -- | -- | -- | -- | -- |
| `/citizen/dashboard` | View summary stats | `/api/citizen/reports` or `/api/citizen/dashboard` | GET | `None` | `Stats / Recent Reports` | CITIZEN |
| `/citizen/report-crime` | Submit new report | `/api/reports` | POST | `{ category, incidentDate, incidentTime, location, description, address... }` + files via FormData | `CrimeReport` | CITIZEN |
| `/citizen/my-reports` | View/Search reports | `/api/citizen/reports` | GET | `?search=...&status=...` | `CrimeReport[]` | CITIZEN |
| `/citizen/my-reports/:id` | View case timeline | `/api/citizen/reports/:id/timeline` | GET | `None` | `CaseStatusHistory[]` | CITIZEN |
| `/citizen/my-reports/:id` | View case details | `/api/citizen/reports/:id` | GET | `None` | `CrimeReport` | CITIZEN |
| `/citizen/notifications` | View notifications | `/api/citizen/notifications` | GET | `None` | `Notification[]` | CITIZEN |
| `/citizen/notifications` | Read notification | `/api/citizen/notifications/:id/read` | PATCH| `None` | `{ success: true }` | CITIZEN |
| `/citizen/profile` | View profile | `/api/citizen/profile` | GET | `None` | `User` | CITIZEN |
| `/citizen/profile` | Update profile | `/api/citizen/profile` | PATCH| `{ firstName, lastName, email, phone, address }` | `User` | CITIZEN |

## Police Portal
| Frontend Page | User Action | Required Backend Endpoint | HTTP Method | Request Body/Query | Response | Required Role |
| -- | -- | -- | -- | -- | -- | -- |
| `/police/dashboard` | View overall stats | `/api/police/dashboard` | GET | `None` | `{ newReports, assignedCases, reports }` | POLICE |
| `/police/new-reports` | List new reports | `/api/police/reports/new` | GET | `?priority=...&search=...` | `CrimeReport[]` | POLICE |
| `/police/assigned-cases`| List assigned cases | `/api/police/cases` | GET | `None` | `CrimeReport[]` | POLICE |
| `/police/cases/:id` | View case details | `/api/police/cases/:id` | GET | `None` | `CrimeReport` | POLICE |
| `/police/cases/:id/investigation` | View investigation | `/api/police/cases/:id/investigation` | GET | `None` | `InvestigationNote[]` | POLICE |
| `/police/cases/:id/investigation` | Add note | `/api/police/cases/:id/investigation` | POST | `{ note }` | `InvestigationNote` | POLICE |
| `/police/cases/:id/evidence` | View evidence | `/api/police/cases/:id/evidence` | GET | `None` | `Evidence[]` | POLICE |
| `/police/cases/:id/evidence` | Add evidence | `/api/police/cases/:id/evidence` | POST | `FormData` (files) | `Evidence[]` | POLICE |
| `/police/cases/:id/status` | Update status | `/api/police/cases/:id/status` | PATCH| `{ status, remarks }` | `CaseStatusHistory` | POLICE |
| `/police/reports` | Export / View reports | `/api/police/reports` | GET | `None` | `Blob / PDF / Array` | POLICE |
| `/police/profile` | Manage profile | `/api/police/profile` | GET, PATCH | `...` | `PoliceProfile & User` | POLICE |

## Admin / SHO Portal
| Frontend Page | User Action | Required Backend Endpoint | HTTP Method | Request Body/Query | Response | Required Role |
| -- | -- | -- | -- | -- | -- | -- |
| `/admin/dashboard` | View system stats | `/api/admin/dashboard` | GET | `None` | `{ users, officers, reports, stats }` | ADMIN |
| `/admin/users` | List citizens | `/api/admin/users` | GET | `?search=...` | `User[]` | ADMIN |
| `/admin/police-officers`| List officers | `/api/admin/officers` | GET | `?search=...` | `PoliceProfile[]` | ADMIN |
| `/admin/reports` | View all reports | `/api/admin/reports` | GET | `?status=...&search=...` | `CrimeReport[]` | ADMIN |
| `/admin/case-assignment`| Unassigned reports | `/api/admin/cases/unassigned` | GET | `None` | `CrimeReport[]` | ADMIN |
| `/admin/case-assignment`| Assign case | `/api/admin/cases/:id/assign` | POST | `{ officerId }` | `CaseAssignment` | ADMIN |
| `/admin/analytics` | View charts | `/api/admin/analytics/*` | GET | `None` | `Stats Data` | ADMIN |
| `/admin/audit-logs` | View activities | `/api/admin/audit-logs` | GET | `?search=...` | `AuditLog[]` | ADMIN |
| `/admin/profile` | Manage profile | `/api/admin/profile` | GET, PATCH | `...` | `User` | ADMIN |

## File Uploads
| Action | Required Backend Endpoint | HTTP Method | Request Body/Query | Response | Required Role |
| -- | -- | -- | -- | -- | -- |
| Upload evidence | `/api/reports/:id/evidence` | POST | `FormData` (files) | `Evidence[]` | CITIZEN/POLICE |
| Get evidence details | `/api/evidence/:id` | GET | `None` | `Evidence` | CITIZEN/POLICE/ADMIN |
| Delete evidence | `/api/evidence/:id` | DELETE | `None` | `{ success: true }` | CITIZEN/POLICE/ADMIN |
