# Suppliers API

The Suppliers API manages the businesses and individuals that provide products to the POS. It supports supplier contact information, case-insensitive email uniqueness, role-based authorization, and soft deletion.

## Base URL

```http
/api/suppliers
```

## Authentication

All supplier endpoints require a valid JWT access token:

```http
Authorization: Bearer <accessToken>
```

Requests without a valid access token return `401 Unauthorized`.

## Role Permissions

| Operation           | ADMIN | SUPERVISOR | EMPLOYEE |
| ------------------- | :---: | :--------: | :------: |
| List suppliers      |  Yes  |    Yes     |   Yes    |
| Get supplier by ID  |  Yes  |    Yes     |   Yes    |
| Create supplier     |  Yes  |    Yes     |   Yes    |
| Update supplier     |  Yes  |    Yes     |   Yes    |
| Deactivate supplier |  Yes  |    Yes     |    No    |
| Activate supplier   |  Yes  |    Yes     |    No    |

An authenticated user without the required role receives `403 Forbidden`.

## Supplier Fields

Request bodies use camelCase. Database fields returned by the API use snake_case.

| Request field | Response field | Type   | Required on create | Rules                                             |
| ------------- | -------------- | ------ | :----------------: | ------------------------------------------------- |
| `name`        | `name`         | string |        Yes         | Cannot be empty                                   |
| `contactName` | `contact_name` | string |         No         | Cannot be empty when provided                     |
| `email`       | `email`        | string |         No         | Must be valid and unique without case sensitivity |
| `phone`       | `phone`        | string |         No         | Cannot be empty when provided                     |
| `address`     | `address`      | string |         No         | Cannot be empty when provided                     |

The API also returns these server-managed fields:

| Field        | Type      | Description                              |
| ------------ | --------- | ---------------------------------------- |
| `id`         | integer   | Supplier identifier                      |
| `active`     | boolean   | Indicates whether the supplier is active |
| `created_at` | timestamp | Creation date and time                   |
| `updated_at` | timestamp | Last update date and time                |

Supplier email is optional. Multiple suppliers can exist with `email = null`, but two non-null emails cannot be equal when compared without case sensitivity.

## List Suppliers

```http
GET /api/suppliers
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Distribuidora Central",
      "contact_name": "Laura Gómez",
      "email": "ventas@central.com",
      "phone": "2221234567",
      "address": "Puebla, México",
      "active": true,
      "created_at": "2026-07-16T17:00:00.000Z",
      "updated_at": "2026-07-16T17:00:00.000Z"
    }
  ]
}
```

The endpoint returns active and inactive suppliers, ordered by ID in ascending order.

## Get Supplier by ID

```http
GET /api/suppliers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Distribuidora Central",
    "contact_name": "Laura Gómez",
    "email": "ventas@central.com",
    "phone": "2221234567",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-16T17:00:00.000Z",
    "updated_at": "2026-07-16T17:00:00.000Z"
  }
}
```

If the supplier does not exist, the endpoint returns `404 Not Found`.

## Create Supplier

```http
POST /api/suppliers
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

### Request body

```json
{
  "name": "Distribuidora Central",
  "contactName": "Laura Gómez",
  "email": "ventas@central.com",
  "phone": "2221234567",
  "address": "Puebla, México"
}
```

Only `name` is required. Optional fields that are not sent are stored as `null`.

### Successful response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Distribuidora Central",
    "contact_name": "Laura Gómez",
    "email": "ventas@central.com",
    "phone": "2221234567",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-16T17:00:00.000Z",
    "updated_at": "2026-07-16T17:00:00.000Z"
  },
  "message": "Supplier created successfully"
}
```

If the email already belongs to another supplier, including with different letter casing, the endpoint returns `409 Conflict`.

## Update Supplier

```http
PUT /api/suppliers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

At least one editable field must be included. Fields that are not sent keep their current values.

### Request body

```json
{
  "contactName": "Mariana López",
  "phone": "2229998877"
}
```

### Request body to clear optional fields

Optional fields can be cleared by sending `null`.

```json
{
  "contactName": null,
  "email": null,
  "phone": null,
  "address": null
}
```

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Distribuidora Central",
    "contact_name": "Mariana López",
    "email": "ventas@central.com",
    "phone": "2229998877",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-16T17:00:00.000Z",
    "updated_at": "2026-07-16T17:30:00.000Z"
  },
  "message": "Supplier updated successfully"
}
```

The `active` field cannot be changed through this endpoint. Use the deactivate and activate endpoints instead.

## Deactivate Supplier

```http
DELETE /api/suppliers/:id
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

This endpoint performs a soft delete by setting `active` to `false`. It does not remove the database row.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Distribuidora Central",
    "contact_name": "Mariana López",
    "email": "ventas@central.com",
    "phone": "2229998877",
    "address": "Puebla, México",
    "active": false,
    "created_at": "2026-07-16T17:00:00.000Z",
    "updated_at": "2026-07-16T18:00:00.000Z"
  },
  "message": "Supplier deactivated successfully"
}
```

## Activate Supplier

```http
PATCH /api/suppliers/:id/activate
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Distribuidora Central",
    "contact_name": "Mariana López",
    "email": "ventas@central.com",
    "phone": "2229998877",
    "address": "Puebla, México",
    "active": true,
    "created_at": "2026-07-16T17:00:00.000Z",
    "updated_at": "2026-07-16T18:05:00.000Z"
  },
  "message": "Supplier activated successfully"
}
```

## Error Responses

Typical error response:

```json
{
  "success": false,
  "message": "Supplier not found"
}
```

| Status             | Example reason                                                 |
| ------------------ | -------------------------------------------------------------- |
| `400 Bad Request`  | Missing name, empty field, invalid email, or empty update body |
| `401 Unauthorized` | Missing, invalid, or expired access token                      |
| `403 Forbidden`    | User role cannot activate or deactivate suppliers              |
| `404 Not Found`    | Supplier does not exist                                        |
| `409 Conflict`     | Supplier email already exists                                  |

## Business Rules

- Supplier names are required but are not unique.
- Supplier contact information is optional.
- Supplier emails are unique without case sensitivity when provided.
- Multiple suppliers can exist without an email address.
- Updating a supplier preserves fields that are not included in the request.
- Suppliers are deactivated using soft delete.
- Inactive suppliers remain available through read endpoints.
- Only `ADMIN` and `SUPERVISOR` can activate or deactivate suppliers.
- Optional fields can be cleared during an update by sending `null`.
