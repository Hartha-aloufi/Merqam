# 🔒 Security Guide - Authentication & Protection Systems

## 🛡️ Security Overview

Merqam implements comprehensive security measures to protect user data, prevent system abuse, and ensure reliable service delivery.

---

## 🔐 Authentication System

### 🏗️ JWT-Based Security

**Token Architecture:**
- **Access Tokens:** Short-lived (15 minutes) for API access
- **Refresh Tokens:** Long-lived (7 days) for session renewal
- **Storage:** HTTP-only cookies (XSS protection)
- **Transmission:** HTTPS only in production

**Security Features:**
```typescript
// Token validation with automatic refresh
const token = cookieStore.get('token')?.value;
if (!token || isExpired(token)) {
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (refreshToken && !isExpired(refreshToken)) {
    const newTokens = await refreshAccessToken(refreshToken);
    // Update cookies with new tokens
  } else {
    throw new Error('Authentication required');
  }
}
```

### 🌐 OAuth Integration

**Google OAuth 2.0:**
- **Scope:** Limited to email and profile information
- **Flow:** Authorization code with PKCE
- **Security:** State parameter validation
- **Data Minimization:** Only essential user data stored

**Implementation:**
```typescript
// Secure OAuth callback handling
export async function handleGoogleCallback(code: string, state: string) {
  // Validate state parameter
  if (!validateState(state)) {
    throw new Error('Invalid OAuth state');
  }
  
  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code);
  const userInfo = await fetchGoogleUserInfo(tokens.access_token);
  
  // Create or update user
  const user = await createOrUpdateUser(userInfo);
  return generateJWTTokens(user);
}
```

---

## 🛡️ Rate Limiting & Abuse Prevention

### ⏱️ Request Limits

**User Rate Limits:**
- **Lesson Requests:** 3 per hour per authenticated user
- **API Calls:** 100 per minute per user
- **Authentication Attempts:** 5 per 15 minutes per IP

**Implementation:**
```typescript
async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const limits = {
    'lesson_request': { count: 3, window: 60 * 60 * 1000 }, // 3 per hour
    'api_call': { count: 100, window: 60 * 1000 },         // 100 per minute
    'auth_attempt': { count: 5, window: 15 * 60 * 1000 }   // 5 per 15 min
  };
  
  const limit = limits[action];
  const windowStart = new Date(Date.now() - limit.window);
  
  const recentActions = await db
    .selectFrom('rate_limit_log')
    .where('user_id', '=', userId)
    .where('action', '=', action)
    .where('created_at', '>', windowStart)
    .select(['id'])
    .execute();
    
  return recentActions.length < limit.count;
}
```

### 🔄 Retry Protection

**Cooldown System:**
- **Failed Jobs:** 1-hour minimum between retry attempts
- **Progressive Delays:** Exponential backoff for repeated failures
- **Cleanup:** Automatic removal of old failed jobs

**Smart Retry Logic:**
```typescript
// Cooldown validation before retry
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
if (job.updated_at > oneHourAgo) {
  const waitMinutes = Math.ceil(
    (60 * 60 * 1000 - (Date.now() - job.updated_at.getTime())) / (1000 * 60)
  );
  return { 
    success: false, 
    error: `يجب الانتظار ${waitMinutes} دقيقة قبل إعادة المحاولة` 
  };
}
```

---

## 🔍 Input Validation & Sanitization

### 🛡️ URL Validation

**YouTube URL Patterns:**
```typescript
const YOUTUBE_URL_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  /^https?:\/\/(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/
];

function validateAndExtractVideoId(url: string): { isValid: boolean; videoId?: string } {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { isValid: true, videoId: match[1] };
    }
  }
  return { isValid: false };
}
```

### 📝 Content Sanitization

**User Input Processing:**
- **HTML Sanitization:** Strip dangerous HTML tags and attributes
- **SQL Injection Prevention:** Parameterized queries with Kysely
- **XSS Protection:** Content Security Policy headers
- **Path Traversal:** Whitelist allowed file paths

**Zod Schema Validation:**
```typescript
const CreateJobSchema = z.object({
  url: z.string().url().refine(url => validateYouTubeUrl(url).isValid, {
    message: "Must be a valid YouTube URL"
  }),
  aiService: z.enum(['openai', 'gemini']),
  priority: z.number().min(0).max(10).optional(),
  userId: z.string().uuid()
});

// Validate input before processing
const validatedInput = CreateJobSchema.parse(rawInput);
```

---

## 👨‍💼 Authorization & Access Control

### 🔐 Admin Protection

**Role-Based Access:**
```typescript
// Admin authorization check
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

function isAdmin(user: User): boolean {
  // Current implementation - can be extended to role-based
  return user.email === 'admin@example.com';
}
```

**Protected Routes:**
- **Admin Dashboard:** `/admin/*` - Admin role required
- **Job Management:** User ownership validation
- **System Operations:** Admin-only functions

### 👤 User Ownership

**Resource Access Control:**
```typescript
// Verify user owns the resource
async function validateJobOwnership(jobId: string, userId: string): Promise<boolean> {
  const job = await db
    .selectFrom('generation_jobs')
    .where('id', '=', jobId)
    .where('user_id', '=', userId)
    .select(['id'])
    .executeTakeFirst();
    
  return !!job;
}

// Example usage in job operations
export async function retryFailedJob(jobId: string, userId: string) {
  if (!await validateJobOwnership(jobId, userId)) {
    throw new Error('Access denied: Job not found or not owned by user');
  }
  
  // Proceed with retry logic
}
```

---

## 🔒 Data Protection

### 📊 Sensitive Data Handling

**Password Security:**
- **Hashing:** bcrypt with salt rounds (12)
- **Storage:** Never store plain text passwords
- **Transmission:** HTTPS only
- **Validation:** Strong password requirements

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**API Key Management:**
- **Environment Variables:** Sensitive keys in secure environment
- **Rotation:** Regular key rotation for external services
- **Scoping:** Minimal permissions for API keys
- **Monitoring:** Usage tracking and anomaly detection

### 🗄️ Database Security

**Query Safety:**
```typescript
// Safe parameterized queries with Kysely
const user = await db
  .selectFrom('users')
  .where('email', '=', userEmail) // Parameterized - safe from SQL injection
  .select(['id', 'email', 'name'])
  .executeTakeFirst();

// Never use string concatenation:
// ❌ BAD: `SELECT * FROM users WHERE email = '${userEmail}'`
// ✅ GOOD: Kysely parameterized queries
```

**Connection Security:**
- **SSL/TLS:** Encrypted database connections
- **Network Isolation:** Database in private subnet
- **Access Control:** Restricted database user permissions
- **Audit Logging:** Database operation logging

---

## 🌐 Network Security

### 🔐 HTTPS & Transport Security

**SSL/TLS Configuration:**
- **TLS 1.3:** Modern encryption standards
- **HSTS:** HTTP Strict Transport Security headers
- **Certificate Pinning:** Additional certificate validation
- **Secure Cookies:** Secure and SameSite flags

**Content Security Policy:**
```typescript
// CSP headers for XSS protection
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com",
  "frame-ancestors 'none'"
].join('; ');
```

### 🛡️ API Security

**Request Validation:**
- **Origin Verification:** Check request origins
- **User Agent Validation:** Block suspicious clients
- **Size Limits:** Prevent payload attacks
- **Timeout Protection:** Request timeout enforcement

**Error Handling:**
```typescript
// Secure error responses - don't leak internal details
export function createSecureErrorResponse(error: Error, isProduction: boolean) {
  if (isProduction) {
    // Generic error message for production
    return { error: 'An error occurred. Please try again.' };
  } else {
    // Detailed errors for development
    return { error: error.message, stack: error.stack };
  }
}
```

---

## 📊 Monitoring & Incident Response

### 🔍 Security Monitoring

**Automated Detection:**
- **Failed Login Attempts:** Multiple failures from same IP
- **Unusual Activity:** Rapid API calls or abnormal patterns
- **Resource Abuse:** Excessive job creation or system load
- **Data Access:** Unauthorized access attempts

**Logging Strategy:**
```typescript
// Security event logging
export function logSecurityEvent(event: SecurityEvent) {
  logger.warn('Security Event', {
    type: event.type,
    userId: event.userId,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: new Date().toISOString(),
    details: event.details
  });
  
  // Trigger alerts for critical events
  if (event.severity === 'critical') {
    alertingService.triggerAlert(event);
  }
}
```

### 🚨 Incident Response

**Response Procedures:**
1. **Detection:** Automated monitoring alerts
2. **Assessment:** Determine severity and impact
3. **Containment:** Limit damage and prevent spread
4. **Investigation:** Analyze logs and determine cause
5. **Recovery:** Restore normal operations
6. **Documentation:** Record incident and lessons learned

**Emergency Actions:**
- **Account Suspension:** Immediate user account lockdown
- **Rate Limit Adjustment:** Dynamic limit modifications
- **Service Shutdown:** Emergency system shutdown capability
- **Data Backup:** Secure backup procedures

---

## 🔧 Security Configuration

### ⚙️ Environment Security

**Production Checklist:**
- [ ] HTTPS enforced with valid certificates
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] API keys rotated and scoped
- [ ] Logging configured and monitored
- [ ] Backup procedures tested
- [ ] Rate limits properly configured
- [ ] Security headers implemented

**Development Security:**
- **Separate Environments:** Dev/staging/production isolation
- **Test Data:** No production data in development
- **Access Control:** Limited development access
- **Code Review:** Security-focused code reviews

### 📋 Security Headers

```typescript
// Essential security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': cspHeader
};
```

---

## 📚 Security Best Practices

### 👩‍💻 For Developers

**Code Security:**
- **Input Validation:** Validate all user inputs
- **Output Encoding:** Encode data for different contexts
- **Authentication:** Use established libraries and patterns
- **Authorization:** Implement least privilege access
- **Error Handling:** Avoid information disclosure
- **Dependency Management:** Keep dependencies updated

**Security Testing:**
- **Static Analysis:** Code scanning for vulnerabilities
- **Dynamic Testing:** Runtime security testing
- **Penetration Testing:** Regular security assessments
- **Dependency Scanning:** Check for known vulnerabilities

### 👨‍💼 For Administrators

**Operational Security:**
- **Access Control:** Regular access reviews
- **Monitoring:** Continuous security monitoring
- **Updates:** Timely security patches
- **Backups:** Regular secure backups
- **Incident Response:** Prepared response procedures
- **Training:** Security awareness for team

**Compliance:**
- **Data Protection:** User privacy compliance
- **Audit Trails:** Comprehensive logging
- **Access Logs:** Administrative action tracking
- **Change Management:** Controlled system changes

---

## 🆘 Security Contacts

### 🚨 Incident Reporting

**Security Issues:**
- **Critical:** Immediate escalation to development team
- **High:** Report within 4 hours
- **Medium:** Report within 24 hours
- **Low:** Include in regular reports

**Contact Information:**
- **Development Team:** For technical security issues
- **System Administrator:** For operational concerns
- **Legal/Compliance:** For privacy or legal matters

---

**🔒 Security Policy Version:** 2.0  
**📅 Last Updated:** January 2025  
**🔄 Next Review:** March 2025  
**👥 Security Team:** Merqam Development Team