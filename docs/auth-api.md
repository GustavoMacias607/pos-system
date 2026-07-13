# Auth API

This module handles authentication and authorization in the POS system.

It supports:

- Login with email and password
- Password validation using bcrypt
- JWT access token generation
- Refresh token sessions
- Logout by revoking refresh token sessions
- Protected routes using `Authorization: Bearer <accessToken>`
- Role-based authorization
- Two-factor authentication using TOTP
- Backup codes for two-factor authentication recovery
- Google Login using Google ID tokens
- Active user validation before authentication

Passwords are hashed with bcrypt before being stored in the database.

The API never returns `password` or `password_hash` in authentication responses.

Refresh tokens and backup codes are never stored directly in the database. Only their hashes are stored.

---

## Authentication Flows

The system currently supports three authentication flows:

1. Email and password login
2. Email and password login with 2FA
3. Google Login

### Flow 1: Email and Password Login

```txt
email + password
↓
backend validates credentials
↓
backend creates session
↓
backend returns accessToken + refreshToken
```

### Flow 2: Email and Password Login with 2FA

```txt
email + password
↓
backend validates credentials
↓
backend detects 2FA is enabled
↓
backend returns requiresTwoFactor = true
↓
client sends TOTP code or backup code
↓
backend creates session
↓
backend returns accessToken + refreshToken
```

### Flow 3: Google Login

```txt
Google authenticates user
↓
frontend receives Google ID token
↓
frontend sends Google ID token to backend
↓
backend verifies token with Google
↓
backend links or finds user identity
↓
backend creates session
↓
backend returns accessToken + refreshToken
```

---

## Environment Variables

The Auth module uses these environment variables:

```env
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### JWT_SECRET

Used to sign JWT access tokens.

### JWT_EXPIRES_IN

Defines access token expiration time.

Example:

```env
JWT_EXPIRES_IN=1d
```

### GOOGLE_CLIENT_ID

Used to validate Google ID tokens received from the frontend.

This value is provided by Google Cloud when creating an OAuth Client ID.

---

## Login

Authenticates a user using email and password.

```http
POST /api/auth/login
```

### Request body

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

### Behavior

- Email is required.
- Email must be a string.
- Email cannot be empty.
- Email must have a valid format.
- Password is required.
- Password must be a string.
- Password cannot be empty.
- User must exist.
- User must be active.
- Password is compared against the stored bcrypt hash.
- If credentials are valid and 2FA is disabled, the API returns `accessToken` and `refreshToken`.
- If credentials are valid and 2FA is enabled, the API returns `requiresTwoFactor: true`.
- The response does not include `password` or `password_hash`.

### Success response without 2FA

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "name": "Hash Test",
      "email": "hash@test.com",
      "role": "EMPLOYEE",
      "active": true,
      "created_at": "2026-07-09T17:59:51.914Z",
      "updated_at": "2026-07-09T19:10:35.235Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "4e4ace88e718606e83517d3a6c2907d..."
  },
  "message": "Login successful"
}
```

### Success response when 2FA is required

```json
{
  "success": true,
  "data": {
    "requiresTwoFactor": true,
    "userId": 7
  },
  "message": "Login successful"
}
```

### Error response when email does not exist

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Error response when password is incorrect

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Error response when user is inactive

```json
{
  "success": false,
  "message": "User is inactive"
}
```

### Error response when email is missing

```json
{
  "success": false,
  "message": "Email is required"
}
```

### Error response when email format is invalid

```json
{
  "success": false,
  "message": "Email format is invalid"
}
```

### Error response when password is missing

```json
{
  "success": false,
  "message": "Password is required"
}
```

---

## JWT Access Token

When authentication succeeds, the API returns a JWT access token.

The token payload contains:

```json
{
  "id": 7,
  "role": "EMPLOYEE"
}
```

The token also includes standard JWT fields such as:

- `iat`: issued at
- `exp`: expiration time

The token is signed using the `JWT_SECRET` environment variable.

The expiration time is configured using the `JWT_EXPIRES_IN` environment variable.

---

## Refresh Tokens and Sessions

The API uses refresh tokens to create persistent sessions.

Refresh tokens are generated during successful login and stored in the database as hashes.

The real refresh token is only returned to the client once.

Sessions are stored in the `user_sessions` table.

### user_sessions fields

```txt
id
user_id
refresh_token_hash
user_agent
ip_address
expires_at
revoked_at
created_at
updated_at
```

### Important rules

- The real refresh token is never stored in the database.
- Only `refresh_token_hash` is stored.
- A session is active when `revoked_at` is `NULL`.
- A session is revoked when `revoked_at` has a timestamp.
- A refresh token cannot be used after it expires.
- A refresh token cannot be used after logout.

---

## Refresh Access Token

Generates a new access token using a valid refresh token.

```http
POST /api/auth/refresh
```

### Request body

```json
{
  "refreshToken": "4e4ace88e718606e83517d3a6c2907d..."
}
```

### Behavior

- Refresh token is required.
- Refresh token must be a string.
- Refresh token cannot be empty.
- Refresh token is hashed and searched in `user_sessions`.
- Session must exist.
- Session must not be revoked.
- Session must not be expired.
- User must still exist.
- User must be active.
- If valid, the API returns a new access token.

### Success response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token refreshed successfully"
}
```

### Error response when refresh token is invalid

```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

### Error response when refresh token is revoked

```json
{
  "success": false,
  "message": "Refresh token has been revoked"
}
```

### Error response when refresh token is expired

```json
{
  "success": false,
  "message": "Refresh token has expired"
}
```

---

## Logout

Revokes a refresh token session.

```http
POST /api/auth/logout
```

### Request body

```json
{
  "refreshToken": "4e4ace88e718606e83517d3a6c2907d..."
}
```

### Behavior

- Refresh token is required.
- Refresh token is hashed.
- Session is searched by `refresh_token_hash`.
- Session must exist.
- Session must not already be revoked.
- If valid, the session is revoked by setting `revoked_at = NOW()`.

### Success response

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Error response when refresh token is invalid

```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

### Error response when refresh token is already revoked

```json
{
  "success": false,
  "message": "Refresh token has already been revoked"
}
```

---

## Using Protected Routes

Protected routes require the JWT access token in the `Authorization` header.

```http
Authorization: Bearer <accessToken>
```

Example:

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Behavior

- The request must include an `Authorization` header.
- The authorization format must be `Bearer <token>`.
- The token must be valid.
- The token must not be expired.
- The user from the token must still exist in the database.
- The user must be active.
- If the token is valid, the authenticated user is attached to `req.user`.

### Error response when token is missing

```json
{
  "success": false,
  "message": "Authorization token is required"
}
```

### Error response when token format is invalid

```json
{
  "success": false,
  "message": "Invalid authorization format"
}
```

### Error response when token is invalid or expired

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Error response when authenticated user is inactive

```json
{
  "success": false,
  "message": "User is inactive"
}
```

---

## Two-Factor Authentication

The system supports two-factor authentication using TOTP.

TOTP means:

```txt
Time-Based One-Time Password
```

It is the standard 6-digit code used by apps like:

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password

The system stores the TOTP secret in the `users` table.

### users 2FA fields

```txt
two_factor_secret
two_factor_enabled
two_factor_enabled_at
```

### Important rules

- 2FA setup requires an authenticated user.
- 2FA is not enabled immediately after setup.
- The user must verify a valid TOTP code before 2FA is enabled.
- If 2FA is enabled, normal login does not return tokens immediately.
- If 2FA is enabled, the user must complete `/api/auth/2fa/verify-login`.
- 2FA can be disabled only by providing a valid TOTP code.
- When 2FA is disabled, backup codes are deleted.

---

## Setup 2FA

Generates a TOTP secret and QR code for the authenticated user.

```http
POST /api/auth/2fa/setup
Authorization: Bearer <accessToken>
```

### Request body

No body is required.

```json
{}
```

### Behavior

- User must be authenticated.
- User must exist.
- 2FA must not already be enabled.
- API generates a TOTP secret.
- API stores the secret in `users.two_factor_secret`.
- API generates an `otpauthUrl`.
- API generates a QR code as a Data URL.
- 2FA is not enabled yet.

### Success response

```json
{
  "success": true,
  "data": {
    "secret": "56TSQTXFWJ3WQ5MA7BQESDBF43MN2PKJ",
    "otpauthUrl": "otpauth://totp/POS%20System:hash%40test.com?secret=56TSQTXFWJ3WQ5MA7BQESDBF43MN2PKJ&issuer=POS%20System",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "message": "Two-factor authentication setup generated successfully"
}
```

### Error response when 2FA is already enabled

```json
{
  "success": false,
  "message": "Two-factor authentication is already enabled"
}
```

---

## Verify 2FA Setup

Confirms and enables 2FA after the user provides a valid TOTP code.

```http
POST /api/auth/2fa/verify-setup
Authorization: Bearer <accessToken>
```

### Request body

```json
{
  "token": "123456"
}
```

### Behavior

- User must be authenticated.
- Token is required.
- Token must be a string.
- Token must be a 6-digit code.
- 2FA setup must have been started.
- 2FA must not already be enabled.
- Token must be valid.
- API enables 2FA.
- API generates backup codes.
- Backup code hashes are stored in `user_backup_codes`.
- Real backup codes are returned only once.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "email": "hash@test.com",
    "two_factor_enabled": true,
    "two_factor_enabled_at": "2026-07-12T05:10:46.921Z",
    "backupCodes": [
      "C6F3-595C",
      "162B-8C1D",
      "DCA9-B57C",
      "B8E3-5D18",
      "07FD-0CF3",
      "7641-EEFA",
      "3011-00D3",
      "5EEE-695C",
      "B933-002E",
      "40F5-8979"
    ]
  },
  "message": "Two-factor authentication enabled successfully"
}
```

### Error response when setup has not been started

```json
{
  "success": false,
  "message": "Two-factor authentication setup has not been started"
}
```

### Error response when token is invalid

```json
{
  "success": false,
  "message": "Invalid two-factor token"
}
```

---

## Verify 2FA Login

Completes login for users who have 2FA enabled.

```http
POST /api/auth/2fa/verify-login
```

This endpoint does not require `Authorization` because the user has not received an access token yet.

### Request body using TOTP token

```json
{
  "userId": 7,
  "token": "123456"
}
```

### Request body using backup code

```json
{
  "userId": 7,
  "backupCode": "C6F3-595C"
}
```

### Behavior

- `userId` is required.
- `userId` must be a positive integer.
- Either `token` or `backupCode` is required.
- `token` and `backupCode` cannot be sent together.
- If `token` is sent, it must be a 6-digit code.
- If `backupCode` is sent, it must use format `XXXX-XXXX`.
- User must exist.
- User must have 2FA enabled.
- If using TOTP, the TOTP token must be valid.
- If using backup code, the backup code must be unused.
- Used backup codes are marked with `used_at = NOW()`.
- User must be active.
- If valid, the API creates a session and returns `accessToken` and `refreshToken`.

### Success response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "name": "Hash Test",
      "email": "hash@test.com",
      "role": "EMPLOYEE",
      "active": true,
      "created_at": "2026-07-09T17:59:51.914Z",
      "updated_at": "2026-07-12T01:11:18.698Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "36048fe9c9a9b89b95c2eaf5a1f79281d..."
  },
  "message": "Login successful"
}
```

### Error response when token or backup code is invalid

```json
{
  "success": false,
  "message": "Invalid two-factor token or backup code"
}
```

### Error response when both token and backup code are sent

```json
{
  "success": false,
  "message": "Use either two-factor token or backup code, not both"
}
```

---

## Disable 2FA

Disables 2FA for the authenticated user.

```http
POST /api/auth/2fa/disable
Authorization: Bearer <accessToken>
```

### Request body

```json
{
  "token": "123456"
}
```

### Behavior

- User must be authenticated.
- Token is required.
- Token must be a valid TOTP code.
- User must have 2FA enabled.
- User must have a configured 2FA secret.
- If token is valid:
  - `two_factor_secret` is set to `NULL`
  - `two_factor_enabled` is set to `false`
  - `two_factor_enabled_at` is set to `NULL`
  - backup codes are deleted

### Success response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "email": "hash@test.com",
    "two_factor_enabled": false,
    "two_factor_enabled_at": null
  },
  "message": "Two-factor authentication disabled successfully"
}
```

### Error response when 2FA is not enabled

```json
{
  "success": false,
  "message": "Two-factor authentication is not enabled"
}
```

### Error response when token is invalid

```json
{
  "success": false,
  "message": "Invalid two-factor token"
}
```

---

## Backup Codes

Backup codes are emergency codes used when the user cannot access the authenticator app.

Backup codes are generated when 2FA is enabled.

They are returned only once.

### user_backup_codes fields

```txt
id
user_id
code_hash
used_at
created_at
updated_at
```

### Important rules

- Backup codes are generated after successful 2FA setup verification.
- Real backup codes are shown only once.
- Only backup code hashes are stored in the database.
- Backup codes can be used to complete 2FA login.
- Each backup code can be used only once.
- Used backup codes are marked with `used_at`.
- Backup codes are deleted when 2FA is disabled.

---

## Google Login

Authenticates a user using a Google ID token.

```http
POST /api/auth/google
```

### Request body

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### Behavior

- Google ID token is required.
- Google ID token must be a string.
- Google ID token cannot be empty.
- Backend verifies the Google ID token using Google Auth Library.
- Token audience must match `GOOGLE_CLIENT_ID`.
- Google account email must exist.
- Google account email must be verified.
- If the Google identity already exists, the API finds the linked POS user.
- If the Google identity does not exist, the API searches a POS user by email.
- If the POS user exists, the API links the Google account to that POS user.
- If the POS user does not exist, login is rejected.
- User must be active.
- If valid, the API creates a session and returns `accessToken` and `refreshToken`.

### Success response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 9,
      "name": "Gustavo",
      "email": "gustavo.maci.1234@gmail.com",
      "role": "EMPLOYEE",
      "active": true,
      "created_at": "2026-07-13T18:06:55.444Z",
      "updated_at": "2026-07-13T18:06:55.444Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "4e4ace88e718606e83517d3a6c2907db4b..."
  },
  "message": "Google login successful"
}
```

### Error response when ID token is missing

```json
{
  "success": false,
  "message": "Google ID token is required"
}
```

### Error response when ID token is invalid

```json
{
  "success": false,
  "message": "Invalid Google ID token"
}
```

### Error response when Google client ID is not configured

```json
{
  "success": false,
  "message": "Google client id is not configured"
}
```

### Error response when Google email is not verified

```json
{
  "success": false,
  "message": "Google account email is not verified"
}
```

### Error response when POS user does not exist

```json
{
  "success": false,
  "message": "User account does not exist"
}
```

### Error response when user already has a Google account linked

```json
{
  "success": false,
  "message": "User already has a Google account linked"
}
```

---

## Google Identities

Google identities are stored in the `user_identities` table.

### user_identities fields

```txt
id
user_id
provider
provider_user_id
email
created_at
updated_at
```

### Example

```txt
users
id: 9
email: gustavo.maci.1234@gmail.com

user_identities
user_id: 9
provider: GOOGLE
provider_user_id: 101690262898685347818
email: gustavo.maci.1234@gmail.com
```

### Important rules

- `provider` is currently limited to `GOOGLE`.
- A Google account can only be linked to one POS user.
- A POS user can only have one Google account linked.
- Google Login does not create POS users automatically.
- A POS user must already exist with the same email before Google Login can link the account.

---

## Roles

The system supports the following roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

Roles are used to control access to protected routes.

---

## Role-Based Permissions

### Users

Only `ADMIN` can manage users.

```http
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
PATCH /api/users/:id/activate
```

Allowed roles:

- `ADMIN`

---

### Products

All authenticated users can read products.

Only `ADMIN` and `SUPERVISOR` can create, update, activate, or deactivate products.

```http
GET /api/products
GET /api/products/:id
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

```http
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
PATCH /api/products/:id/activate
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`

---

### Categories

All authenticated users can read categories.

Only `ADMIN` and `SUPERVISOR` can create, update, activate, or deactivate categories.

```http
GET /api/categories
GET /api/categories/:id
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

```http
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id
PATCH /api/categories/:id/activate
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`

---

### Sales

All authenticated users can create sales.

Only `ADMIN` and `SUPERVISOR` can list, view, or cancel sales.

```http
POST /api/sales
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

```http
GET /api/sales
GET /api/sales/:id
POST /api/sales/:id/cancel
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`

---

### Inventory

All authenticated users can view low stock products.

Only `ADMIN` and `SUPERVISOR` can view movement history or create inventory operations.

```http
GET /api/inventory/low-stock
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

```http
GET /api/inventory/movements
POST /api/inventory/adjustment
POST /api/inventory/stock-entry
POST /api/inventory/waste
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`

---

## Business Rules

- Users can authenticate using email/password.
- Users can authenticate using email/password plus 2FA.
- Users can authenticate using Google Login if the POS user already exists.
- User passwords are stored as bcrypt hashes.
- Login responses never expose `password` or `password_hash`.
- Invalid email and invalid password return the same error message for security reasons.
- Inactive users cannot log in.
- Protected routes require a valid JWT access token.
- JWT tokens are sent using the `Authorization: Bearer <accessToken>` header.
- Authenticated users are attached to `req.user`.
- Authorization is handled by role-based middleware.
- Users can only access routes allowed for their role.
- Refresh tokens are stored as hashes in `user_sessions`.
- Logout revokes the refresh token session.
- Revoked refresh tokens cannot be reused.
- 2FA requires a TOTP app such as Google Authenticator.
- 2FA must be verified before it becomes active.
- Users with 2FA enabled do not receive tokens after password login until they complete 2FA verification.
- Backup codes are generated when 2FA is enabled.
- Backup codes are stored as hashes.
- Backup codes can only be used once.
- Google ID tokens must be verified using `GOOGLE_CLIENT_ID`.
- Google Login links accounts using `user_identities`.
- Google Login does not create POS users automatically.
- `ADMIN` has full administrative access.
- `SUPERVISOR` can manage products, categories, sales cancellation, and inventory operations.
- `EMPLOYEE` can perform operational tasks such as creating sales and reading allowed resources.
