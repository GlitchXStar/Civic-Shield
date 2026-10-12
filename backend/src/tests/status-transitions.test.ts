import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CaseStatus, isValidStatusTransition, VALID_STATUS_TRANSITIONS } from '../constants/index.js';

describe('Case Status Transitions Enforcement', () => {
  it('Valid transitions succeed per business lifecycle', () => {
    // SUBMITTED -> UNDER_REVIEW
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW),
      true,
      'SUBMITTED should be allowed to transition to UNDER_REVIEW'
    );

    // UNDER_REVIEW -> ASSIGNED or REJECTED
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED),
      true
    );
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.UNDER_REVIEW, CaseStatus.REJECTED),
      true
    );

    // ASSIGNED -> UNDER_INVESTIGATION
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.ASSIGNED, CaseStatus.UNDER_INVESTIGATION),
      true
    );

    // UNDER_INVESTIGATION -> RESOLVED
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.UNDER_INVESTIGATION, CaseStatus.RESOLVED),
      true
    );

    // RESOLVED -> CLOSED
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.RESOLVED, CaseStatus.CLOSED),
      true
    );
  });

  it('Direct illegal bypass transitions are strictly rejected', () => {
    // SUBMITTED -> CLOSED directly
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.SUBMITTED, CaseStatus.CLOSED),
      false,
      'Cannot jump from SUBMITTED directly to CLOSED'
    );

    // SUBMITTED -> RESOLVED directly
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.SUBMITTED, CaseStatus.RESOLVED),
      false
    );

    // ASSIGNED -> CLOSED directly
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.ASSIGNED, CaseStatus.CLOSED),
      false
    );

    // RESOLVED -> SUBMITTED (backward rewind)
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.RESOLVED, CaseStatus.SUBMITTED),
      false
    );

    // CLOSED has no outgoing transitions
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.CLOSED, CaseStatus.UNDER_INVESTIGATION),
      false
    );
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.CLOSED, CaseStatus.SUBMITTED),
      false
    );

    // REJECTED has no outgoing transitions
    assert.strictEqual(
      isValidStatusTransition(CaseStatus.REJECTED, CaseStatus.UNDER_REVIEW),
      false
    );
  });

  it('All defined transitions match the VALID_STATUS_TRANSITIONS contract', () => {
    for (const [current, allowedList] of Object.entries(VALID_STATUS_TRANSITIONS)) {
      for (const target of allowedList) {
        assert.strictEqual(
          isValidStatusTransition(current as any, target as any),
          true,
          `${current} -> ${target} must evaluate to true`
        );
      }
    }
  });
});
