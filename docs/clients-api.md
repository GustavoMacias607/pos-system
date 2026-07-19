# Clients API

This module handles client management in the POS system.

Clients are optional for sales. A sale can be created with a registered client or without a client.

The Clients module supports:

- Create clients
- List clients
- Get client by ID
- Update clients
- Activate clients
- Deactivate clients
- Optional email
- Case-insensitive unique email validation
- Soft delete using `active = false`
- Optional association with sales
- Client sales history

---

## Client Model

```txt
clients
- id
- name
- email
- phone
- address
- active
- created_at
- updated_at
```

### Rules

- `name` is required.
- `email` is optional.
- If `email` is provided, it must have a valid format.
- If `email` is provided, it must be unique.
- Email uniqueness is case-insensitive.
- Multiple clients can exist without email.
- `phone` is optional.
- `address` is optional.
- Clients are soft deleted by setting `active = false`.
- A sale can exist without a client.
- Only active clients can be associated with new sales.
- Deactivated clients keep their previous sale history.

---

## Endpoints

```http
GET /api/clients
GET /api/clients/:id
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
PATCH /api/clients/:id/activate
```

Client sales history is retrieved through:

```http
GET /api/sales?clientId=:id
```

---

## Authorization

All client routes require authentication using:

```http
Authorization: Bearer <accessToken>
```

### Read clients

```http
GET /api/clients
GET /api/clients/:id
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

### Create and update clients

```http
POST /api/clients
PUT /api/clients/:id
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

### Deactivate and activate clients

```http
DELETE /api/clients/:id
PATCH /api/clients/:id/activate
```

Allowed roles:

- `ADMIN`
- `SUPERVISOR`

---

## List Clients

Returns all clients ordered by ID.

```http
GET /api/clients
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@test.com",
      "phone": "2221234567",
      "address": "Puebla, México",
      "active": true,
      "created_at": "2026-07-13T21:42:36.209Z",
      "updated_at": "2026-07-13T21:42:36.209Z"
    }
  ]
}
```

---

## Get Client by ID

Returns a single client by ID.

```http
GET /api/clients/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "phone": "2221234567",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-13T21:42:36.209Z",
    "updated_at": "2026-07-13T21:42:36.209Z"
  }
}
```

### Error response when client does not exist

```json
{
  "success": false,
  "message": "Client not found"
}
```

---

## Create Client

Creates a new client.

```http
POST /api/clients
```

### Request body with email

```json
{
  "name": "Juan Pérez",
  "email": "juan@test.com",
  "phone": "2221234567",
  "address": "Puebla, México"
}
```

### Request body without email

```json
{
  "name": "Cliente sin email",
  "phone": "2220000000",
  "address": "Puebla, México"
}
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "phone": "2221234567",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-13T21:42:36.209Z",
    "updated_at": "2026-07-13T21:42:36.209Z"
  },
  "message": "Client created successfully"
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

### Error response when email already exists

```json
{
  "success": false,
  "message": "Client email already exists"
}
```

---

## Update Client

Updates a client by ID.

```http
PUT /api/clients/:id
```

Partial updates are supported. At least one valid field is required.

### Request body

```json
{
  "phone": "2229999999"
}
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "phone": "2229999999",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-13T21:42:36.209Z",
    "updated_at": "2026-07-13T21:50:10.100Z"
  },
  "message": "Client updated successfully"
}
```

### Error response when no valid fields are sent

```json
{
  "success": false,
  "message": "At least one field is required to update client"
}
```

### Error response when email already exists

```json
{
  "success": false,
  "message": "Client email already exists"
}
```

---

## Deactivate Client

Soft deletes a client by setting `active = false`.

```http
DELETE /api/clients/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "phone": "2229999999",
    "address": "Puebla, México",
    "active": false,
    "created_at": "2026-07-13T21:42:36.209Z",
    "updated_at": "2026-07-13T21:55:20.300Z"
  },
  "message": "Client deactivated successfully"
}
```

---

## Activate Client

Reactivates a client by setting `active = true`.

```http
PATCH /api/clients/:id/activate
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@test.com",
    "phone": "2229999999",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-13T21:42:36.209Z",
    "updated_at": "2026-07-13T21:56:30.500Z"
  },
  "message": "Client activated successfully"
}
```

---

## Client Sales History

Client sales are retrieved using the Sales API filter:

```http
GET /api/sales?clientId=1
```

The client must exist, but it does not need to be active. This allows deactivated clients to keep their historical sales.

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "client_id": "1",
      "client_name": "Juan Pérez",
      "subtotal": "100.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "100.00",
      "payment_method": "CASH",
      "status": "COMPLETED",
      "created_at": "2026-07-18T18:00:00.000Z"
    }
  ]
}
```

If the client exists but has no sales:

```json
{
  "success": true,
  "data": []
}
```

### Client not found

```json
{
  "success": false,
  "message": "Client not found"
}
```

### Invalid client ID

```json
{
  "success": false,
  "message": "Client ID must be a positive integer"
}
```

---

## Business Rules

- Clients are optional for sales.
- A sale can exist without a registered client.
- Registered clients can be associated with sales.
- Only active clients can be associated with new sales.
- Deactivated clients preserve their previous sales.
- Client sales can be retrieved using `GET /api/sales?clientId=:id`.
- Clients are not physically deleted.
- Deleting a client only sets `active = false`.
- Client email is optional.
- If email is provided, it must be unique.
- Email uniqueness is case-insensitive.
- Multiple clients can exist without email.
- Employees can create and update clients because they may need to register clients during a sale.
- Only `ADMIN` and `SUPERVISOR` can activate or deactivate clients.
