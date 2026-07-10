# Auth API

This module handles authentication and authorization in the POS system.

It supports:

- Login with email and password
- Password validation using bcrypt
- JWT access token generation
- Protected routes using `Authorization: Bearer <token>`
- Role-based authorization
- Active user validation before authentication

Passwords are hashed with bcrypt before being stored in the database.

The API never returns `password` or `password_hash` in authentication responses.

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
- If credentials are valid, the API returns a JWT access token.
- The response does not include `password` or `password_hash`.

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
      "updated_at": "2026-07-09T19:10:35.235Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

When login succeeds, the API returns a JWT access token.

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

Example environment variables:

```env
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

---

## Using Protected Routes

Protected routes require the JWT token in the `Authorization` header.

```http
Authorization: Bearer <token>
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

- Users must authenticate with email and password.
- User passwords are stored as bcrypt hashes.
- Login responses never expose `password` or `password_hash`.
- Invalid email and invalid password return the same error message for security reasons.
- Inactive users cannot log in.
- Protected routes require a valid JWT access token.
- JWT tokens are sent using the `Authorization: Bearer <token>` header.
- Authenticated users are attached to `req.user`.
- Authorization is handled by role-based middleware.
- Users can only access routes allowed for their role.
- `ADMIN` has full administrative access.
- `SUPERVISOR` can manage products, categories, sales cancellation, and inventory operations.
- `EMPLOYEE` can perform operational tasks such as creating sales and reading allowed resources.
