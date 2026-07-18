# Purchases API

The Purchases API manages product purchases from suppliers and their effects on inventory.

Creating a purchase:

- Creates a purchase header.
- Creates purchase detail records.
- Increases product stock.
- Creates `PURCHASE` inventory movements.
- Updates the current supplier-product unit cost.

Cancelling a purchase:

- Changes the purchase status to `CANCELLED`.
- Decreases product stock.
- Creates `SUPPLIER_RETURN` inventory movements.
- Preserves the purchase and its details for audit purposes.

All inventory-related operations are executed inside database transactions.

## Base URL

```http
/api/purchases
```

## Authentication

All endpoints require an access token:

```http
Authorization: Bearer <accessToken>
```

## Roles

| Endpoint           | ADMIN | SUPERVISOR | EMPLOYEE |
| ------------------ | ----: | ---------: | -------: |
| List purchases     |   Yes |        Yes |       No |
| Get purchase by ID |   Yes |        Yes |       No |
| Create purchase    |   Yes |        Yes |       No |
| Cancel purchase    |   Yes |        Yes |       No |

Purchase information is restricted because it includes supplier invoices, acquisition costs, and inventory operations.

## Purchase statuses

| Status      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `COMPLETED` | The purchase was completed and its stock was added             |
| `CANCELLED` | The purchase was cancelled and its stock effects were reverted |

Purchases are created directly with `COMPLETED` status.

A completed purchase cannot be edited, deleted, or activated. To correct an incorrect purchase, it must be cancelled and a new purchase must be created.

## Business rules

- The supplier must exist and be active when creating the purchase.
- Every product must exist and be active.
- Every product must have an active relationship with the selected supplier.
- A purchase must contain at least one item.
- The same product cannot appear more than once in a purchase.
- Item quantities must be positive integers.
- Unit costs must be non-negative numbers.
- Tax must be a non-negative number.
- Tax represents a monetary amount, not a percentage.
- `invoiceNumber` is optional.
- Invoice numbers are unique per supplier and case-insensitive.
- Different suppliers may use the same invoice number.
- Multiple purchases without an invoice number are allowed.
- `subtotal`, `lineTotal`, and `total` are calculated by the backend.
- The authenticated user is stored as `created_by_user_id`.
- `createdByUserId`, totals, and status are not accepted from the request body.
- Monetary calculations are performed using integer cents.
- Cancelling a purchase requires sufficient current stock.
- Cancelled purchases remain available as historical records.

## Inventory behavior

When a purchase is created, each item generates an inventory movement:

```txt
type = PURCHASE
quantity = positive
purchase_id = created purchase ID
```

When a purchase is cancelled, each item generates a compensating movement:

```txt
type = SUPPLIER_RETURN
quantity = negative
purchase_id = cancelled purchase ID
```

Cancelling a purchase does not restore a previous value of `supplier_products.unit_cost`. That field keeps the latest known supplier cost.

---

## List purchases

Returns all purchases ordered by creation date.

```http
GET /api/purchases
```

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
      "supplier_id": "2",
      "supplier_name": "Central Supplier",
      "created_by_user_id": 1,
      "created_by_user_name": "Admin User",
      "invoice_number": "FAC-100",
      "subtotal": "125.00",
      "tax": "25.50",
      "total": "150.50",
      "status": "COMPLETED",
      "notes": "Complete delivery",
      "created_at": "2026-07-17T18:00:00.000Z",
      "updated_at": "2026-07-17T18:00:00.000Z"
    }
  ]
}
```

The list response does not include purchase details.

---

## Get purchase by ID

Returns one purchase with its items.

```http
GET /api/purchases/:id
```

### Parameters

| Parameter | Type             | Required | Description |
| --------- | ---------------- | -------: | ----------- |
| `id`      | Positive integer |      Yes | Purchase ID |

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplier_id": "2",
    "supplier_name": "Central Supplier",
    "created_by_user_id": 1,
    "created_by_user_name": "Admin User",
    "invoice_number": "FAC-100",
    "subtotal": "125.00",
    "tax": "25.50",
    "total": "150.50",
    "status": "COMPLETED",
    "notes": "Complete delivery",
    "created_at": "2026-07-17T18:00:00.000Z",
    "updated_at": "2026-07-17T18:00:00.000Z",
    "items": [
      {
        "id": "1",
        "purchase_id": "1",
        "product_id": 3,
        "product_name": "Product A",
        "quantity": 10,
        "unit_cost": "12.50",
        "line_total": "125.00",
        "created_at": "2026-07-17T18:00:00.000Z"
      }
    ]
  }
}
```

### Purchase not found

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Purchase not found"
}
```

### Invalid ID

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Purchase ID must be a positive integer"
}
```

---

## Create purchase

Creates a completed purchase and applies all inventory effects.

```http
POST /api/purchases
```

### Request body

| Field               | Type                | Required | Description                       |
| ------------------- | ------------------- | -------: | --------------------------------- |
| `supplierId`        | Positive integer    |      Yes | Supplier ID                       |
| `invoiceNumber`     | String or `null`    |       No | Supplier invoice number           |
| `tax`               | Non-negative number |       No | Tax amount; defaults to `0`       |
| `notes`             | String or `null`    |       No | Additional notes                  |
| `items`             | Array               |      Yes | Products included in the purchase |
| `items[].productId` | Positive integer    |      Yes | Product ID                        |
| `items[].quantity`  | Positive integer    |      Yes | Purchased quantity                |
| `items[].unitCost`  | Non-negative number |      Yes | Cost per unit                     |

```json
{
  "supplierId": 2,
  "invoiceNumber": "FAC-100",
  "tax": 25.5,
  "notes": "Complete delivery",
  "items": [
    {
      "productId": 3,
      "quantity": 10,
      "unitCost": 12.5
    }
  ]
}
```

The backend calculates:

```txt
lineTotal = unitCost × quantity
subtotal = sum of all line totals
total = subtotal + tax
```

For the example:

```txt
lineTotal = 12.50 × 10 = 125.00
subtotal = 125.00
tax = 25.50
total = 150.50
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
    "supplier_id": "2",
    "supplier_name": "Central Supplier",
    "created_by_user_id": 1,
    "created_by_user_name": "Admin User",
    "invoice_number": "FAC-100",
    "subtotal": "125.00",
    "tax": "25.50",
    "total": "150.50",
    "status": "COMPLETED",
    "notes": "Complete delivery",
    "created_at": "2026-07-17T18:00:00.000Z",
    "updated_at": "2026-07-17T18:00:00.000Z",
    "items": [
      {
        "id": "1",
        "purchase_id": "1",
        "product_id": 3,
        "product_name": "Product A",
        "quantity": 10,
        "unit_cost": "12.50",
        "line_total": "125.00",
        "created_at": "2026-07-17T18:00:00.000Z"
      }
    ]
  },
  "message": "Purchase created successfully"
}
```

### Optional fields

A purchase may be created without an invoice number, tax, or notes:

```json
{
  "supplierId": 2,
  "items": [
    {
      "productId": 3,
      "quantity": 5,
      "unitCost": 11.75
    }
  ]
}
```

In this case:

```txt
invoice_number = null
tax = 0
notes = null
```

### Duplicate invoice

Invoice uniqueness is scoped to the supplier and is case-insensitive.

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Invoice number already exists for this supplier"
}
```

### Product not associated with supplier

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Product with ID 3 is not associated with this supplier"
}
```

### Inactive supplier

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Supplier is inactive"
}
```

### Invalid request body

```http
400 Bad Request
```

Examples include:

- Missing supplier ID.
- Empty items array.
- Repeated products.
- Invalid product ID.
- Quantity equal to or less than zero.
- Negative unit cost.
- Negative tax.
- Empty invoice number.
- Empty notes.

---

## Cancel purchase

Cancels a completed purchase and reverts its inventory effects.

```http
PATCH /api/purchases/:id/cancel
```

### Parameters

| Parameter | Type             | Required | Description |
| --------- | ---------------- | -------: | ----------- |
| `id`      | Positive integer |      Yes | Purchase ID |

### Successful response

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplier_id": "2",
    "supplier_name": "Central Supplier",
    "created_by_user_id": 1,
    "created_by_user_name": "Admin User",
    "invoice_number": "FAC-100",
    "subtotal": "125.00",
    "tax": "25.50",
    "total": "150.50",
    "status": "CANCELLED",
    "notes": "Complete delivery",
    "items": [
      {
        "product_id": 3,
        "product_name": "Product A",
        "quantity": 10,
        "unit_cost": "12.50",
        "line_total": "125.00"
      }
    ]
  },
  "message": "Purchase cancelled successfully"
}
```

### Purchase already cancelled

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Purchase is already cancelled"
}
```

### Insufficient stock

A purchase cannot be cancelled when the current stock is lower than any quantity that must be returned.

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Insufficient stock to cancel purchase for product ID 3"
}
```

If cancellation fails:

- The purchase remains `COMPLETED`.
- No stock changes are persisted.
- No `SUPPLIER_RETURN` movements are created.

---

## Transaction guarantees

Purchase creation uses one database transaction for:

1. Creating the purchase.
2. Creating purchase details.
3. Increasing product stock.
4. Creating `PURCHASE` inventory movements.
5. Updating supplier-product unit costs.

Purchase cancellation uses one database transaction for:

1. Changing the status to `CANCELLED`.
2. Decreasing product stock.
3. Creating `SUPPLIER_RETURN` inventory movements.

If any operation fails, all changes are rolled back.

---

## Common errors

| Status | Meaning                                                                      |
| -----: | ---------------------------------------------------------------------------- |
|  `400` | Invalid request data or parameter                                            |
|  `401` | Missing or invalid access token                                              |
|  `403` | Authenticated user does not have permission                                  |
|  `404` | Purchase, supplier, or product not found                                     |
|  `409` | Business conflict, duplicate invoice, inactive record, or insufficient stock |
|  `500` | Unexpected server error                                                      |
