# Users API

This module handles user management in the POS system.

It supports:

- Listing users
- Getting user details
- Creating users
- Updating users
- Deactivating users
- Reactivating users

Users are not physically deleted from the database. Instead, they are deactivated using a soft delete strategy.

The API never returns `password` or `password_hash` in user responses.

> Note: Password hashing will be implemented in the Auth module. Currently, the Users module prepares the structure needed for authentication.

---

## Valid Roles

The system supports the following user roles:

- `ADMIN`
- `EMPLOYEE`
- `SUPERVISOR`

---

## Get Users

Returns all users.

```http
GET /api/users
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin Test",
      "email": "admin@test.com",
      "role": "ADMIN",
      "active": true,
      "created_at": "2026-07-08T21:46:46.063Z",
      "updated_at": "2026-07-08T21:46:46.063Z"
    }
  ]
}
```

---

## Get User By ID

Returns a user by its ID.

```http
GET /api/users/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Test",
    "email": "admin@test.com",
    "role": "ADMIN",
    "active": true,
    "created_at": "2026-07-08T21:46:46.063Z",
    "updated_at": "2026-07-08T21:46:46.063Z"
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Create User

Creates a new user.

```http
POST /api/users
```

### Request body

```json
{
  "name": "Admin Test",
  "email": "admin@test.com",
  "password": "123456",
  "role": "ADMIN"
}
```

### Behavior

- User name is required.
- User name must be a string.
- User name cannot be empty.
- Email is required.
- Email must be a string.
- Email cannot be empty.
- Email must have a valid format.
- Email must be unique.
- Email uniqueness is compared case-insensitively.
- Password is required.
- Password must be a string.
- Password cannot be empty.
- Password must have at least 6 characters.
- Role is required.
- Role must be one of: `ADMIN`, `EMPLOYEE`, `SUPERVISOR`.
- User is created as active by default.
- The response does not include `password` or `password_hash`.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Test",
    "email": "admin@test.com",
    "role": "ADMIN",
    "active": true,
    "created_at": "2026-07-08T21:46:46.063Z",
    "updated_at": "2026-07-08T21:46:46.063Z"
  },
  "message": "User created successfully"
}
```

### Error response when email already exists

```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Error response when name is missing

```json
{
  "success": false,
  "message": "Name is required"
}
```

### Error response when email format is invalid

```json
{
  "success": false,
  "message": "Email format is invalid"
}
```

### Error response when password is too short

```json
{
  "success": false,
  "message": "Password must have at least 6 characters"
}
```

### Error response when role is invalid

```json
{
  "success": false,
  "message": "Invalid user role"
}
```

---

## Update User

Updates an existing user.

```http
PUT /api/users/:id
```

### Request body

All fields are optional, but at least one valid field must be provided.

```json
{
  "name": "Admin Updated",
  "email": "admin.updated@test.com",
  "password": "newpassword123",
  "role": "SUPERVISOR"
}
```

### Behavior

- User must exist.
- At least one valid field is required.
- User name must be a string if provided.
- User name cannot be empty if provided.
- Email must have a valid format if provided.
- Email must be unique if provided.
- Email cannot conflict with another user.
- Password must have at least 6 characters if provided.
- Role must be one of: `ADMIN`, `EMPLOYEE`, `SUPERVISOR` if provided.
- `active` is not updated through this endpoint.
- `updated_at` is updated when the user changes.
- The response does not include `password` or `password_hash`.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Updated",
    "email": "admin.updated@test.com",
    "role": "SUPERVISOR",
    "active": true,
    "created_at": "2026-07-08T21:46:46.063Z",
    "updated_at": "2026-07-09T00:46:39.913Z"
  },
  "message": "User updated successfully"
}
```

### Error response when user does not exist

```json
{
  "success": false,
  "message": "User not found"
}
```

### Error response when email already exists

```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Error response when request body is empty

```json
{
  "success": false,
  "message": "At least one field is required to update user"
}
```

### Error response when role is invalid

```json
{
  "success": false,
  "message": "Invalid user role"
}
```

---

## Deactivate User

Deactivates a user using soft delete.

```http
DELETE /api/users/:id
```

### Behavior

- User is not removed from the database.
- User `active` status is changed to `false`.
- `updated_at` is updated when the user is deactivated.
- Deactivated users should not be allowed to authenticate once Auth is implemented.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Updated",
    "email": "admin.updated@test.com",
    "role": "SUPERVISOR",
    "active": false,
    "created_at": "2026-07-08T21:46:46.063Z",
    "updated_at": "2026-07-09T00:50:00.000Z"
  },
  "message": "User deactivated successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Activate User

Reactivates a previously deactivated user.

```http
PATCH /api/users/:id/activate
```

### Behavior

- User must exist.
- User `active` status is changed to `true`.
- `updated_at` is updated when the user is reactivated.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Updated",
    "email": "admin.updated@test.com",
    "role": "SUPERVISOR",
    "active": true,
    "created_at": "2026-07-08T21:46:46.063Z",
    "updated_at": "2026-07-09T00:55:00.000Z"
  },
  "message": "User activated successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Business Rules

- User emails must be unique.
- User emails are compared case-insensitively.
- Users are soft deleted by setting `active = false`.
- Users can be reactivated by setting `active = true`.
- User roles must be one of: `ADMIN`, `EMPLOYEE`, `SUPERVISOR`.
- User validation is handled through reusable validators.
- User creation and update validate the request body before executing business logic.
- `password_hash` is stored in the database but never returned by the API.
- Password hashing will be implemented in the Auth module.
- Inactive users should not be allowed to log in once authentication is implemented.
