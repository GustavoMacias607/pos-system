# POS System

Backend for a Point of Sale system built with Node.js, Express, PostgreSQL, and Docker.

## Current Features

- Product management
- Product activation and deactivation
- Product category assignment
- Category management
- Category activation and deactivation
- User management
- User activation and deactivation
- User roles: `ADMIN`, `EMPLOYEE`, `SUPERVISOR`
- User email uniqueness validation
- Sale creation
- Sale detail registration
- Stock decrease after sales
- Sale cancellation
- Stock restoration after sale cancellation
- Inventory movement history
- Inventory movement filters by type and product
- Manual inventory adjustments
- Positive and negative stock corrections
- Stock entries using `PURCHASE` movements
- Waste movements for damaged, expired, or lost products
- Low stock product detection
- Stock validation to prevent negative inventory
- Transactional sale operations
- Transactional inventory operations
- Password hashing with bcrypt
- Login with email and password
- JWT access token authentication
- Protected routes
- Role-based authorization

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose

## Project Structure

- `backend/src/controllers`: HTTP controllers
- `backend/src/services`: business logic
- `backend/src/repositories`: database access
- `backend/src/middlewares`: Express middlewares
- `backend/src/validators`: reusable input validators
- `backend/src/constants`: shared constants
- `backend/src/errors`: custom application errors
- `backend/src/utils`: shared utilities
- `docs`: module documentation

## API Documentation

- [Products API](./docs/products-api.md)
- [Categories API](./docs/categories-api.md)
- [Sales API](./docs/sales-api.md)
- [Inventory API](./docs/inventory-api.md)
- [Users API](./docs/users-api.md)
- [Auth API](./docs/auth-api.md)

## Available API Modules

### Products

```http
/api/products
```

Main features:

- Create products
- List products
- Get product by ID
- Update products
- Activate products
- Deactivate products
- Assign products to categories

### Categories

```http
/api/categories
```

Main features:

- Create categories
- List categories
- Get category by ID
- Update categories
- Activate categories
- Deactivate categories

### Users

```http
/api/users
```

Available endpoints:

```http
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
PATCH /api/users/:id/activate
```

Main features:

- Create users
- List users
- Get user by ID
- Update users
- Activate users
- Deactivate users
- Validate required user fields
- Validate user email format
- Validate unique user email
- Validate user roles
- Prevent returning `password` or `password_hash` in API responses

Valid roles:

- `ADMIN`
- `EMPLOYEE`
- `SUPERVISOR`

### Auth

```http
/api/auth
```

Available endpoints:

```http
POST /api/auth/login
```

Main features:

- Login with email and password
- Password validation using bcrypt
- JWT access token generation
- Protected routes using Authorization: Bearer <token>
- Role-based access control
- Active user validation before authentication

### Sales

```http
/api/sales
```

Main features:

- Create sales
- List sales
- Get sale by ID
- Register sale details
- Decrease stock after sale
- Register inventory movements
- Cancel sales
- Restore stock after cancellation

### Inventory

```http
/api/inventory
```

Available endpoints:

```http
GET /api/inventory/movements
GET /api/inventory/movements?type=WASTE
GET /api/inventory/movements?productId=1
GET /api/inventory/movements?type=PURCHASE&productId=1
GET /api/inventory/low-stock
POST /api/inventory/adjustment
POST /api/inventory/stock-entry
POST /api/inventory/waste
```

Main features:

- Inventory movement history
- Inventory movement filters by type and product
- Low stock product detection
- Manual stock adjustments
- Positive stock corrections
- Negative stock corrections
- Stock entries using `PURCHASE` movements
- Waste movements using `WASTE` movements
- Stock validation to prevent negative inventory
- Transactional stock update and movement creation

## Run Project

```bash
docker compose up -d
```

## Run Migrations

```bash
docker exec -it pos-backend npm run migrate
```

## Database

The project uses PostgreSQL running in Docker.

Main database-related tables:

- `products`
- `categories`
- `users`
- `sales`
- `sale_details`
- `inventory_movements`
- `schema_migrations`

## Notes

Sale creation and sale cancellation are executed using database transactions to keep sales, stock, and inventory movements consistent.

Manual inventory adjustments, stock entries, and waste movements are also executed using database transactions to keep product stock and inventory movement history consistent.

The system does not allow inventory operations that would leave product stock below zero.

A product is considered low stock when its current stock is less than or equal to its minimum stock.

Users are soft deleted by setting `active = false`.

User passwords are hashed with bcrypt before being stored in the database.

User passwords and password hashes are never returned by the API.

Protected routes require a valid JWT access token using the `Authorization: Bearer <token>` header.
