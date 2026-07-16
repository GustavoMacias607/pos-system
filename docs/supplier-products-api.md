# Supplier Products API

The Supplier Products API manages the many-to-many relationship between suppliers and products. Each relationship stores the supplier-specific product code, current unit cost, activation status, and timestamps.

## Base URL

```http
/api/suppliers/:supplierId/products
```

## Authentication

All endpoints require a valid JWT access token:

```http
Authorization: Bearer <accessToken>
```

## Role Permissions

| Operation                | ADMIN | SUPERVISOR | EMPLOYEE |
| ------------------------ | :---: | :--------: | :------: |
| List supplier products   |  Yes  |    Yes     |   Yes    |
| Get one supplier product |  Yes  |    Yes     |   Yes    |
| Create relationship      |  Yes  |    Yes     |    No    |
| Update relationship      |  Yes  |    Yes     |    No    |
| Deactivate relationship  |  Yes  |    Yes     |    No    |
| Activate relationship    |  Yes  |    Yes     |    No    |

Requests without a valid token return `401 Unauthorized`. Authenticated users without the required role receive `403 Forbidden`.

## Relationship Fields

### Request fields

| Field                 | Type             | Required on create | Rules                                            |
| --------------------- | ---------------- | :----------------: | ------------------------------------------------ |
| `productId`           | integer          |        Yes         | Must be a positive integer                       |
| `supplierProductCode` | string or `null` |         No         | Cannot be empty; `null` removes the current code |
| `unitCost`            | number           |        Yes         | Must be finite and greater than or equal to zero |

The supplier ID is provided through the URL as `supplierId`. The product ID cannot be changed after the relationship is created.

### Response fields

| Field                   | Type             | Description                                               |
| ----------------------- | ---------------- | --------------------------------------------------------- |
| `id`                    | string           | Relationship identifier returned from PostgreSQL `BIGINT` |
| `supplier_id`           | string           | Supplier identifier                                       |
| `product_id`            | integer          | Product identifier                                        |
| `supplier_product_code` | string or `null` | Product code used by the supplier                         |
| `unit_cost`             | string           | Current cost returned from PostgreSQL `NUMERIC`           |
| `active`                | boolean          | Relationship activation status                            |
| `created_at`            | timestamp        | Creation date and time                                    |
| `updated_at`            | timestamp        | Last update date and time                                 |

List responses also include:

| Field            | Type    | Description                       |
| ---------------- | ------- | --------------------------------- |
| `product_name`   | string  | Product name                      |
| `product_active` | boolean | Current product activation status |

## List Supplier Products

```http
GET /api/suppliers/:supplierId/products
```

Allowed roles: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`.

The endpoint returns active and inactive relationships. If the supplier exists but has no associated products, `data` is an empty array.

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
      "supplier_id": "1",
      "product_id": 5,
      "product_name": "Coca-Cola 600 ml",
      "supplier_product_code": "COC-600",
      "unit_cost": "12.50",
      "active": true,
      "product_active": true,
      "created_at": "2026-07-16T20:00:00.000Z",
      "updated_at": "2026-07-16T20:00:00.000Z"
    }
  ]
}
```

## Get Supplier Product

```http
GET /api/suppliers/:supplierId/products/:productId
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
    "supplier_id": "1",
    "product_id": 5,
    "supplier_product_code": "COC-600",
    "unit_cost": "12.50",
    "active": true,
    "created_at": "2026-07-16T20:00:00.000Z",
    "updated_at": "2026-07-16T20:00:00.000Z"
  }
}
```

If the supplier does not exist, the endpoint returns `404 Supplier not found`. If the supplier exists but the relationship does not, it returns `404 Supplier product relationship not found`.

## Create Supplier Product

```http
POST /api/suppliers/:supplierId/products
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

### Request body

```json
{
  "productId": 5,
  "supplierProductCode": "COC-600",
  "unitCost": 12.5
}
```

The code is optional, so the following request is also valid:

```json
{
  "productId": 6,
  "unitCost": 8.75
}
```

### Successful response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplier_id": "1",
    "product_id": 5,
    "supplier_product_code": "COC-600",
    "unit_cost": "12.50",
    "active": true,
    "created_at": "2026-07-16T20:00:00.000Z",
    "updated_at": "2026-07-16T20:00:00.000Z"
  },
  "message": "Supplier product relationship created successfully"
}
```

The supplier and product must both exist and be active. An existing relationship cannot be created again, even when it is inactive; use the activation endpoint instead.

## Update Supplier Product

```http
PUT /api/suppliers/:supplierId/products/:productId
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

At least one editable field must be included. Fields that are not sent preserve their current values.

### Update only the unit cost

```json
{
  "unitCost": 13.75
}
```

### Update the supplier product code

```json
{
  "supplierProductCode": "COC-600-N"
}
```

### Remove the supplier product code

```json
{
  "supplierProductCode": null
}
```

An absent field keeps its current value, while an explicitly provided `null` removes the supplier product code.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplier_id": "1",
    "product_id": 5,
    "supplier_product_code": null,
    "unit_cost": "13.75",
    "active": true,
    "created_at": "2026-07-16T20:00:00.000Z",
    "updated_at": "2026-07-16T20:30:00.000Z"
  },
  "message": "Supplier product relationship updated successfully"
}
```

## Deactivate Supplier Product

```http
DELETE /api/suppliers/:supplierId/products/:productId
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
    "supplier_id": "1",
    "product_id": 5,
    "supplier_product_code": null,
    "unit_cost": "13.75",
    "active": false,
    "created_at": "2026-07-16T20:00:00.000Z",
    "updated_at": "2026-07-16T20:40:00.000Z"
  },
  "message": "Supplier product relationship deactivated successfully"
}
```

Inactive relationships remain available through the GET endpoints.

## Activate Supplier Product

```http
PATCH /api/suppliers/:supplierId/products/:productId/activate
```

Allowed roles: `ADMIN`, `SUPERVISOR`.

The relationship, supplier, and product must exist. The supplier and product must both be active before their relationship can be activated.

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplier_id": "1",
    "product_id": 5,
    "supplier_product_code": null,
    "unit_cost": "13.75",
    "active": true,
    "created_at": "2026-07-16T20:00:00.000Z",
    "updated_at": "2026-07-16T20:45:00.000Z"
  },
  "message": "Supplier product relationship activated successfully"
}
```

## Validation and Normalization

- `supplierId` and URL `productId` parameters must contain positive integers.
- Body `productId` must be a positive JSON integer, not a numeric string.
- `unitCost` must be sent as a JSON number and cannot be negative.
- `supplierProductCode` is trimmed before duplicate checks and storage.
- Empty supplier product codes are rejected.
- Supplier product codes are unique per supplier without case sensitivity.
- Different suppliers may use the same supplier product code.
- Passing `null` as `supplierProductCode` removes the current code.

## Error Responses

Typical error response:

```json
{
  "success": false,
  "message": "Supplier product relationship not found"
}
```

| Status             | Example reason                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| `400 Bad Request`  | Invalid ID, missing product ID, invalid cost, empty code, or empty update body |
| `401 Unauthorized` | Missing, invalid, or expired access token                                      |
| `403 Forbidden`    | Employee attempts to create, update, activate, or deactivate a relationship    |
| `404 Not Found`    | Supplier, product, or relationship does not exist                              |
| `409 Conflict`     | Inactive supplier/product, duplicate relationship, or duplicate supplier code  |

## Business Rules

- A supplier can provide multiple products.
- A product can be provided by multiple suppliers.
- A supplier-product pair can exist only once.
- Supplier product codes are optional and unique within each supplier.
- Each relationship stores the supplier's current unit cost.
- Updating one field preserves all fields not included in the request.
- Relationships use soft deletion through `active = false`.
- An inactive relationship must be reactivated instead of recreated.
- An inactive supplier or product prevents relationship creation and activation.
