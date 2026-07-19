# Sales API

This module handles the sale lifecycle in the POS system.

It supports:

- Creating sales
- Listing sales
- Getting sale details
- Cancelling sales
- Updating product stock
- Registering inventory movements
- Optional client association
- Sales filtering by client

All sale creation and cancellation operations are executed inside database transactions.

---

## Create Sale

Creates a new sale with or without a registered client, stores sale details, decreases product stock, and registers inventory movements.

```http
POST /api/sales
```

### Request body with client

```json
{
  "clientId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 12,
      "quantity": 1
    }
  ],
  "paymentMethod": "CASH"
}
```

### Request body without client

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "paymentMethod": "CASH"
}
```

Omitting `clientId` or sending `null` creates an anonymous sale.

### Valid payment methods

```text
CASH
CARD
TRANSFER
```

### Behavior

- `clientId` is optional.
- If `clientId` is provided, it must be a positive integer.
- The client must exist.
- The client must be active when creating the sale.
- Anonymous sales store `client_id = NULL`.
- Repeated products are normalized before processing.
- The backend calculates prices and totals.
- The frontend does not send product prices.
- Products must exist.
- Products must be active.
- Stock must be sufficient.
- Product stock is decreased atomically.
- Inventory movements are registered with type `SALE` and negative quantity.

### Success response

```json
{
  "success": true,
  "data": {
    "sale": {
      "id": 1,
      "client_id": "1",
      "subtotal": "100.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "100.00",
      "payment_method": "CASH",
      "status": "COMPLETED"
    },
    "details": [
      {
        "sale_id": 1,
        "product_id": 1,
        "product_name": "Example Product",
        "quantity": 2,
        "unit_price": "50.00",
        "discount": "0.00",
        "line_total": "100.00"
      }
    ],
    "movements": [
      {
        "product_id": 1,
        "type": "SALE",
        "quantity": -2,
        "reason": "Sale #1 - Example Product"
      }
    ]
  },
  "message": "Sale created successfully"
}
```

For an anonymous sale:

```json
{
  "client_id": null
}
```

The creation response contains `client_id` but not `client_name`. Sale queries include both fields.

### Client not found

```json
{
  "success": false,
  "message": "Client not found"
}
```

### Client is inactive

```json
{
  "success": false,
  "message": "Client is inactive"
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

## Get Sales

Returns the complete sale history or filters sales by client.

```http
GET /api/sales
GET /api/sales?clientId=1
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": "1",
      "client_name": "Juan Pérez",
      "subtotal": "100.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "100.00",
      "payment_method": "CASH",
      "status": "COMPLETED",
      "created_at": "2026-07-18T18:00:00.000Z"
    },
    {
      "id": 2,
      "client_id": null,
      "client_name": null,
      "subtotal": "50.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "50.00",
      "payment_method": "CARD",
      "status": "COMPLETED",
      "created_at": "2026-07-18T19:00:00.000Z"
    }
  ]
}
```

### Filter sales by client

```http
GET /api/sales?clientId=1
```

The client must exist. Inactive clients can still be used to retrieve historical sales.

If the client exists but has no sales:

```json
{
  "success": true,
  "data": []
}
```

Invalid examples:

```http
GET /api/sales?clientId=0
GET /api/sales?clientId=-1
GET /api/sales?clientId=abc
GET /api/sales?clientId=1.5
```

These requests return:

```json
{
  "success": false,
  "message": "Client ID must be a positive integer"
}
```

If the client does not exist:

```json
{
  "success": false,
  "message": "Client not found"
}
```

---

## Get Sale By ID

Returns a sale with its details and optional client information.

```http
GET /api/sales/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "client_id": "1",
    "client_name": "Juan Pérez",
    "subtotal": "100.00",
    "discount_total": "0.00",
    "tax": "0.00",
    "total": "100.00",
    "payment_method": "CASH",
    "status": "COMPLETED",
    "created_at": "2026-07-18T18:00:00.000Z",
    "details": [
      {
        "id": 1,
        "sale_id": 1,
        "product_id": 1,
        "product_name": "Example Product",
        "quantity": 2,
        "unit_price": "50.00",
        "discount": "0.00",
        "line_total": "100.00"
      }
    ]
  }
}
```

For an anonymous sale:

```json
{
  "client_id": null,
  "client_name": null
}
```

### Error response

```json
{
  "success": false,
  "message": "Sale not found"
}
```

---

## Cancel Sale

Cancels a completed sale, restores product stock, and registers inventory return movements.

```http
POST /api/sales/:id/cancel
```

Client association does not affect cancellation. A sale can be cancelled even if its client has been deactivated.

### Behavior

- Sales are not deleted.
- The sale status changes from `COMPLETED` to `CANCELLED`.
- Product stock is increased based on sale details.
- Inventory movements are registered with type `CUSTOMER_RETURN` and positive quantity.
- The cancellation is protected against double cancellation.
- The operation runs inside a database transaction.

### Success response

```json
{
  "success": true,
  "data": {
    "sale": {
      "id": 1,
      "client_id": "1",
      "subtotal": "100.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "100.00",
      "payment_method": "CASH",
      "status": "CANCELLED"
    },
    "movements": [
      {
        "product_id": 1,
        "type": "CUSTOMER_RETURN",
        "quantity": 2,
        "reason": "Cancelled sale #1 - Example Product"
      }
    ]
  },
  "message": "Sale cancelled successfully"
}
```

### Error response when already cancelled

```json
{
  "success": false,
  "message": "Sale is already cancelled"
}
```

---

## Business Rules

- A sale must contain at least one item.
- Item quantity must be greater than zero.
- Payment method must be valid.
- Products must exist.
- Products must be active.
- Stock must be sufficient.
- Product prices are calculated by the backend.
- Sale details store historical snapshots of product name and unit price.
- Sale creation and cancellation are transactional.
- Inventory movements keep the stock history.
- A sale can be created with or without a registered client.
- Omitting `clientId` or sending `null` creates an anonymous sale.
- Only active clients can be associated with new sales.
- Deactivated clients preserve their historical sales.
- Sales can be filtered using `GET /api/sales?clientId=:id`.
- Sale queries use `LEFT JOIN` so anonymous sales remain visible.
