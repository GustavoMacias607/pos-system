# Inventory API

This document describes the inventory endpoints available in the POS System API.

The Inventory module is responsible for tracking stock movements and allowing manual stock adjustments.

---

## Base URL

```http
/api/inventory
```

---

# Endpoints

## Get inventory movements

Returns the inventory movement history.

```http
GET /api/inventory/movements
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 41,
      "product_id": 1,
      "product_name": "Laptop Lenovo Actualizada",
      "type": "CUSTOMER_RETURN",
      "quantity": 10,
      "reason": "Cancelled sale #15 - Laptop Lenovo Actualizada",
      "created_at": "2026-07-07T17:38:17.511Z"
    }
  ]
}
```

### Movement types

Possible movement types:

```text
PURCHASE
SALE
WASTE
SUPPLIER_RETURN
CUSTOMER_RETURN
MANUAL_ADJUSTMENT
```

### Business notes

- Positive quantities represent stock entries.
- Negative quantities represent stock exits.
- Sale movements are registered with negative quantities.
- Customer return movements are registered with positive quantities.
- Manual adjustments can be positive or negative depending on the correction needed.

---

## Create manual stock adjustment

Creates a manual inventory adjustment and updates product stock.

```http
POST /api/inventory/adjustment
```

### Request body

```json
{
  "productId": 1,
  "quantity": 5,
  "reason": "Manual stock correction"
}
```

### Request fields

| Field     | Type    | Required | Description                            |
| --------- | ------- | -------: | -------------------------------------- |
| productId | integer |      Yes | Product ID to adjust                   |
| quantity  | integer |      Yes | Quantity to add or subtract from stock |
| reason    | string  |      Yes | Reason for the inventory adjustment    |

---

## Positive adjustment example

A positive quantity increases product stock.

```json
{
  "productId": 1,
  "quantity": 5,
  "reason": "Manual stock correction"
}
```

### Success response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Laptop Lenovo Actualizada",
      "description": "Laptop updated description",
      "price": "15000.00",
      "stock": 15,
      "active": true,
      "created_at": "2026-07-07T15:20:10.000Z",
      "updated_at": "2026-07-07T18:00:00.000Z"
    },
    "movement": {
      "id": 42,
      "product_id": 1,
      "type": "MANUAL_ADJUSTMENT",
      "quantity": 5,
      "reason": "Manual stock correction",
      "created_at": "2026-07-07T18:00:00.000Z"
    }
  },
  "message": "Inventory adjustment created successfully"
}
```

---

## Negative adjustment example

A negative quantity decreases product stock.

```json
{
  "productId": 1,
  "quantity": -2,
  "reason": "Damaged products"
}
```

### Success response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Laptop Lenovo Actualizada",
      "description": "Laptop updated description",
      "price": "15000.00",
      "stock": 13,
      "active": true,
      "created_at": "2026-07-07T15:20:10.000Z",
      "updated_at": "2026-07-07T18:05:00.000Z"
    },
    "movement": {
      "id": 43,
      "product_id": 1,
      "type": "MANUAL_ADJUSTMENT",
      "quantity": -2,
      "reason": "Damaged products",
      "created_at": "2026-07-07T18:05:00.000Z"
    }
  },
  "message": "Inventory adjustment created successfully"
}
```

---

# Error responses

## Invalid product ID

```json
{
  "success": false,
  "message": "Product ID must be an integer"
}
```

Status code:

```http
400 Bad Request
```

---

## Invalid quantity

```json
{
  "success": false,
  "message": "Quantity must be an integer"
}
```

Status code:

```http
400 Bad Request
```

---

## Quantity equal to zero

```json
{
  "success": false,
  "message": "Quantity cannot be zero"
}
```

Status code:

```http
400 Bad Request
```

---

## Missing reason

```json
{
  "success": false,
  "message": "Reason is required"
}
```

Status code:

```http
400 Bad Request
```

---

## Empty reason

```json
{
  "success": false,
  "message": "Reason cannot be empty"
}
```

Status code:

```http
400 Bad Request
```

---

## Product not found

```json
{
  "success": false,
  "message": "Product not found"
}
```

Status code:

```http
404 Not Found
```

---

## Inactive product

```json
{
  "success": false,
  "message": "Product is inactive"
}
```

Status code:

```http
409 Conflict
```

---

## Insufficient stock

```json
{
  "success": false,
  "message": "Insufficient stock for adjustment"
}
```

Status code:

```http
409 Conflict
```

---

# Business rules

- Inventory movements are used to keep a historical record of stock changes.
- Manual stock adjustments must always include a reason.
- Positive manual adjustments increase product stock.
- Negative manual adjustments decrease product stock.
- The system does not allow product stock to go below zero.
- The product must exist before creating an inventory adjustment.
- The product must be active before creating an inventory adjustment.
- Every manual adjustment creates a movement with type `MANUAL_ADJUSTMENT`.
- Stock update and movement creation are executed inside a database transaction.
- If any operation fails, the transaction is rolled back.
