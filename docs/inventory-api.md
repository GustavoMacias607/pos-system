# Inventory API

This document describes the inventory endpoints available in the POS System API.

The Inventory module is responsible for tracking stock movements, creating manual inventory adjustments, registering stock entries, and recording waste movements.

---

## Base URL

```http
/api/inventory
```

---

## Available endpoints

```http
GET /api/inventory/movements
POST /api/inventory/adjustment
POST /api/inventory/stock-entry
POST /api/inventory/waste
```

---

# Movement types

The inventory system uses the following movement types:

```text
PURCHASE
SALE
WASTE
SUPPLIER_RETURN
CUSTOMER_RETURN
MANUAL_ADJUSTMENT
```

## Movement meaning

| Type              | Meaning                                                          | Quantity sign        |
| ----------------- | ---------------------------------------------------------------- | -------------------- |
| PURCHASE          | Stock entry from purchase or supplier delivery                   | Positive             |
| SALE              | Stock exit caused by a sale                                      | Negative             |
| WASTE             | Stock exit caused by damaged, expired, lost, or removed products | Negative             |
| SUPPLIER_RETURN   | Stock exit caused by returning products to a supplier            | Negative             |
| CUSTOMER_RETURN   | Stock entry caused by a sale cancellation or customer return     | Positive             |
| MANUAL_ADJUSTMENT | Manual stock correction                                          | Positive or negative |

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

### Query parameters

The inventory movements endpoint supports optional filters.

| Parameter | Type    | Required | Description                        |
| --------- | ------- | -------: | ---------------------------------- |
| type      | string  |       No | Filters movements by movement type |
| productId | integer |       No | Filters movements by product ID    |

### Filter examples

Filter movements by type:

```http
GET /api/inventory/movements?type=WASTE
```

Filter movements by product ID:

```http
GET /api/inventory/movements?productId=1
```

Filter movements by type and product ID:

```http
GET /api/inventory/movements?type=PURCHASE&productId=1
```

### Valid movement types

```text
PURCHASE
SALE
WASTE
SUPPLIER_RETURN
CUSTOMER_RETURN
MANUAL_ADJUSTMENT
```

### Filter validation errors

Invalid movement type:

```json
{
  "success": false,
  "message": "Invalid movement type"
}
```

Status code:

```http
400 Bad Request
```

Invalid product ID:

```json
{
  "success": false,
  "message": "Product ID must be a positive integer"
}
```

Status code:

```http
400 Bad Request
```

### Business rules

- Inventory movements are returned in descending order by creation date.
- The response includes the product name using a join with the products table.
- Positive quantities represent stock entries.
- Negative quantities represent stock exits.

---

## Create manual stock adjustment

Creates a manual inventory adjustment and updates product stock.

This endpoint is used for manual stock corrections.

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

### Business rules

- The product must exist.
- The product must be active.
- Quantity cannot be zero.
- Positive quantity increases product stock.
- Negative quantity decreases product stock.
- The system does not allow stock to go below zero.
- Every manual adjustment creates a movement with type `MANUAL_ADJUSTMENT`.
- The movement quantity keeps the original sign sent by the user.
- Stock update and movement creation are executed inside a database transaction.
- If any operation fails, the transaction is rolled back.

---

## Positive manual adjustment example

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

## Negative manual adjustment example

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

## Create stock entry

Creates a stock entry and increases product stock.

This endpoint is used when new products are received, for example from a supplier delivery or purchase.

```http
POST /api/inventory/stock-entry
```

### Request body

```json
{
  "productId": 1,
  "quantity": 20,
  "reason": "New supplier delivery"
}
```

### Request fields

| Field     | Type    | Required | Description                |
| --------- | ------- | -------: | -------------------------- |
| productId | integer |      Yes | Product ID to increase     |
| quantity  | integer |      Yes | Quantity to add to stock   |
| reason    | string  |      Yes | Reason for the stock entry |

### Business rules

- The product must exist.
- The product must be active.
- Quantity must be greater than zero.
- Stock entry always increases product stock.
- A movement with type `PURCHASE` is created.
- The movement quantity is stored as a positive number.
- Stock update and movement creation are executed inside a database transaction.
- If any operation fails, the transaction is rolled back.

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
      "stock": 35,
      "active": true,
      "created_at": "2026-07-07T15:20:10.000Z",
      "updated_at": "2026-07-08T18:00:00.000Z"
    },
    "movement": {
      "id": 44,
      "product_id": 1,
      "type": "PURCHASE",
      "quantity": 20,
      "reason": "New supplier delivery",
      "created_at": "2026-07-08T18:00:00.000Z"
    }
  },
  "message": "Stock entry created successfully"
}
```

---

## Create waste movement

Creates a waste movement and decreases product stock.

This endpoint is used when products are damaged, expired, lost, or removed from inventory.

```http
POST /api/inventory/waste
```

### Request body

```json
{
  "productId": 1,
  "quantity": 3,
  "reason": "Damaged products"
}
```

### Request fields

| Field     | Type    | Required | Description                   |
| --------- | ------- | -------: | ----------------------------- |
| productId | integer |      Yes | Product ID to decrease        |
| quantity  | integer |      Yes | Quantity to remove from stock |
| reason    | string  |      Yes | Reason for the waste movement |

### Business rules

- The product must exist.
- The product must be active.
- Quantity must be greater than zero.
- The system does not allow stock to go below zero.
- Waste decreases product stock.
- A movement with type `WASTE` is created.
- The user sends quantity as a positive number.
- The movement quantity is stored as a negative number.
- Stock update and movement creation are executed inside a database transaction.
- If any operation fails, the transaction is rolled back.

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
      "stock": 32,
      "active": true,
      "created_at": "2026-07-07T15:20:10.000Z",
      "updated_at": "2026-07-08T18:05:00.000Z"
    },
    "movement": {
      "id": 45,
      "product_id": 1,
      "type": "WASTE",
      "quantity": -3,
      "reason": "Damaged products",
      "created_at": "2026-07-08T18:05:00.000Z"
    }
  },
  "message": "Waste movement created successfully"
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

Used by manual inventory adjustment.

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

## Quantity less than or equal to zero

Used by stock entry and waste movements.

```json
{
  "success": false,
  "message": "Quantity must be greater than zero"
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

## Invalid reason type

```json
{
  "success": false,
  "message": "Reason must be a string"
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

## Insufficient stock for adjustment

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

## Insufficient stock for waste

```json
{
  "success": false,
  "message": "Insufficient stock for waste"
}
```

Status code:

```http
409 Conflict
```

---

# General business rules

- Inventory movements are used to keep a historical record of stock changes.
- Positive quantities represent stock entries.
- Negative quantities represent stock exits.
- Manual stock adjustments must always include a reason.
- Stock entries must always use positive quantities.
- Waste requests must receive positive quantities, but the movement is stored as a negative quantity.
- The system does not allow product stock to go below zero.
- The product must exist before creating an inventory movement.
- The product must be active before creating an inventory movement.
- Stock update and movement creation are executed inside a database transaction.
- If any operation fails, the transaction is rolled back.
