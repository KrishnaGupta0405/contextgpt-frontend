# Auth Flows — ContextGPT

This document describes the complete authentication system: what exists, what was added, and how each flow works end-to-end (frontend → backend → email → frontend).

---

## Directory Structure

```
(auth)/
├── AUTH_FLOWS.md                  ← this file
├── forgot-password/
│   └── page.jsx                   ← updated: real API call
├── login/
│   └── page.jsx                   ← existing (minor: 403 toast for unverified)
├── signup/
│   └── page.jsx                   ← updated: success toast changed
├── verify-email/
│   └── page.jsx                   ← NEW: email verification landing page
└── reset-password/
    └── page.jsx                   ← NEW: reset password form
```

---

## 1. Registration + Email Verification Flow

### What we had
- User fills signup form → `POST /api/v1/auth/register` → user created → `sendWelcomeEmail` sent → user could immediately log in.
- No email verification step existed.

### What was changed / added

#### Backend
**File:** `Backend Dashboard/src/controllers/user.auth.controller.js`

- `registerUser` controller:
  - After creating the user via `createNewUser()`, generates a 32-byte hex token using `crypto.randomBytes`.
  - Stores `email_verification_token` and `email_verification_expires_at` (24 hours from now) on the `users` row.
  - Calls `sendVerificationEmail({ to, name, verificationUrl })` where `verificationUrl = ${FRONTEND_URL}/verify-email?token=<token>`.
  - Replaced `sendWelcomeEmail` here — welcome email is now sent after verification (see `verifyEmail` below).
  - Response message changed to: `"Registration successful. Please check your email to verify your account."`

- New `verifyEmail` controller (public, `GET /api/v1/auth/verify-email?token=`):
  - Finds user by `email_verification_token` where token matches, `email_verified = false`, and `email_verification_expires_at > NOW()`.
  - If not found → 400 "Invalid or expired verification link".
  - Sets `email_verified = true`, clears the token columns.
  - Sends `sendWelcomeEmail` (this is the "congrats, you're in" email).
  - Returns 200.

- `loginUser` controller:
  - Added check after user lookup: if `existingUser.emailVerified === false` → throws 403 "Please verify your email before logging in".

**File:** `Backend Dashboard/src/routes/user.auth.routes.js`
- Added: `GET /api/v1/auth/verify-email` → `verifyEmail` (public, no auth)

**Database changes required (run once, then `npx drizzle-kit pull`):**
```sql
ALTER TABLE users
  ADD COLUMN email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN email_verification_token varchar(64),
  ADD COLUMN email_verification_expires_at timestamp;

-- Backfill: existing users marked verified so they aren't locked out
UPDATE users SET email_verified = true WHERE email_verified = false;
```

#### Frontend

**`signup/page.jsx`** — success toast changed from:
> "Account created successfully! Welcome to ContextGPT. You can now sign in."

to:
> "Account created! Please check your email." + description: "We sent a verification link to your email. Click it to activate your account before logging in."

**`verify-email/page.jsx`** (NEW):
- On mount, reads `?token=` from `useSearchParams()`.
- Calls `GET /api/v1/auth/verify-email?token=<token>`.
- Shows three states:
  - **Loading** — spinner + "Verifying your email…"
  - **Success** — green checkmark + "Congrats! You're verified" + link to `/login`
  - **Error** — red X + error message + links to `/signup` and `/login`

### Full flow
```
User registers on /signup
  → POST /api/v1/auth/register
  → user created (email_verified = false)
  → verification email sent with link: /verify-email?token=<64-char-hex>
  → toast: "Check your email"
  → redirected to /login

User clicks link in email
  → lands on /verify-email?token=<token>
  → GET /api/v1/auth/verify-email called automatically on mount
  → token validated, email_verified set to true
  → welcome email sent
  → page shows "Congrats! You're verified" + "Sign in" button

User tries to login before verifying
  → POST /api/v1/auth/login
  → 403 returned
  → toast.error("Please verify your email before logging in")
```

---

## 2. Register with Invite + Email Verification

### What we had
- `POST /api/v1/teams/invitations/register-with-invite` in `team.controller.js`.
- Created user, marked invitation accepted, sent `sendInviteRegisteredEmail` to inviter.
- No email verification gate.

### What was changed

**File:** `Backend Dashboard/src/controllers/team.controller.js`

- After `createNewUser()`, generates a verification token (two `generateInviteToken()` calls = 40-char hex), stores it on the user with 24h expiry.
- Sends `sendVerificationEmail` to the new user.
- Invited user must also verify email before logging in (same `loginUser` gate applies).

### Full flow
```
Invitee opens invite link → fills register-with-invite form
  → POST /api/v1/teams/invitations/register-with-invite
  → user created (email_verified = false)
  → invitation marked ACCEPTED
  → inviter notified via sendInviteRegisteredEmail
  → invitee gets sendVerificationEmail
  → invitee must click verify link before logging in
```

---

## 3. Forgot Password / Reset Password Flow

### What we had
- `forgot-password/page.jsx` existed with a form, but `onSubmit` was a stub (simulated delay + `toast.info("Backend route not yet configured")`).
- `sendPasswordResetEmail` existed in `mailer.util.js` but was never called.
- `changeCurrentPassword` controller exists but requires authentication — not usable for unauthenticated reset.
- No `reset-password` page existed.
- No backend routes for forgot/reset password existed.

### What was added

#### Backend

**File:** `Backend Dashboard/src/controllers/user.auth.controller.js`

- New `forgotPassword` controller (public, `POST /api/v1/auth/forgot-password`):
  - Accepts `{ email }` in body.
  - Always returns 200 with the same message regardless of whether email exists (security — prevents email enumeration).
  - If user found: generates 32-byte hex token, inserts into `password_reset_tokens` table with 1-hour expiry.
  - Sends `sendPasswordResetEmail({ to, name, resetUrl })` where `resetUrl = ${FRONTEND_URL}/reset-password?token=<token>`.

- New `resetPassword` controller (public, `POST /api/v1/auth/reset-password`):
  - Accepts `{ token, newPassword, confirmPassword }` in body.
  - Validates passwords match and length >= 6.
  - Finds `password_reset_tokens` row: token matches, `expires_at > NOW()`, `used_at IS NULL`.
  - If not found → 400 "Invalid or expired reset link".
  - Hashes new password, updates `users.password`.
  - Marks token used: sets `used_at = NOW()` (token is single-use).
  - Sends `sendPasswordChangedEmail` (security notification).
  - Returns 200 "Password reset successfully. You can now log in."

**File:** `Backend Dashboard/src/routes/user.auth.routes.js`
- Added: `POST /api/v1/auth/forgot-password` → `forgotPassword` (public)
- Added: `POST /api/v1/auth/reset-password` → `resetPassword` (public)

**Database changes required (run once, then `npx drizzle-kit pull`):**
```sql
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token varchar(64) NOT NULL UNIQUE,
  expires_at timestamp NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
```

#### Frontend

**`forgot-password/page.jsx`** — `onSubmit` stub replaced with real API call:
- Calls `POST /api/v1/auth/forgot-password` with `{ email }`.
- On success: `toast.success("If that email is registered, a password reset link has been sent.")`.
- On error: `toast.error(err.response.data.message)`.

**`reset-password/page.jsx`** (NEW):
- On mount, reads `?token=` from `useSearchParams()`.
- If no token in URL → shows "Invalid reset link" message with link to `/forgot-password`.
- Form has `newPassword` + `confirmPassword` fields (both with show/hide toggle).
- Zod schema validates: min 6 chars, passwords must match.
- On submit: `POST /api/v1/auth/reset-password` with `{ token, newPassword, confirmPassword }`.
- On success: `toast.success("Password reset successfully!")` → redirects to `/login`.
- On error: `toast.error(err.response.data.message)`.

### Full flow
```
User clicks "Forgot password" on /login → goes to /forgot-password
  → enters email → POST /api/v1/auth/forgot-password
  → toast: "If that email is registered, a reset link has been sent."
  → (backend creates token in password_reset_tokens, sends email)

User clicks link in email
  → lands on /reset-password?token=<64-char-hex>
  → enters new password + confirm password
  → POST /api/v1/auth/reset-password
  → token validated, password updated, token marked used
  → sendPasswordChangedEmail sent as security notification
  → toast: "Password reset successfully!"
  → redirected to /login

User tries to use the same link again
  → token has used_at set → 400 "Invalid or expired reset link"
  → toast.error shown on /reset-password page
```

---

## Environment Variables Required

```env
FRONTEND_URL=http://localhost:3000        # dev
FRONTEND_URL=https://app.contextgpt.co   # prod
```

---

## Complete SQL Migration (run all at once)

```sql
-- Email verification columns on users table
ALTER TABLE users
  ADD COLUMN email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN email_verification_token varchar(64),
  ADD COLUMN email_verification_expires_at timestamp;

-- Backfill: mark existing users as verified so they aren't locked out
UPDATE users SET email_verified = true WHERE email_verified = false;

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token varchar(64) NOT NULL UNIQUE,
  expires_at timestamp NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
```

After running: `npx drizzle-kit pull`

---

## Files Modified / Created Summary

| File | Status | Change |
|------|--------|--------|
| `Backend/.../user.auth.controller.js` | Modified | Added `verifyEmail`, `forgotPassword`, `resetPassword`; updated `registerUser` and `loginUser` |
| `Backend/.../team.controller.js` | Modified | `registerUserWithInvite` now sends verification email |
| `Backend/.../user.auth.routes.js` | Modified | Added 3 new public routes |
| `Frontend/.../signup/page.jsx` | Modified | Success toast updated |
| `Frontend/.../forgot-password/page.jsx` | Modified | Wired real API call |
| `Frontend/.../verify-email/page.jsx` | Created | Email verification landing page |
| `Frontend/.../reset-password/page.jsx` | Created | Password reset form |

---

## Mailer Functions Used

All exist in `Backend Dashboard/src/utils/mailer.util.js`:

| Function | Trigger |
|----------|---------|
| `sendVerificationEmail` | On register (normal + invite) |
| `sendWelcomeEmail` | On successful email verification |
| `sendPasswordResetEmail` | On forgot-password request |
| `sendPasswordChangedEmail` | On successful password reset |
| `sendNewLoginEmail` | On every successful login (unchanged) |
