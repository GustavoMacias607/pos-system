# Cash Registers API

## Overview

The cash register module manages:

- Cash registers and their activation status.
- Opening and closing cash register sessions.
- Manual cash movements (`CASH_IN` and `CASH_OUT`).
- Cash movement history for a session.
- Expected cash and closing differences.

All endpoints require JWT authentication.

## Base URLs

```text
/api/cash-registers
/api/cash-register-sessions
/api/cash-movements
```

## Authentication

Send the access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

Requests with a JSON body must also include:

```http
Content-Type: application/json
```

## Roles

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

## Endpoint summary

| Method   | Endpoint                                           | ADMIN | SUPERVISOR | EMPLOYEE |
| -------- | -------------------------------------------------- | :---: | :--------: | :------: |
| `GET`    | `/api/cash-registers`                              |  Yes  |    Yes     |   Yes    |
| `GET`    | `/api/cash-registers/:id`                          |  Yes  |    Yes     |   Yes    |
| `POST`   | `/api/cash-registers`                              |  Yes  |    Yes     |    No    |
| `PUT`    | `/api/cash-registers/:id`                          |  Yes  |    Yes     |    No    |
| `DELETE` | `/api/cash-registers/:id`                          |  Yes  |    Yes     |    No    |
| `PATCH`  | `/api/cash-registers/:id/activate`                 |  Yes  |    Yes     |    No    |
| `GET`    | `/api/cash-register-sessions`                      |  Yes  |    Yes     |    No    |
| `GET`    | `/api/cash-register-sessions/current`              |  Yes  |    Yes     |   Yes    |
| `GET`    | `/api/cash-register-sessions/:id`                  |  Yes  |    Yes     |    No    |
| `POST`   | `/api/cash-register-sessions/open`                 |  Yes  |    Yes     |   Yes    |
| `PATCH`  | `/api/cash-register-sessions/:id/close`            |  Yes  |    Yes     |   Yes    |
| `GET`    | `/api/cash-register-sessions/:sessionId/movements` |  Yes  |    Yes     |    No    |
| `POST`   | `/api/cash-movements`                              |  Yes  |    Yes     |   Yes    |

## Cash registers

### Get all cash registers

```http
GET /api/cash-registers
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

### Get a cash register by ID

```http
GET /api/cash-registers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

The ID must be a positive integer.

### Create a cash register

```http
POST /api/cash-registers
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

Example body:

```json
{
  "name": "Main register",
  "location": "Front counter"
}
```

Validation rules:

- `name` is required.
- `name` must be a non-empty string with no more than 100 characters.
- `location` is optional.
- `location` may be `null` or a non-empty string with no more than 150 characters.

### Update a cash register

```http
PUT /api/cash-registers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

Example body:

```json
{
  "name": "Register 1",
  "location": "Main entrance"
}
```

At least one of the following fields is required:

- `name`
- `location`

To remove the location, send:

```json
{
  "location": null
}
```

### Deactivate a cash register

```http
DELETE /api/cash-registers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

This operation performs a soft delete by marking the cash register as inactive.

### Activate a cash register

```http
PATCH /api/cash-registers/:id/activate
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

This operation reactivates an inactive cash register.

## Cash register sessions

A cash register session represents the period between opening and closing a register.

### Get all sessions

```http
GET /api/cash-register-sessions
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

### Get the authenticated user's current session

```http
GET /api/cash-register-sessions/current
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

Returns the open session associated with the authenticated user.

### Get a session by ID

```http
GET /api/cash-register-sessions/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

The ID must be a positive integer.

### Open a session

```http
POST /api/cash-register-sessions/open
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

Example body:

```json
{
  "cashRegisterId": 1,
  "openingAmount": 500,
  "openingNotes": "Shift opening"
}
```

Validation rules:

- `cashRegisterId` is required and must be a positive integer.
- `openingAmount` is required and must be a finite number greater than or equal to zero.
- `openingAmount` may have at most two decimal places.
- `openingNotes` is optional, but if provided it must be a non-empty string with no more than 500 characters.

Business rules:

- The cash register must exist and be active.
- A register cannot have more than one open session at the same time.
- A user cannot open another session when they already have an open session.
- The authenticated user is recorded as the user who opened the session.

### Close a session

```http
PATCH /api/cash-register-sessions/:id/close
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

Example body:

```json
{
  "closingAmount": 650,
  "closingNotes": "Shift closing"
}
```

Validation rules:

- The session ID must be a positive integer.
- `closingAmount` is required and must be a finite number greater than or equal to zero.
- `closingAmount` may have at most two decimal places.
- `closingNotes` is optional, but if provided it must be a non-empty string with no more than 500 characters.

Business rules:

- The session must exist and have `OPEN` status.
- The closing user is obtained from the authenticated token.
- An `EMPLOYEE` may only operate on their own open session.
- Expected cash and the closing difference are calculated by the backend.

Example successful response:

```json
{
  "success": true,
  "data": {
    "id": "2",
    "cash_register_id": "1",
    "cash_register_name": "Main register",
    "opened_by_user_id": 8,
    "opened_by_user_name": "Admin Auth Test",
    "closed_by_user_id": 8,
    "closed_by_user_name": "Admin Auth Test",
    "opening_amount": "500.00",
    "expected_amount": "650.00",
    "closing_amount": "650.00",
    "difference_amount": "0.00",
    "status": "CLOSED",
    "opening_notes": "Shift opening",
    "closing_notes": "Shift closing",
    "opened_at": "2026-07-22T23:09:44.166Z",
    "closed_at": "2026-07-22T23:17:43.539Z",
    "updated_at": "2026-07-22T23:17:43.539Z"
  },
  "message": "Cash session closed successfully"
}
```

## Cash movements

Cash movements record changes to the cash held during a register session.

Movement types:

| Type       | Origin                       | Effect on expected cash |
| ---------- | ---------------------------- | ----------------------: |
| `CASH_IN`  | Manual                       |                    Adds |
| `CASH_OUT` | Manual                       |               Subtracts |
| `SALE`     | Automatic sale integration   |                    Adds |
| `REFUND`   | Automatic refund integration |               Subtracts |

Only `CASH_IN` and `CASH_OUT` can be created through the manual movement endpoint. `SALE` and `REFUND` are reserved for automatic system operations.

### Create a manual cash movement

```http
POST /api/cash-movements
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

Cash entry example:

```json
{
  "cashSessionId": 2,
  "type": "CASH_IN",
  "amount": 200,
  "reason": "Additional change fund"
}
```

Cash withdrawal example:

```json
{
  "cashSessionId": 2,
  "type": "CASH_OUT",
  "amount": 50,
  "reason": "Cleaning supplies purchase"
}
```

Validation rules:

- `cashSessionId` is required and must represent a positive integer.
- `type` must be either `CASH_IN` or `CASH_OUT`.
- `amount` must be a finite number greater than zero.
- `reason` is required and must be a non-empty string.

Business rules:

- The session must exist.
- The session must have `OPEN` status.
- An `EMPLOYEE` cannot create a movement in a session opened by another user.
- `createdByUserId` is obtained from the authenticated token and cannot be supplied by the client.
- The session is locked while the movement is created to prevent it from being closed concurrently.

Example successful response:

```json
{
  "message": "Cash movement created successfully",
  "data": {
    "id": "1",
    "cash_session_id": "2",
    "created_by_user_id": 8,
    "type": "CASH_IN",
    "amount": "200.00",
    "reason": "Additional change fund",
    "sale_id": null,
    "created_at": "2026-07-22T23:15:46.356Z"
  }
}
```

### Get movements from a session

```http
GET /api/cash-register-sessions/:sessionId/movements
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

The session ID must be a positive integer and the session must exist.

Example successful response:

```json
{
  "data": [
    {
      "id": "1",
      "cash_session_id": "2",
      "created_by_user_id": 8,
      "created_by_user_name": "Admin Auth Test",
      "type": "CASH_IN",
      "amount": "200.00",
      "reason": "Additional change fund",
      "sale_id": null,
      "created_at": "2026-07-22T23:15:46.356Z"
    },
    {
      "id": "2",
      "cash_session_id": "2",
      "created_by_user_id": 8,
      "created_by_user_name": "Admin Auth Test",
      "type": "CASH_OUT",
      "amount": "50.00",
      "reason": "Cleaning supplies purchase",
      "sale_id": null,
      "created_at": "2026-07-22T23:16:24.842Z"
    }
  ]
}
```

Movements are returned in chronological order. `sale_id` is `null` for manual movements.

## Closing calculation

The expected amount is calculated as:

```text
expectedAmount = openingAmount
               + CASH_IN
               + SALE
               - CASH_OUT
               - REFUND
```

The closing difference is calculated as:

```text
differenceAmount = closingAmount - expectedAmount
```

Interpretation:

- `differenceAmount = 0`: the declared amount matches the expected amount.
- `differenceAmount > 0`: there is surplus cash.
- `differenceAmount < 0`: there is missing cash.

Example:

```text
Opening amount:  500.00
CASH_IN:         200.00
CASH_OUT:        -50.00
Expected amount: 650.00
Closing amount:  650.00
Difference:        0.00
```

## Common errors

### Invalid input — `400 Bad Request`

```json
{
  "success": false,
  "message": "Cash movement amount must be a number greater than zero"
}
```

Other examples include invalid IDs, missing required fields, invalid movement types, empty notes, and monetary values with more than two decimal places where applicable.

### Missing or invalid authentication — `401 Unauthorized`

Returned when the access token is missing, invalid, or expired.

### Insufficient permissions — `403 Forbidden`

Returned when the authenticated role cannot access the endpoint or when an `EMPLOYEE` attempts to operate on another user's session.

### Resource not found — `404 Not Found`

```json
{
  "success": false,
  "message": "Cash register session not found"
}
```

### Business rule conflict — `409 Conflict`

```json
{
  "success": false,
  "message": "Cash movements cannot be added to a closed session"
}
```

Other conflicts may include attempting to open a session for a register that already has an open session or attempting to close an already closed session.

## PostgreSQL numeric values

PostgreSQL `BIGINT` and `NUMERIC` values may be serialized as strings by the `pg` driver. Values such as `"2"` and `"650.00"` in API responses are therefore expected.
