# POS System

Backend for a Point of Sale system built with Node.js, Express, PostgreSQL, and Docker.

## Current Features

- Product management
- Product activation and deactivation
- Sale creation
- Sale detail registration
- Stock decrease after sales
- Inventory movement history
- Sale cancellation
- Stock restoration after sale cancellation
- Transactional sale operations

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

- [Sales API](./docs/sales-api.md)

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
- `sales`
- `sale_details`
- `inventory_movements`
- `schema_migrations`

## Notes

Sale creation and sale cancellation are executed using database transactions to keep sales, stock, and inventory movements consistent.
