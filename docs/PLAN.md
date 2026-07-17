# PLAN: API & App Security Implementation Plan

This plan details the security enhancements to be made to the client web/mobile application database (Supabase) and the B2B Partner API service (Node.js Express).

---

## 🔒 Proposed Security Enhancements

### 1. Database Security (Supabase Row Level Security - RLS)
- **Problem:** Currently, none of the database tables have Row Level Security enabled. This allows any user with the anonymous/public API key to read, update, or delete any record.
- **Solution:** Write a new PostgreSQL migration `supabase/migrations/20260717_security_rls.sql` that:
  - Enables RLS on all tables (`profiles`, `orders`, `appointments`, `emergency_requests`, `carwash_requests`, `insurance_claims`, `insurance_quotes`, etc.).
  - Defines safe policies:
    - Users can read/write their own profiles.
    - Users/Partners can read/write orders they are a seller or buyer for.
    - Partners can read available requests (tow, carwash, appointments) in their respective domain, but can only update those assigned to them.
    - Admins have full access.

### 2. API Security (B2B Partner Express API)
- **Problem:** The Express API middleware at `carvis-partner-api/src/middleware/auth.js` has a mocked JWT validator (`test_token_123`), and CORS allows wildcards (`*`).
- **Solution:**
  - Update `auth.js` middleware to decode and verify actual JWT tokens using `jsonwebtoken` library against a configurable `JWT_SECRET` environment variable.
  - Update `carvis-partner-api/src/server.js` to restrict CORS to trusted origins defined in environment variables, and ensure proxy headers are trusted for rate limiting.

### 3. Vulnerability Verification
- Write a test script `scratch/verify_security.js` that attempts:
  - Unauthorized calls to the partner API.
  - Verification of RLS policy blocks on a simulated client connection.

---

## 🏁 Verification Plan

### Automated Checks
- Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` to ensure no environment secrets or packages are vulnerable.
- Run `npm run test` to verify no app regressions.
