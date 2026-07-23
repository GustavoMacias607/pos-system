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

### Cash register integration

Sales paid with `CASH` require the authenticated user to have an open cash register session.

When a cash sale is completed:

- The backend automatically creates a `SALE` cash movement.
- The movement amount is equal to the sale total.
- The movement stores the related `sale_id`.
- The movement is registered in the authenticated user's open session.
- The cash register session is locked during the operation to prevent concurrent closing.

Sales paid with `CARD` or `TRANSFER` do not require an open cash register session and do not create cash movements.

Sale creation, inventory updates, inventory movements, and the automatic cash movement are executed inside the same database transaction. If any operation fails, all changes are rolled back.

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
- Cash sales require an open cash register session for the authenticated user.
- Cash sales automatically create a `SALE` cash movement for the sale total.
- Automatic cash movements store the related `sale_id`.
- `CARD` and `TRANSFER` sales do not create cash movements.
- The open cash register session is locked during cash sale creation.
- Sale, inventory, and cash operations are committed or rolled back together.

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
    ],
    "cashMovement": {
      "id": "3",
      "cash_session_id": "2",
      "created_by_user_id": 8,
      "type": "SALE",
      "amount": "100.00",
      "reason": "Sale #1",
      "sale_id": "1",
      "created_at": "2026-07-22T23:17:10.000Z"
    }
  },
  "message": "Sale created successfully"
}
```

For sales paid with `CARD` or `TRANSFER`, `cashMovement` is `null`.

For an anonymous sale:

```json
{
  "client_id": null
}
```

The creation response contains `client_id` but not `client_name`. Sale queries include both fields.

### Open cash session required

A cash sale cannot be created when the authenticated user does not have an open cash register session.

```json
{
  "success": false,
  "message": "An open cash session is required for cash sales"
}
```

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
- Cancelling a cash sale requires an open cash register session for the authenticated user.
- Cancelling a cash sale automatically creates a `REFUND` cash movement.
- The refund amount is equal to the sale total.
- The automatic refund stores the related `sale_id`.
- The refund is registered in the current open session of the user performing the cancellation.
- Cancelling a `CARD` or `TRANSFER` sale does not create a cash movement.
- The cash register session is locked during cash sale cancellation.
- Sale cancellation, inventory restoration, inventory movements, and the refund are executed inside the same database transaction.
- If any operation fails, all cancellation changes are rolled back.

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
    ],
    "cashMovement": {
      "id": "4",
      "cash_session_id": "2",
      "created_by_user_id": 8,
      "type": "REFUND",
      "amount": "100.00",
      "reason": "Refund for cancelled sale #1",
      "sale_id": "1",
      "created_at": "2026-07-22T23:17:30.000Z"
    }
  },
  "message": "Sale cancelled successfully"
}
```

When a sale paid with `CARD` or `TRANSFER` is cancelled, `cashMovement` is `null`.

### Open cash session required

Cancelling a cash sale requires the authenticated user to have an open cash register session.

```json
{
  "success": false,
  "message": "An open cash session is required for cash refunds"
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
- Cash sales require an open cash register session for the authenticated user.
- Cash sales create automatic `SALE` cash movements.
- Cancelling cash sales creates automatic `REFUND` cash movements.
- Automatic `SALE` and `REFUND` movements preserve the related `sale_id`.
- Automatic cash movements are registered in the authenticated user's current open session.
- `CARD` and `TRANSFER` sales do not affect expected cash.
- Cash register sessions are locked while automatic cash movements are registered.
- Sale, inventory, and cash operations are committed or rolled back together.
