# Civic Shield — MongoDB Database Schema Architecture

## Overview
Civic Shield is an Online Crime Reporting & Investigation Management System built on **Mongoose/MongoDB Atlas**. The database model is designed for high performance, strict typing, GeoJSON geospatial queries (`2dsphere`), append-only audit tracking, and granular relational references across collections.

---

## Collections & Schemas

### 1. `users` (Model: `User`)
Stores core identity and role data for all system users (Citizens, Police Officers, Admins).

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Unique document identifier |
| `name` | `String` | Required, Trim (2-100 chars) | Full name |
| `email` | `String` | Required, Unique, Lowercase, Indexed | User email address |
| `passwordHash` | `String` | Required, `select: false` | Bcrypt hashed password |
| `role` | `String` | Enum: `CITIZEN`, `POLICE`, `ADMIN` | User privilege level |
| `phone` | `String` | Optional, Trim | Contact phone number |
| `status` | `String` | Enum: `ACTIVE`, `SUSPENDED`, `INACTIVE` | Account status |
| `address` | `String` | Optional, Trim | Physical address |
| `avatarUrl` | `String` | Optional, Trim | Profile avatar URL |
| `createdAt` | `Date` | Timestamp | Creation date |
| `updatedAt` | `Date` | Timestamp | Last update date |

**Indexes:**
- `{ email: 1 }` (Unique)
- `{ role: 1 }`

---

### 2. `policeprofiles` (Model: `PoliceProfile`)
Extends `users` collection specifically for Police Officers.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `user` | `ObjectId` | Ref: `User`, Required, Unique, Indexed | Reference to User |
| `badgeNumber` | `String` | Required, Unique, Indexed | Official officer badge number |
| `rank` | `String` | Required, Trim | Officer rank (e.g. Inspector) |
| `department` | `String` | Required, Trim | Division / Department name |
| `stationName` | `String` | Required, Trim | Assigned police station |
| `areaAssigned` | `String` | Optional, Trim | Jurisdiction / Area covered |
| `status` | `String` | Enum: `AVAILABLE`, `BUSY`, `ON_LEAVE` | Duty status |
| `shift` | `String` | Optional, Trim | Work shift details |
| `casesAssignedCount` | `Number` | Default: 0, Min: 0 | Number of currently active cases |
| `createdAt` | `Date` | Timestamp | Creation date |
| `updatedAt` | `Date` | Timestamp | Last update date |

**Indexes:**
- `{ badgeNumber: 1 }` (Unique)
- `{ user: 1 }` (Unique)
- `{ status: 1 }`

---

### 3. `crimereports` (Model: `CrimeReport`)
Central collection managing crime reports and incident tracking.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `trackingId` | `String` | Required, Unique, Indexed | Public case tracking code |
| `submittedBy` | `ObjectId` | Ref: `User`, Required, Indexed | Citizen / User who submitted report |
| `assignedTo` | `ObjectId` | Ref: `User`, Default: `null`, Indexed | Police Officer assigned |
| `category` | `String` | Enum: `THEFT`, `FRAUD`, `CYBER_CRIME`, `HARASSMENT`, `MISSING_PERSON`, `OTHER` | Crime classification |
| `title` | `String` | Required, Trim (5-200 chars) | Case summary title |
| `description` | `String` | Required, Trim | Comprehensive case details |
| `incidentDate` | `Date` | Required | Date & time incident occurred |
| `location` | `Object` | GeoJSON Point Object | Geographic location data |
| ↳ `location.type` | `String` | Default: `'Point'` | GeoJSON Point type |
| ↳ `location.coordinates` | `[Number]` | `[longitude, latitude]`, `2dsphere` | GeoJSON coordinates |
| ↳ `location.formattedAddress` | `String` | Required | Full street address |
| ↳ `location.city` | `String` | Required | City name |
| ↳ `location.state` | `String` | Required | State name |
| ↳ `location.pincode` | `String` | Optional | Postal code |
| `status` | `String` | Enum: `SUBMITTED`, `UNDER_REVIEW`, `ASSIGNED`, `UNDER_INVESTIGATION`, `RESOLVED`, `CLOSED`, `REJECTED` | Case status |
| `priority` | `String` | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Case urgency |
| `contactPreference` | `String` | Enum: `EMAIL`, `PHONE` | Contact method |
| `isAnonymous` | `Boolean` | Default: `false` | Anonymity flag |
| `evidenceFiles` | `[ObjectId]` | Ref: `Evidence` | Attached file metadata IDs |
| `createdAt` | `Date` | Timestamp | Creation timestamp |
| `updatedAt` | `Date` | Timestamp | Modification timestamp |

**Indexes:**
- `{ 'location.coordinates': '2dsphere' }` (Geospatial queries)
- `{ trackingId: 1 }` (Unique)
- `{ status: 1 }`
- `{ category: 1 }`
- `{ submittedBy: 1 }`
- `{ assignedTo: 1 }`
- `{ createdAt: -1 }`

---

### 4. `caseassignments` (Model: `CaseAssignment`)
Tracks full historical log of officer assignments per report.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `crimeReport` | `ObjectId` | Ref: `CrimeReport`, Required, Indexed | Related crime report |
| `assignedTo` | `ObjectId` | Ref: `User`, Required, Indexed | Assigned Police Officer |
| `assignedBy` | `ObjectId` | Ref: `User`, Required | Admin / Senior Officer issuing assignment |
| `assignedAt` | `Date` | Default: `Date.now` | Date assignment was created |
| `unassignedAt` | `Date` | Default: `null` | Date officer was unassigned |
| `status` | `String` | Enum: `'ACTIVE'`, `'REASSIGNED'`, `'COMPLETED'` | Assignment state |
| `notes` | `String` | Optional | Assignment notes |

---

### 5. `investigationnotes` (Model: `InvestigationNote`)
Internal and official case progress logs created by police officers.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `crimeReport` | `ObjectId` | Ref: `CrimeReport`, Required, Indexed | Associated crime report |
| `author` | `ObjectId` | Ref: `User`, Required, Indexed | Officer writing the note |
| `content` | `String` | Required, Trim | Note content |
| `isInternalOnly` | `Boolean` | Default: `true` | Visibility flag (Internal vs Citizen) |
| `attachments` | `[String]` | Array of file URLs | Supporting file attachments |

---

### 6. `evidences` (Model: `Evidence`)
File upload metadata and digital chain-of-custody tracking.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `crimeReport` | `ObjectId` | Ref: `CrimeReport`, Required, Indexed | Target crime report |
| `uploadedBy` | `ObjectId` | Ref: `User`, Required, Indexed | Uploader user ID |
| `fileName` | `String` | Required, Trim | Original file name |
| `fileUrl` | `String` | Required, Trim | Stored relative or CDN file URL |
| `fileType` | `String` | Enum: `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `OTHER` | File category |
| `fileSize` | `Number` | Required, Min: 0 | File size in bytes |
| `mimeType` | `String` | Required | Standard MIME type |
| `hash` | `String` | Optional | SHA-256 hash for integrity |
| `description` | `String` | Optional | File description |
| `isPublic` | `Boolean` | Default: `false` | Public access flag |

---

### 7. `casestatushistories` (Model: `CaseStatusHistory`)
Immutable audit record of all case status transitions.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `crimeReport` | `ObjectId` | Ref: `CrimeReport`, Required, Indexed | Target report |
| `changedBy` | `ObjectId` | Ref: `User`, Required | User making status change |
| `previousStatus` | `String` | Enum: `CaseStatus` | Status before change |
| `newStatus` | `String` | Enum: `CaseStatus` | New updated status |
| `reason` | `String` | Optional | Justification for change |
| `changedAt` | `Date` | Default: `Date.now` | Timestamp of change |

---

### 8. `notifications` (Model: `Notification`)
In-app notification system for users and officers.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `recipient` | `ObjectId` | Ref: `User`, Required, Indexed | Target user |
| `title` | `String` | Required | Short notification title |
| `message` | `String` | Required | Notification message body |
| `type` | `String` | Enum: `NotificationType` | Event category |
| `relatedReport` | `ObjectId` | Ref: `CrimeReport`, Default: `null` | Associated report ID |
| `isRead` | `Boolean` | Default: `false`, Indexed | Read status |
| `readAt` | `Date` | Default: `null` | Time notification was read |

---

### 9. `auditlogs` (Model: `AuditLog`)
Security and compliance log of key system activities.

| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Primary Key | Document ID |
| `user` | `ObjectId` | Ref: `User`, Default: `null`, Indexed | User performing action |
| `action` | `String` | Enum: `AuditAction`, Required, Indexed | Action identifier |
| `resource` | `String` | Required | Targeted resource name (e.g. `'User'`) |
| `resourceId` | `String` | Optional | Targeted resource ID |
| `ipAddress` | `String` | Optional | Client IP |
| `userAgent` | `String` | Optional | Client User Agent |
| `details` | `Mixed` | Default: `{}` | Additional structured metadata |

---

## Seed Data Summary

Running `npm run db:seed` clears existing collections and creates:
- **1 Admin Account**: `admin@civicshield.gov.in`
- **3 Police Officers & Profiles**:
  - `officer.sharma@police.gov.in` (Inspector, Cyber Crime Division)
  - `officer.verma@police.gov.in` (Sub-Inspector, Special Crime Branch)
  - `officer.patel@police.gov.in` (Officer, General Crime)
- **5 Citizen Accounts**:
  - `rahul.mehta@gmail.com`
  - `priya.singh@yahoo.com`
  - `amit.kumar@outlook.com`
  - `sneha.deshmukh@gmail.com`
  - `rohan.joshi@gmail.com`
- **10 Crime Reports** across categories with valid GeoJSON point coordinates.
- Associated **Case Assignments**, **Status History**, **Investigation Notes**, **Evidence**, **Notifications**, and **Audit Logs**.

**Default Password for all seeded users:** `Password123!`

---

## Commands

```bash
# Seed database with initial demo dataset
npm run db:seed

# Clear all database collections
npm run db:clear

# Reset database (clear + seed)
npm run db:reset
```
