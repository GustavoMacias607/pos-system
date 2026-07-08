# POS System

Backend for a Point of Sale system built with Node.js, Express, PostgreSQL, and Docker.

## Current Features

- Product management
- Product activation and deactivation
- Product category assignment
- Category management
- Category activation and deactivation
- Sale creation
- Sale detail registration
- Stock decrease after sales
- Sale cancellation
- Stock restoration after sale cancellation
- Inventory movement history
- Manual inventory adjustments
- Positive and negative stock corrections
- Stock validation to prevent negative inventory
- Transactional sale operations
- Transactional inventory operations

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
- `docs`: module documentation

## API Documentation

- [Products API](./docs/products-api.md)
- [Categories API](./docs/categories-api.md)
- [Sales API](./docs/sales-api.md)
- [Inventory API](./docs/inventory-api.md)

## Available API Modules

### Products

```http
/api/products
```

Main features:

- Create products
- List products
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
- Update categories
- Activate categories
- Deactivate categories

### Sales

```http
/api/sales
```

Main features:

- Create sales
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
POST /api/inventory/adjustment
```

Main features:

- Inventory movement history
- Manual stock adjustments
- Positive stock corrections
- Negative stock corrections
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
- `sales`
- `sale_details`
- `inventory_movements`
- `schema_migrations`

## Notes

Sale creation and sale cancellation are executed using database transactions to keep sales, stock, and inventory movements consistent.

Manual inventory adjustments are also executed using database transactions to keep product stock and inventory movement history consistent.

The system does not allow inventory adjustments that would leave product stock below zero.
