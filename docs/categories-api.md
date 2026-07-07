# Categories API

This module handles category management in the POS system.

It supports:

- Listing categories
- Getting category details
- Creating categories
- Updating categories
- Deactivating categories
- Reactivating categories

Categories are not physically deleted from the database. Instead, they are deactivated using a soft delete strategy.

Inactive categories do not block sales of active products.

---

## Get Categories

Returns all categories.

```http
GET /api/categories
```

### Success response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bebidas",
      "description": "Refrescos, jugos y agua",
      "active": true,
      "created_at": "2026-07-06T18:00:00.000Z",
      "updated_at": "2026-07-06T18:00:00.000Z"
    }
  ]
}
```

---

## Get Category By ID

Returns a category by its ID.

```http
GET /api/categories/:id
```

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bebidas",
    "description": "Refrescos, jugos y agua",
    "active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:00:00.000Z"
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## Create Category

Creates a new category.

```http
POST /api/categories
```

### Request body

```json
{
  "name": "Bebidas",
  "description": "Refrescos, jugos y agua"
}
```

### Behavior

- Category name is required.
- Category name must be a string.
- Category name cannot be empty.
- Category name must be unique.
- Category description is optional.
- Category description must be a string if provided.
- Category is created as active by default.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bebidas",
    "description": "Refrescos, jugos y agua",
    "active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:00:00.000Z"
  }
}
```

### Error response when category already exists

```json
{
  "success": false,
  "message": "Category already exists"
}
```

### Error response when name is missing

```json
{
  "success": false,
  "message": "Category name is required"
}
```

### Error response when name is empty

```json
{
  "success": false,
  "message": "Category name cannot be empty"
}
```

---

## Update Category

Updates an existing category.

```http
PUT /api/categories/:id
```

### Request body

```json
{
  "name": "Bebidas frías",
  "description": "Refrescos, jugos, agua y bebidas frías"
}
```

### Behavior

- Category must exist.
- Category name is required.
- Category name must be unique.
- Category name cannot conflict with another category.
- Category description is optional.
- `updated_at` is updated when the category changes.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bebidas frías",
    "description": "Refrescos, jugos, agua y bebidas frías",
    "active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:30:00.000Z"
  }
}
```

### Error response when category does not exist

```json
{
  "success": false,
  "message": "Category not found"
}
```

### Error response when category name already exists

```json
{
  "success": false,
  "message": "Category name already exists"
}
```

---

## Deactivate Category

Deactivates a category using soft delete.

```http
DELETE /api/categories/:id
```

### Behavior

- Category is not removed from the database.
- Category `active` status is changed to `false`.
- Products assigned to this category are not deleted.
- Products assigned to this category are not automatically deactivated.
- Inactive categories do not block sales of active products.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bebidas frías",
    "description": "Refrescos, jugos, agua y bebidas frías",
    "active": false,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:40:00.000Z"
  },
  "message": "Category deactivated successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## Activate Category

Reactivates a previously deactivated category.

```http
PATCH /api/categories/:id/activate
```

### Behavior

- Category must exist.
- Category `active` status is changed to `true`.
- `updated_at` is updated when the category is reactivated.

### Success response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bebidas frías",
    "description": "Refrescos, jugos, agua y bebidas frías",
    "active": true,
    "created_at": "2026-07-06T18:00:00.000Z",
    "updated_at": "2026-07-06T18:45:00.000Z"
  },
  "message": "Category activated successfully"
}
```

### Error response

```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## Business Rules

- Category names must be unique.
- Category names are compared case-insensitively.
- Categories are soft deleted by setting `active = false`.
- Inactive categories do not block sales of active products.
- Products assigned to inactive categories are not automatically modified.
- Category validation is handled through reusable validators.
- Category creation and update validate the request body before executing business logic.
