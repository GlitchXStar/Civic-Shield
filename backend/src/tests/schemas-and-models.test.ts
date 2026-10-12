import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { CaseStatusHistory } from '../models/CaseStatusHistory.js';
import { CaseAssignment } from '../models/CaseAssignment.js';
import { InvestigationNote } from '../models/InvestigationNote.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { CrimeReport } from '../models/CrimeReport.js';
import { User } from '../models/User.js';

describe('Mongoose Schemas & Field Contract Verification', () => {
  it('CaseStatusHistory model defines correct relationship and transition fields', () => {
    const paths = CaseStatusHistory.schema.paths;
    assert.ok(paths['crimeReport'], 'CaseStatusHistory must have crimeReport reference path');
    assert.ok(paths['changedBy'], 'CaseStatusHistory must have changedBy reference path');
    assert.ok(paths['previousStatus'], 'CaseStatusHistory must have previousStatus path');
    assert.ok(paths['newStatus'], 'CaseStatusHistory must have newStatus path');
    assert.ok(paths['reason'] || paths['remarks'], 'CaseStatusHistory must have reason/remarks path');
  });

  it('CaseAssignment model defines correct relationship paths', () => {
    const paths = CaseAssignment.schema.paths;
    assert.ok(paths['crimeReport'], 'CaseAssignment must reference crimeReport');
    assert.ok(paths['assignedTo'], 'CaseAssignment must reference assignedTo');
    assert.ok(paths['assignedBy'], 'CaseAssignment must reference assignedBy');
  });

  it('InvestigationNote model defines author and content fields', () => {
    const paths = InvestigationNote.schema.paths;
    assert.ok(paths['crimeReport'], 'InvestigationNote must reference crimeReport');
    assert.ok(paths['author'], 'InvestigationNote must reference author');
    assert.ok(paths['content'] || paths['note'], 'InvestigationNote must have content or note field');
  });

  it('Notification model defines recipient and read state fields', () => {
    const paths = Notification.schema.paths;
    assert.ok(paths['recipient'], 'Notification must reference recipient');
    assert.ok(paths['isRead'], 'Notification must have isRead flag');
    assert.ok(paths['title'], 'Notification must have title');
    assert.ok(paths['message'], 'Notification must have message');
  });

  it('AuditLog model defines user, action, and resource fields', () => {
    const paths = AuditLog.schema.paths;
    assert.ok(paths['user'], 'AuditLog must reference user');
    assert.ok(paths['action'], 'AuditLog must have action field');
    assert.ok(paths['resource'], 'AuditLog must have resource field');
  });

  it('CrimeReport model defines GeoJSON coordinates [longitude, latitude]', () => {
    const paths = CrimeReport.schema.paths;
    const locationPath = CrimeReport.schema.path('location') as any;
    assert.ok(locationPath, 'CrimeReport must have location schema path');
    const coordPath = locationPath.schema?.paths['coordinates'];
    assert.ok(coordPath, 'CrimeReport location subschema must define coordinates array');
    assert.ok(paths['submittedBy'], 'CrimeReport must reference submittedBy user');
    assert.ok(paths['category'], 'CrimeReport must have category field');
    assert.ok(paths['status'], 'CrimeReport must have status field');
  });
});
