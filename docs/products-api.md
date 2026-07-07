# Products API

This module handles product management in the POS system.

It supports:

- Listing products
- Getting product details
- Creating products
- Updating products
- Deactivating products
- Reactivating products
- Assigning products to categories

Products are not physically deleted from the database. Instead, they are deactivated using a soft delete strategy.

Products can optionally belong to a category.

---

## Get Products

Returns all products.

```http
GET /api/products
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Coca Cola",
      "description": "Soft drink",
      "price": "20.00",
      "stock": 50,
      "active": true,
      "category_id": 1,
      "category_name": "Bebidas",
      "category_active": true,
      "created_at": "2026-07-06T18:00:00.000Z",
      "updated_at": "2026-07-06T18:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Generic Product",
      "description": "Product without category",
      "price": "15.00",
      "stock": 20,
      "active": true,
      "category_id": null,
      "category_name": null,
      "category_active": null,
      "created_at": "2026-07-06T18:00:00.000Z",
      "updated_at": "2026-07-06T18:00:00.000Z"
    }
  ]
}
```

---

## Get Product By ID

Returns a product by its ID.

```http
GET /api/products/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola",
    "description": "Soft drink",
    "price": "20.00",
    "stock": 50,
    "active": true,
    "category_id": 1,
    "category_name": "Bebidas",
    "category_active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:00:00.000Z"
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Create Product

Creates a new product.

```http
POST /api/products
```

### Request body with category

```json
{
  "name": "Coca Cola",
  "description": "Soft drink",
  "price": 20.0,
  "stock": 50,
  "categoryId": 1
}
```

### Request body without category

```json
{
  "name": "Generic Product",
  "description": "Product without category",
  "price": 15.0,
  "stock": 20
}
```

### Behavior

- Product name must be unique.
- Product price must be valid.
- Product stock must be valid.
- `categoryId` is optional.
- If `categoryId` is provided, the category must exist.
- If `categoryId` is provided, the category must be active.
- If `categoryId` is not provided, the product is created without a category.
- Product is created as active by default.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola",
    "description": "Soft drink",
    "price": "20.00",
    "stock": 50,
    "active": true,
    "category_id": 1,
    "category_name": "Bebidas",
    "category_active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:00:00.000Z"
  }
}
```

### Error response when product already exists

```json
{
  "success": false,
  "message": "Product already exists"
}
```

### Error response when category does not exist

```json
{
  "success": false,
  "message": "Category not found"
}
```

### Error response when category is inactive

```json
{
  "success": false,
  "message": "Category is inactive"
}
```

---

## Update Product

Updates an existing product.

```http
PUT /api/products/:id
```

### Request body with category

```json
{
  "name": "Coca Cola 600ml",
  "description": "Soft drink bottle",
  "price": 25.0,
  "stock": 60,
  "categoryId": 1
}
```

### Request body without category

```json
{
  "name": "Coca Cola 600ml",
  "description": "Soft drink bottle",
  "price": 25.0,
  "stock": 60
}
```

### Behavior

- Product must exist.
- Product name must not conflict with another product.
- Product data is replaced with the provided values.
- `categoryId` is optional.
- If `categoryId` is provided, the category must exist.
- If `categoryId` is provided, the category must be active.
- If `categoryId` is not provided, the product is updated without a category.
- `updated_at` is updated when the product changes.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola 600ml",
    "description": "Soft drink bottle",
    "price": "25.00",
    "stock": 60,
    "active": true,
    "category_id": 1,
    "category_name": "Bebidas",
    "category_active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:30:00.000Z"
  }
}
```

### Error response when product does not exist

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Error response when product name already exists

```json
{
  "success": false,
  "message": "Product name already exists"
}
```

### Error response when category does not exist

```json
{
  "success": false,
  "message": "Category not found"
}
```

### Error response when category is inactive

```json
{
  "success": false,
  "message": "Category is inactive"
}
```

---

## Deactivate Product

Deactivates a product using soft delete.

```http
DELETE /api/products/:id
```

### Behavior

- Product is not removed from the database.
- Product `active` status is changed to `false`.
- Inactive products cannot be sold.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola 600ml",
    "description": "Soft drink bottle",
    "price": "25.00",
    "stock": 60,
    "active": false,
    "category_id": 1,
    "category_name": "Bebidas",
    "category_active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:40:00.000Z"
  },
  "message": "Product deleted successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Activate Product

Reactivates a previously deactivated product.

```http
PATCH /api/products/:id/activate
```

### Behavior

- Product must exist.
- Product `active` status is changed to `true`.
- Active products can be sold again if they have enough stock.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Coca Cola 600ml",
    "description": "Soft drink bottle",
    "price": "25.00",
    "stock": 60,
    "active": true,
    "category_id": 1,
    "category_name": "Bebidas",
    "category_active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:45:00.000Z"
  },
  "message": "Product activated successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Business Rules

- Product names must be unique.
- Products are soft deleted by setting `active = false`.
- Inactive products cannot be sold.
- `categoryId` is optional when creating or updating a product.
- If `categoryId` is provided, the category must exist.
- If `categoryId` is provided, the category must be active.
- Products without a category are allowed.
- Inactive categories do not block sales of already active products.
- Product stock is decreased when a sale is created.
- Product stock is increased when a sale is cancelled.
- Product stock changes related to sales are registered in inventory movements.
