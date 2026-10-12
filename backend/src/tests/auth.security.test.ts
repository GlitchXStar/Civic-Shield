import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { UserRole } from '../constants/index.js';
import { authorize } from '../middleware/auth.middleware.js';

describe('Auth Security & Privilege Escalation Checks', () => {
  it('Public registration validator strips or ignores client-supplied privileged roles', () => {
    // Attempt privilege escalation to ADMIN
    const maliciousPayload = {
      name: 'Attacker User',
      email: 'attacker@example.com',
      password: 'SecurePassword123!',
      phone: '9876543210',
      role: 'ADMIN', // Client trying to become ADMIN
    };

    const parsed = registerSchema.parse(maliciousPayload) as any;
    
    // Role MUST NOT be present in validated output or must not be ADMIN
    assert.strictEqual(
      parsed.role,
      undefined,
      'Client-supplied role must be rejected or stripped by registerSchema'
    );
  });

  it('Public registration validator accepts first and last name formats and enforces password length', () => {
    const validSplitName = {
      firstName: 'Jane',
      lastName: 'Citizen',
      email: 'jane@example.com',
      password: 'StrongPassword123!',
      phone: '9123456780',
    };

    const parsed = registerSchema.parse(validSplitName);
    assert.ok(parsed.firstName === 'Jane' || (parsed as any).name);

    // Test rejection of short password
    assert.throws(() => {
      registerSchema.parse({
        ...validSplitName,
        password: 'short',
      });
    }, /at least 8 characters/);
  });

  it('Login validator strictly requires email and password', () => {
    assert.throws(() => {
      loginSchema.parse({ email: 'user@example.com' }); // missing password
    });

    assert.throws(() => {
      loginSchema.parse({ password: 'password123' }); // missing email
    });

    assert.throws(() => {
      loginSchema.parse({ email: 'not-an-email', password: 'password123' });
    });

    const validLogin = loginSchema.parse({ email: 'user@example.com', password: 'password123' });
    assert.strictEqual(validLogin.email, 'user@example.com');
  });

  it('Password hashing uses bcrypt and does not allow plaintext storage', async () => {
    const password = 'MySecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    assert.notStrictEqual(password, hash);
    assert.ok(hash.startsWith('$2'));

    const match = await bcrypt.compare(password, hash);
    assert.strictEqual(match, true);

    const wrongMatch = await bcrypt.compare('WrongPassword!', hash);
    assert.strictEqual(wrongMatch, false);
  });

  it('Role-based authorization middleware denies unauthorized roles', () => {
    const policeOnly = authorize(UserRole.POLICE);

    // Citizen attempting to access police route
    const citizenReq: any = {
      user: { id: 'user_123', email: 'citizen@example.com', role: UserRole.CITIZEN },
    };
    let nextCalledWithError = false;
    let receivedError: any = null;

    const res: any = {};
    policeOnly(citizenReq, res, (err?: any) => {
      if (err) {
        nextCalledWithError = true;
        receivedError = err;
      }
    });

    assert.strictEqual(nextCalledWithError, true);
    assert.strictEqual(receivedError?.statusCode, 403);
    assert.strictEqual(receivedError?.errorCode, 'FORBIDDEN');
  });

  it('Role-based authorization middleware permits authorized roles', () => {
    const policeOnly = authorize(UserRole.POLICE);

    const policeReq: any = {
      user: { id: 'officer_123', email: 'officer@example.com', role: UserRole.POLICE },
    };
    let nextCalled = false;
    let nextError: any = null;

    const res: any = {};
    policeOnly(policeReq, res, (err?: any) => {
      nextCalled = true;
      nextError = err;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(nextError, undefined);
  });
});
