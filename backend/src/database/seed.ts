import bcrypt from 'bcryptjs';
import connectDatabase, { disconnectDatabase } from '../config/database.js';
import { clearDatabase } from './clear.js';
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
import {
  UserRole,
  UserStatus,
  PoliceStatus,
  CaseStatus,
  Priority,
  CrimeCategory,
  ContactMethod,
  AuditAction,
  NotificationType,
} from '../constants/index.js';

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding Civic Shield MongoDB Database...');
  try {
    await connectDatabase();
    await clearDatabase();

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@civicshield.gov.in',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      phone: '+91 98765 00001',
      status: UserStatus.ACTIVE,
      address: 'Police Headquarters, Marine Drive, Mumbai',
    });
    console.log('  ✔ Created 1 Admin account');

    // 2. Create Police Users & Profiles
    const policeData = [
      {
        name: 'Inspector Rajesh Sharma',
        email: 'officer.sharma@police.gov.in',
        phone: '+91 98765 11001',
        badgeNumber: 'POL-1001',
        rank: 'Inspector',
        department: 'Cyber Crime Division',
        stationName: 'Central Police Station, Mumbai',
        areaAssigned: 'South Mumbai',
        shift: 'Day (08:00 - 16:00)',
      },
      {
        name: 'Sub-Inspector Anita Verma',
        email: 'officer.verma@police.gov.in',
        phone: '+91 98765 11002',
        badgeNumber: 'POL-1002',
        rank: 'Sub-Inspector',
        department: 'Special Crime Branch',
        stationName: 'Andheri Police Station, Mumbai',
        areaAssigned: 'Andheri & Suburban West',
        shift: 'Day (08:00 - 16:00)',
      },
      {
        name: 'Officer Vikram Patel',
        email: 'officer.patel@police.gov.in',
        phone: '+91 98765 11003',
        badgeNumber: 'POL-1003',
        rank: 'Senior Constable',
        department: 'General Crime Investigation',
        stationName: 'Bandra Police Station, Mumbai',
        areaAssigned: 'Bandra & Khar West',
        shift: 'Night (16:00 - 00:00)',
      },
    ];

    const policeUsers = [];
    for (const p of policeData) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        passwordHash: hashedPassword,
        role: UserRole.POLICE,
        phone: p.phone,
        status: UserStatus.ACTIVE,
        address: p.stationName,
      });

      await PoliceProfile.create({
        user: u._id,
        badgeNumber: p.badgeNumber,
        rank: p.rank,
        department: p.department,
        stationName: p.stationName,
        areaAssigned: p.areaAssigned,
        status: PoliceStatus.AVAILABLE,
        shift: p.shift,
        casesAssignedCount: 0,
      });

      policeUsers.push(u);
    }
    console.log('  ✔ Created 3 Police Officers & Profiles');

    // 3. Create Citizens
    const citizenData = [
      { name: 'Rahul Mehta', email: 'rahul.mehta@gmail.com', phone: '+91 98200 12345', address: 'Flat 402, Sunshine Apts, Bandra, Mumbai' },
      { name: 'Priya Singh', email: 'priya.singh@yahoo.com', phone: '+91 98200 23456', address: 'B-12, Green Park Society, Andheri East, Mumbai' },
      { name: 'Amit Kumar', email: 'amit.kumar@outlook.com', phone: '+91 98200 34567', address: 'Plot 77, Sector 15, Vashi, Navi Mumbai' },
      { name: 'Sneha Deshmukh', email: 'sneha.deshmukh@gmail.com', phone: '+91 98200 45678', address: '15 Kothrud Residency, Karve Road, Pune' },
      { name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '+91 98200 56789', address: 'House 88, Model Town, FC Road, Pune' },
    ];

    const citizenUsers = [];
    for (const c of citizenData) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        passwordHash: hashedPassword,
        role: UserRole.CITIZEN,
        phone: c.phone,
        status: UserStatus.ACTIVE,
        address: c.address,
      });
      citizenUsers.push(u);
    }
    console.log('  ✔ Created 5 Citizen accounts');

    // 4. Create 10 Crime Reports with GeoJSON location data
    const reportsSeed = [
      {
        trackingId: 'CR-20261001-0001',
        submittedBy: citizenUsers[0]._id,
        assignedTo: policeUsers[0]._id,
        category: CrimeCategory.CYBER_CRIME,
        title: 'Online Banking Phishing Fraud of ₹85,000',
        description: 'Received an SMS masquerading as bank customer support requesting KYC update via a malicious link. ₹85,000 was debited within minutes.',
        incidentDate: new Date('2026-09-28T14:30:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [72.835, 19.055],
          formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
        },
        status: CaseStatus.UNDER_INVESTIGATION,
        priority: Priority.HIGH,
        contactPreference: ContactMethod.EMAIL,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0002',
        submittedBy: citizenUsers[1]._id,
        assignedTo: policeUsers[1]._id,
        category: CrimeCategory.THEFT,
        title: 'Motorcycle Theft outside Railway Station',
        description: 'Black Honda Activa (MH-02-CB-4321) stolen from the paid parking area outside Andheri Railway Station between 9 AM and 6 PM.',
        incidentDate: new Date('2026-09-29T18:00:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [72.848, 19.119],
          formattedAddress: 'Station Road, Andheri East, Mumbai, Maharashtra 400069',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
        },
        status: CaseStatus.ASSIGNED,
        priority: Priority.MEDIUM,
        contactPreference: ContactMethod.PHONE,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0003',
        submittedBy: citizenUsers[2]._id,
        assignedTo: null,
        category: CrimeCategory.FRAUD,
        title: 'Fake Job Offer Scheme via WhatsApp',
        description: 'Promised high daily income for liking YouTube videos. Deposited initial security fee of ₹25,000 before scammer deleted WhatsApp account.',
        incidentDate: new Date('2026-09-30T11:15:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [72.998, 19.076],
          formattedAddress: 'Sector 17 Market, Vashi, Navi Mumbai, Maharashtra 400703',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400703',
        },
        status: CaseStatus.UNDER_REVIEW,
        priority: Priority.MEDIUM,
        contactPreference: ContactMethod.EMAIL,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0004',
        submittedBy: citizenUsers[3]._id,
        assignedTo: policeUsers[2]._id,
        category: CrimeCategory.HARASSMENT,
        title: 'Stalking and Repeated Threatening Messages',
        description: 'Unknown individual following victim during evening commute from FC Road and sending harassing messages from burner phone numbers.',
        incidentDate: new Date('2026-10-01T20:45:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [73.847, 18.52],
          formattedAddress: 'Fergusson College Road, Shivajinagar, Pune, Maharashtra 411004',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411004',
        },
        status: CaseStatus.UNDER_INVESTIGATION,
        priority: Priority.CRITICAL,
        contactPreference: ContactMethod.PHONE,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0005',
        submittedBy: citizenUsers[4]._id,
        assignedTo: null,
        category: CrimeCategory.MISSING_PERSON,
        title: 'Missing Person Report: Senior Citizen Suresh Joshi',
        description: 'Suresh Joshi (Age 72, 5ft 6in, wearing white kurta) went for morning walk at 6 AM from Kothrud and did not return. Memory impairment history.',
        incidentDate: new Date('2026-10-02T06:00:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [73.814, 18.507],
          formattedAddress: 'Ideal Colony, Kothrud, Pune, Maharashtra 411038',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411038',
        },
        status: CaseStatus.SUBMITTED,
        priority: Priority.CRITICAL,
        contactPreference: ContactMethod.PHONE,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0006',
        submittedBy: citizenUsers[0]._id,
        assignedTo: policeUsers[0]._id,
        category: CrimeCategory.CYBER_CRIME,
        title: 'Unauthorized Access to Corporate Email Account',
        description: 'Attacker breached executive email account and sent fraudulent wire transfer requests to vendor accounts.',
        incidentDate: new Date('2026-09-25T09:00:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [72.825, 18.922],
          formattedAddress: 'Free Press Journal Marg, Nariman Point, Mumbai, Maharashtra 400021',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400021',
        },
        status: CaseStatus.RESOLVED,
        priority: Priority.HIGH,
        contactPreference: ContactMethod.EMAIL,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0007',
        submittedBy: citizenUsers[1]._id,
        assignedTo: policeUsers[1]._id,
        category: CrimeCategory.THEFT,
        title: 'Residential Burglary in Closed Apartment',
        description: 'Gold jewelry and electronics stolen while family was away over the weekend. Front door lock tampered with.',
        incidentDate: new Date('2026-09-27T22:00:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [72.836, 19.136],
          formattedAddress: 'Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
        },
        status: CaseStatus.CLOSED,
        priority: Priority.HIGH,
        contactPreference: ContactMethod.PHONE,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0008',
        submittedBy: citizenUsers[2]._id,
        assignedTo: null,
        category: CrimeCategory.OTHER,
        title: 'Vandalism of Public Property and Park Infrastructure',
        description: 'Benches and street lights vandalized near central park area overnight.',
        incidentDate: new Date('2026-10-03T01:30:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [73.002, 19.065],
          formattedAddress: 'Seawoods Grand Central Area, Navi Mumbai, Maharashtra 400706',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400706',
        },
        status: CaseStatus.SUBMITTED,
        priority: Priority.LOW,
        contactPreference: ContactMethod.EMAIL,
        isAnonymous: true,
      },
      {
        trackingId: 'CR-20261001-0009',
        submittedBy: citizenUsers[3]._id,
        assignedTo: policeUsers[2]._id,
        category: CrimeCategory.THEFT,
        title: 'Chain Snatching Incident near Bus Stop',
        description: 'Two unidentified helmeted riders on a motorcycle snatched gold chain near bus stop and sped off towards Highway.',
        incidentDate: new Date('2026-10-03T17:15:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [73.856, 18.516],
          formattedAddress: 'Swargate Bus Stand Corner, Pune, Maharashtra 411042',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411042',
        },
        status: CaseStatus.ASSIGNED,
        priority: Priority.HIGH,
        contactPreference: ContactMethod.PHONE,
        isAnonymous: false,
      },
      {
        trackingId: 'CR-20261001-0010',
        submittedBy: citizenUsers[4]._id,
        assignedTo: null,
        category: CrimeCategory.FRAUD,
        title: 'E-commerce Credit Card Chargeback Fraud',
        description: 'Fraudulent transaction of ₹42,000 executed using stolen credit card credentials on online portal.',
        incidentDate: new Date('2026-10-04T10:00:00Z'),
        location: {
          type: 'Point' as const,
          coordinates: [73.827, 18.531],
          formattedAddress: 'IT Park Road, Aundh, Pune, Maharashtra 411007',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411007',
        },
        status: CaseStatus.UNDER_REVIEW,
        priority: Priority.MEDIUM,
        contactPreference: ContactMethod.EMAIL,
        isAnonymous: false,
      },
    ];

    const createdReports = [];
    for (const rep of reportsSeed) {
      const r = await CrimeReport.create(rep);
      createdReports.push(r);
    }
    console.log('  ✔ Created 10 Crime Reports with GeoJSON locations');

    // Update case counts for assigned officers
    for (const officer of policeUsers) {
      const count = await CrimeReport.countDocuments({ assignedTo: officer._id });
      await PoliceProfile.updateOne({ user: officer._id }, { casesAssignedCount: count });
    }

    // 5. Create CaseAssignments & History for assigned reports
    const assignedReports = createdReports.filter((r) => r.assignedTo);
    for (const r of assignedReports) {
      await CaseAssignment.create({
        crimeReport: r._id,
        assignedTo: r.assignedTo!,
        assignedBy: adminUser._id,
        assignedAt: new Date(Date.now() - 86400000 * 2),
        status: 'ACTIVE',
        notes: `Assigned case ${r.trackingId} for active investigation based on priority level.`,
      });

      await CaseStatusHistory.create({
        crimeReport: r._id,
        changedBy: adminUser._id,
        previousStatus: CaseStatus.SUBMITTED,
        newStatus: r.status,
        reason: 'Initial assignment to investigating officer.',
        changedAt: new Date(Date.now() - 86400000 * 2),
      });

      // 6. Create Evidence for assigned cases
      const ev = await Evidence.create({
        crimeReport: r._id,
        uploadedBy: r.submittedBy,
        fileName: `incident_evidence_${r.trackingId}.pdf`,
        fileUrl: `/uploads/evidence/${r.trackingId}_proof.pdf`,
        fileType: 'DOCUMENT',
        fileSize: 2048500,
        mimeType: 'application/pdf',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        description: 'Transaction screenshot and official statement submitted by victim.',
        isPublic: false,
      });

      await CrimeReport.updateOne({ _id: r._id }, { $push: { evidenceFiles: ev._id } });

      // 7. Create Investigation Notes
      await InvestigationNote.create({
        crimeReport: r._id,
        author: r.assignedTo!,
        content: `Contacted complainant to verify details for case ${r.trackingId}. Bank nodal officer notified for IP trace logs.`,
        isInternalOnly: true,
        attachments: [],
      });

      // 8. Create Notifications
      await Notification.create({
        recipient: r.submittedBy,
        title: `Case Status Update: ${r.trackingId}`,
        message: `Your report "${r.title}" has been assigned to an investigating officer. Status: ${r.status}.`,
        type: NotificationType.CASE_ASSIGNED,
        relatedReport: r._id,
        isRead: false,
      });
    }
    console.log('  ✔ Created Case Assignments, Status Histories, Evidence, Notes, & Notifications');

    // 9. Create Audit Logs
    await AuditLog.create({
      user: adminUser._id,
      action: AuditAction.REGISTER,
      resource: 'User',
      resourceId: adminUser._id.toString(),
      ipAddress: '127.0.0.1',
      userAgent: 'CivicShield-SeedScript/1.0',
      details: { message: 'Database initialized and seeded with demo dataset.' },
    });
    console.log('  ✔ Created Audit Log entries');

    console.log('');
    console.log('✨ Database seeding finished successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 Demo Credentials:');
    console.log('   Admin:    admin@civicshield.gov.in    / Password123!');
    console.log('   Police:   officer.sharma@police.gov.in / Password123!');
    console.log('   Police:   officer.verma@police.gov.in  / Password123!');
    console.log('   Police:   officer.patel@police.gov.in  / Password123!');
    console.log('   Citizen:  rahul.mehta@gmail.com       / Password123!');
    console.log('   Citizen:  priya.singh@yahoo.com        / Password123!');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Execute directly if run via CLI
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'));
if (isDirectRun) {
  seedDatabase()
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
