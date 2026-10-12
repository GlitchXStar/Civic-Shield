import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole } from '../constants/index.js';
import { AppError } from '../middleware/error.middleware.js';

describe('BOLA & Case Assignment Authorization Logic', () => {
  it('Citizen can access only their own reports', () => {
    const reportOwnerId = 'user_citizen_owner';
    const unauthorizedCitizenId = 'user_citizen_stranger';

    const mockReport = {
      _id: 'report_101',
      submittedBy: reportOwnerId,
      title: 'Stolen Bicycle',
    };

    // Owner checks
    const canOwnerAccess = (userId: string, report: typeof mockReport) => {
      const ownerId = typeof report.submittedBy === 'object' 
        ? (report.submittedBy as any)._id?.toString() 
        : report.submittedBy.toString();
      return ownerId === userId;
    };

    assert.strictEqual(canOwnerAccess(reportOwnerId, mockReport), true);
    assert.strictEqual(canOwnerAccess(unauthorizedCitizenId, mockReport), false);
  });

  it('Police officer access requires explicit assignment to case (BOLA prevention)', () => {
    const assignedOfficerId = 'officer_alpha';
    const unassignedOfficerId = 'officer_bravo';
    const adminId = 'admin_super';

    const mockCase = {
      _id: 'case_202',
      assignedTo: assignedOfficerId,
      status: 'UNDER_INVESTIGATION',
    };

    const verifyOfficerCaseAccess = (user: { id: string; role: string }, caseItem: typeof mockCase) => {
      if (user.role === UserRole.ADMIN) {
        return true; // Admin has supervisory access
      }
      if (user.role === UserRole.POLICE) {
        const assignedId = caseItem.assignedTo?.toString();
        if (assignedId !== user.id) {
          throw new AppError('You are not authorized to access or modify this case', 403, 'FORBIDDEN');
        }
        return true;
      }
      return false;
    };

    // 1. Assigned officer succeeds
    assert.strictEqual(
      verifyOfficerCaseAccess({ id: assignedOfficerId, role: UserRole.POLICE }, mockCase),
      true
    );

    // 2. Unassigned officer is rejected with 403 FORBIDDEN
    assert.throws(
      () => verifyOfficerCaseAccess({ id: unassignedOfficerId, role: UserRole.POLICE }, mockCase),
      (err: any) => err.statusCode === 403 && err.errorCode === 'FORBIDDEN'
    );

    // 3. Admin succeeds
    assert.strictEqual(
      verifyOfficerCaseAccess({ id: adminId, role: UserRole.ADMIN }, mockCase),
      true
    );
  });

  it('Evidence file access requires report ownership or assigned officer authorization', () => {
    const citizenOwner = 'citizen_1';
    const otherCitizen = 'citizen_2';
    const assignedOfficer = 'officer_1';
    const otherOfficer = 'officer_2';

    const mockReport = {
      _id: 'report_303',
      submittedBy: citizenOwner,
      assignedTo: assignedOfficer,
    };

    const isAuthorizedForEvidence = (user: { id: string; role: string }, report: typeof mockReport) => {
      if (user.role === UserRole.ADMIN) return true;
      if (user.role === UserRole.CITIZEN) {
        return report.submittedBy === user.id;
      }
      if (user.role === UserRole.POLICE) {
        return report.assignedTo === user.id;
      }
      return false;
    };

    assert.strictEqual(isAuthorizedForEvidence({ id: citizenOwner, role: UserRole.CITIZEN }, mockReport), true);
    assert.strictEqual(isAuthorizedForEvidence({ id: otherCitizen, role: UserRole.CITIZEN }, mockReport), false);
    assert.strictEqual(isAuthorizedForEvidence({ id: assignedOfficer, role: UserRole.POLICE }, mockReport), true);
    assert.strictEqual(isAuthorizedForEvidence({ id: otherOfficer, role: UserRole.POLICE }, mockReport), false);
  });
});
