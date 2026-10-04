// ────────────────────────────────────────────────
// Case Status Enum & Transitions
// ────────────────────────────────────────────────

export const CaseStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
} as const;

export type CaseStatusType = (typeof CaseStatus)[keyof typeof CaseStatus];

// Valid status transitions map
export const VALID_STATUS_TRANSITIONS: Record<CaseStatusType, CaseStatusType[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['UNDER_INVESTIGATION'],
  UNDER_INVESTIGATION: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
};

export function isValidStatusTransition(
  currentStatus: CaseStatusType,
  newStatus: CaseStatusType
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

// ────────────────────────────────────────────────
// Priority Enum
// ────────────────────────────────────────────────

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type PriorityType = (typeof Priority)[keyof typeof Priority];

// ────────────────────────────────────────────────
// User Roles
// ────────────────────────────────────────────────

export const UserRole = {
  CITIZEN: 'CITIZEN',
  POLICE: 'POLICE',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// ────────────────────────────────────────────────
// Crime Categories
// ────────────────────────────────────────────────

export const CrimeCategory = {
  THEFT: 'THEFT',
  FRAUD: 'FRAUD',
  CYBER_CRIME: 'CYBER_CRIME',
  HARASSMENT: 'HARASSMENT',
  MISSING_PERSON: 'MISSING_PERSON',
  OTHER: 'OTHER',
} as const;

export type CrimeCategoryType = (typeof CrimeCategory)[keyof typeof CrimeCategory];

// ────────────────────────────────────────────────
// Audit Actions
// ────────────────────────────────────────────────

export const AuditAction = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  REPORT_CREATED: 'REPORT_CREATED',
  REPORT_VIEWED: 'REPORT_VIEWED',
  REPORT_UPDATED: 'REPORT_UPDATED',
  CASE_ASSIGNED: 'CASE_ASSIGNED',
  CASE_REASSIGNED: 'CASE_REASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  INVESTIGATION_NOTE_CREATED: 'INVESTIGATION_NOTE_CREATED',
  EVIDENCE_UPLOADED: 'EVIDENCE_UPLOADED',
  EVIDENCE_DELETED: 'EVIDENCE_DELETED',
  USER_UPDATED: 'USER_UPDATED',
  OFFICER_UPDATED: 'OFFICER_UPDATED',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

// ────────────────────────────────────────────────
// Notification Types
// ────────────────────────────────────────────────

export const NotificationType = {
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  REPORT_REVIEWED: 'REPORT_REVIEWED',
  CASE_ASSIGNED: 'CASE_ASSIGNED',
  CASE_REASSIGNED: 'CASE_REASSIGNED',
  INVESTIGATION_STARTED: 'INVESTIGATION_STARTED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  CASE_RESOLVED: 'CASE_RESOLVED',
  CASE_CLOSED: 'CASE_CLOSED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  NEW_REPORT: 'NEW_REPORT',
  CRITICAL_REPORT: 'CRITICAL_REPORT',
  CASE_UPDATE: 'CASE_UPDATE',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

// ────────────────────────────────────────────────
// Contact Methods
// ────────────────────────────────────────────────

export const ContactMethod = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
} as const;

export type ContactMethodType = (typeof ContactMethod)[keyof typeof ContactMethod];

// ────────────────────────────────────────────────
// User Status
// ────────────────────────────────────────────────

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

// ────────────────────────────────────────────────
// Police Officer Status
// ────────────────────────────────────────────────

export const PoliceStatus = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  ON_LEAVE: 'ON_LEAVE',
} as const;

export type PoliceStatusType = (typeof PoliceStatus)[keyof typeof PoliceStatus];

