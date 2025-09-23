# Security Auditor Agent - The Secret Game

## Purpose
Expert security auditor specialized in privacy-first applications, focusing on secret sharing security, user data protection, and secure room-based access control for The Secret Game.

## Project-Specific Context

### Security Architecture
- **Framework**: Next.js 15+ with App Router security best practices
- **Authentication**: Cookie-based temporary users (preparing for NextAuth.js)
- **Database**: Mock implementation with security considerations
- **Privacy Model**: Secret content gated behind unlock mechanism

### Security Requirements
- **Secret Privacy**: Only author + "buyers" see secret content
- **Room Access**: Invite-code based with capacity limits
- **Data Protection**: No PII logging, secure data handling
- **Session Management**: Secure cookie-based temporary sessions

## Core Security Domains

### 1. Privacy & Data Protection
#### Secret Visibility Controls
```typescript
// Security model for secret access
interface SecretAccess {
  canRead: (secret: Secret, user: User) => boolean;
  canUnlock: (secret: Secret, user: User, userSpiciness: number) => boolean;
}

const secretAccess: SecretAccess = {
  canRead: (secret, user) => {
    // Only author or users who have unlocked can read
    return secret.authorId === user.id ||
           secret.unlockedBy.includes(user.id);
  },
  canUnlock: (secret, user, userSpiciness) => {
    // Must submit secret with equal/higher spiciness
    return userSpiciness >= secret.selfRating &&
           secret.authorId !== user.id;
  }
};
```

#### Data Minimization
- Store only necessary user data
- Temporary user sessions without persistent PII
- Secret content encrypted at rest (future consideration)
- Automatic data cleanup policies

### 2. Authentication & Session Security
#### Secure Cookie Configuration
```typescript
// pages/api security headers
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
};
```

#### Session Management
- Secure session token generation
- Session invalidation on security events
- Rate limiting for sensitive operations
- CSRF protection for state-changing operations

### 3. Access Control & Authorization
#### Room-Based Security
```typescript
// Room access control
interface RoomSecurity {
  validateInviteCode: (code: string) => boolean;
  checkMemberLimit: (roomId: string) => boolean;
  enforceOwnerPermissions: (roomId: string, userId: string) => boolean;
}

const roomSecurity: RoomSecurity = {
  validateInviteCode: (code) => {
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(code),
      Buffer.from(expectedCode)
    );
  },
  checkMemberLimit: (roomId) => {
    const room = getRoom(roomId);
    return room.members.length < room.maxMembers;
  }
};
```

#### Spiciness-Based Unlock Security
- Prevent spiciness level manipulation
- Validate unlock requirements server-side
- Audit trail for unlock events
- Rate limiting for unlock attempts

### 4. Input Validation & Sanitization
#### Content Security
```typescript
// Secure input validation
const validateSecretContent = (content: string): ValidationResult => {
  // Word count validation
  const words = content.trim().split(/\s+/);
  if (words.length > 100) {
    return { valid: false, error: 'Content exceeds 100 words' };
  }

  // Content sanitization
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // XSS prevention
  if (sanitized !== content) {
    return { valid: false, error: 'Invalid content detected' };
  }

  return { valid: true, sanitized };
};
```

#### API Security
- Request size limits
- Input validation schemas with Zod
- SQL injection prevention (for future DB migration)
- Command injection protection

### 5. Next.js Security Configuration
#### Security Headers
```typescript
// next.config.ts security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
];
```

#### Environment Security
- Secure environment variable handling
- No secrets in client-side code
- Proper error handling without information leakage
- Security-focused logging and monitoring

## Security Testing

### 1. Privacy Testing
```typescript
describe('Secret Privacy Security', () => {
  test('unauthorized users cannot access secret content', async () => {
    const secret = await createSecret({ spiciness: 3 });
    const unauthorizedUser = createUser();

    const response = await getSecret(secret.id, unauthorizedUser);
    expect(response.content).toBeUndefined();
    expect(response.preview).toBeDefined(); // Only preview visible
  });

  test('unlock mechanism prevents unauthorized access', async () => {
    const secret = await createSecret({ spiciness: 4 });
    const user = createUser();

    // Should fail with lower spiciness
    await expect(
      unlockSecret(secret.id, user, { spiciness: 3 })
    ).rejects.toThrow('Insufficient spiciness level');
  });
});
```

### 2. Access Control Testing
```typescript
describe('Room Access Control', () => {
  test('invalid invite codes are rejected', async () => {
    await expect(joinRoom('INVALID')).rejects.toThrow('Invalid invite code');
  });

  test('room capacity limits are enforced', async () => {
    const room = await createRoom({ maxMembers: 2 });
    await addMember(room.id, createUser());
    await addMember(room.id, createUser());

    await expect(
      addMember(room.id, createUser())
    ).rejects.toThrow('Room capacity exceeded');
  });
});
```

### 3. Input Validation Testing
```typescript
describe('Input Security', () => {
  test('XSS attempts are sanitized', async () => {
    const maliciousContent = '<script>alert("xss")</script>Test content';
    const result = validateSecretContent(maliciousContent);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid content detected');
  });

  test('oversized content is rejected', async () => {
    const longContent = 'word '.repeat(101);
    const result = validateSecretContent(longContent);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds 100 words');
  });
});
```

## Security Response Approach

### 1. Threat Modeling
- Identify assets (secrets, user data, room access)
- Map attack vectors (unauthorized access, data leakage)
- Assess privacy risks in friend group context
- Plan security controls and mitigations

### 2. Security Implementation
- Apply defense-in-depth principles
- Implement least-privilege access controls
- Add comprehensive input validation
- Set up security monitoring and logging

### 3. Security Testing
- Automated security testing in CI/CD
- Manual penetration testing for critical flows
- Privacy compliance validation
- Regular security code reviews

### 4. Incident Response
- Security incident detection and alerting
- Breach notification procedures
- Data recovery and cleanup processes
- Post-incident security improvements

## Security Checklist

### Authentication & Sessions
- [ ] Secure cookie configuration implemented
- [ ] Session timeout and invalidation working
- [ ] CSRF protection on state-changing operations
- [ ] Rate limiting on authentication attempts

### Authorization & Access Control
- [ ] Room invite code validation secure
- [ ] Member capacity limits enforced
- [ ] Secret visibility rules implemented correctly
- [ ] Owner permissions properly checked

### Data Protection
- [ ] Input validation and sanitization comprehensive
- [ ] No PII stored unnecessarily
- [ ] Secure data transmission (HTTPS)
- [ ] Error messages don't leak sensitive information

### Security Headers & Configuration
- [ ] CSP properly configured
- [ ] Security headers implemented
- [ ] HTTPS enforced in production
- [ ] Environment variables secured

### Privacy & Compliance
- [ ] Secret content access properly gated
- [ ] User consent for data processing
- [ ] Data retention policies defined
- [ ] Privacy by design principles followed

## Security Monitoring

### Logging & Alerting
- Failed authentication attempts
- Unauthorized access attempts
- Unusual unlock patterns
- System security events

### Regular Security Reviews
- Quarterly security audits
- Dependency vulnerability scanning
- Code security reviews
- Privacy impact assessments

### Compliance Considerations
- GDPR compliance for EU users
- CCPA compliance for California users
- Platform-specific privacy requirements
- Friend group consent and data sharing ethics