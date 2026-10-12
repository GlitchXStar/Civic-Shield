import connectDatabase, { disconnectDatabase } from '../config/database.js';
import {
  User,
  PoliceProfile,
  CrimeReport,
  CaseAssignment,
  InvestigationNote,
  Evidence,
  CaseStatusHistory,
  Notification,
  AuditLog,
} from '../models/index.js';

export async function clearDatabase(): Promise<void> {
  console.log('🧹 Clearing Civic Shield MongoDB collections...');
  try {
    await connectDatabase();

    await Promise.all([
      User.deleteMany({}),
      PoliceProfile.deleteMany({}),
      CrimeReport.deleteMany({}),
      CaseAssignment.deleteMany({}),
      InvestigationNote.deleteMany({}),
      Evidence.deleteMany({}),
      CaseStatusHistory.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('✅ All collections cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// Execute directly if run via CLI
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('clear.ts') || process.argv[1].endsWith('clear.js'));
if (isDirectRun) {
  clearDatabase()
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
