# Sales API

This module handles the sale lifecycle in the POS system.

It supports:

- Creating sales
- Listing sales
- Getting sale details
- Cancelling sales
- Updating product stock
- Registering inventory movements

All sale creation and cancellation operations are executed inside database transactions.

---

## Create Sale

Creates a new sale, stores sale details, decreases product stock, and registers inventory movements.

```http
POST /api/sales
```

### Request body

```json
{
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

### Valid payment methods

```text
CASH
CARD
TRANSFER
```

### Behavior

- Repeated products are normalized before processing.
- The backend calculates prices and totals.
- The frontend does not send product prices.
- Products must exist.
- Products must be active.
- Stock must be sufficient.
- Product stock is decreased.
- Inventory movements are registered with type `SALE` and negative quantity.

### Success response

```json
{
  "success": true,
  "data": {
    "sale": {
      "id": 1,
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

---

## Get Sales

Returns the sale history.

```http
GET /api/sales
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subtotal": "100.00",
      "discount_total": "0.00",
      "tax": "0.00",
      "total": "100.00",
      "payment_method": "CASH",
      "status": "COMPLETED",
      "created_at": "2026-07-06T18:00:00.000Z"
    }
  ]
}
```

---

## Get Sale By ID

Returns a sale with its details.

```http
GET /api/sales/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "subtotal": "100.00",
    "discount_total": "0.00",
    "tax": "0.00",
    "total": "100.00",
    "payment_method": "CASH",
    "status": "COMPLETED",
    "created_at": "2026-07-06T18:00:00.000Z",
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
