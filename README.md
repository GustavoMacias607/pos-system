# POS System

Backend for a Point of Sale system built with Node.js, Express, PostgreSQL, and Docker.

This project is designed as a professional full-stack learning project focused on backend architecture, business rules, authentication, inventory management, sales workflows, and real-world API design.

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
- Client management
- Client activation and deactivation
- Optional client email
- Case-insensitive unique client email validation
- Password hashing with bcrypt
- Login with email and password
- JWT access token authentication
- Refresh token sessions
- Logout by refresh token revocation
- Protected routes
- Role-based authorization
- Two-factor authentication with TOTP
- QR code generation for authenticator apps
- Backup codes for 2FA recovery
- Google Login using Google ID tokens
- Google account linking through user identities
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

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose
- bcrypt
- JSON Web Token
- otplib
- qrcode
- Google Auth Library

## Project Structure

- `backend/src/controllers`: HTTP controllers
- `backend/src/services`: business logic
- `backend/src/repositories`: database access
- `backend/src/middlewares`: Express middlewares
- `backend/src/validators`: reusable input validators
- `backend/src/constants`: shared constants
- `backend/src/errors`: custom application errors
- `backend/src/utils`: shared utilities
- `backend/migrations`: database migrations
- `docs`: module documentation

## API Documentation

- [Products API](./docs/products-api.md)
- [Categories API](./docs/categories-api.md)
- [Sales API](./docs/sales-api.md)
- [Inventory API](./docs/inventory-api.md)
- [Users API](./docs/users-api.md)
- [Clients API](./docs/clients-api.md)
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
- Validate stock
- Detect low stock products using minimum stock

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
- Hash passwords with bcrypt
- Prevent returning `password` or `password_hash` in API responses

Valid roles:

- `ADMIN`
- `EMPLOYEE`
- `SUPERVISOR`

### Clients

```http
/api/clients
```

Available endpoints:

```http
GET /api/clients
GET /api/clients/:id
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
PATCH /api/clients/:id/activate
```

Main features:

- Create clients
- List clients
- Get client by ID
- Update clients
- Activate clients
- Deactivate clients
- Validate required client fields
- Validate client email format
- Validate unique client email
- Support clients without email
- Soft delete clients using `active = false`

### Auth

```http
/api/auth
```

Available endpoints:

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify-setup
POST /api/auth/2fa/verify-login
POST /api/auth/2fa/disable
POST /api/auth/google
```

Main features:

- Login with email and password
- Password validation using bcrypt
- JWT access token generation
- Refresh token generation
- Session persistence in database
- Logout by revoking refresh token sessions
- Protected routes using `Authorization: Bearer <accessToken>`
- Role-based access control
- Active user validation before authentication
- Two-factor authentication using TOTP
- QR code generation for Google Authenticator or similar apps
- Backup codes for 2FA recovery
- Google Login using Google ID tokens
- Google account linking through `user_identities`

Authentication flows:

```txt
Email/password
↓
accessToken + refreshToken
```

```txt
Email/password with 2FA enabled
↓
requiresTwoFactor = true
↓
verify TOTP token or backup code
↓
accessToken + refreshToken
```

```txt
Google Login
↓
Google ID token
↓
backend verifies token
↓
accessToken + refreshToken
```

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
- Execute sale creation inside a database transaction
- Execute sale cancellation inside a database transaction

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

## Environment Variables

The project uses environment variables for database, server, JWT, and Google authentication configuration.

Example:

```env
PORT=3000

DB_HOST=postgres
DB_PORT=5432
DB_USER=pos_user
DB_PASSWORD=pos_password
DB_NAME=pos_db

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d

GOOGLE_CLIENT_ID=your_google_client_id_here
```

Important:

- `.env` contains local real values and should not be committed.
- `.env.example` contains placeholder values and should be committed.
- `JWT_SECRET` must be kept private.
- `GOOGLE_CLIENT_ID` is used to validate Google ID tokens.
- Google Client Secret is not used by the current Google Login flow.

## Run Project

```bash
docker compose up -d
```

To rebuild and recreate the backend container:

```bash
docker compose up -d --build --force-recreate backend
```

## Run Migrations

```bash
docker exec -it pos-backend npm run migrate
```

## Check Backend Logs

```bash
docker logs -f pos-backend
```

## Access PostgreSQL

```bash
docker exec -it pos-postgres psql -U pos_user -d pos_db
```

## Database

The project uses PostgreSQL running in Docker.

Main database-related tables:

- `products`
- `categories`
- `users`
- `clients`
- `user_sessions`
- `user_backup_codes`
- `user_identities`
- `sales`
- `sale_details`
- `inventory_movements`
- `schema_migrations`

## Authentication Notes

User passwords are hashed with bcrypt before being stored in the database.

User passwords and password hashes are never returned by the API.

JWT access tokens are used to authenticate protected routes.

Protected routes require a valid JWT access token using the `Authorization: Bearer <accessToken>` header.

Refresh tokens are stored as hashes in the `user_sessions` table.

Logout revokes the refresh token session by setting `revoked_at`.

Two-factor authentication uses TOTP codes generated by authenticator apps.

Backup codes are generated when 2FA is enabled and can only be used once.

Backup codes are stored as hashes in the database.

Google Login validates Google ID tokens using `GOOGLE_CLIENT_ID`.

Google Login does not create POS users automatically. The POS user must already exist with the same email before the Google account can be linked.

## Business Rules

Sale creation and sale cancellation are executed using database transactions to keep sales, stock, and inventory movements consistent.

Manual inventory adjustments, stock entries, and waste movements are also executed using database transactions to keep product stock and inventory movement history consistent.

The system does not allow inventory operations that would leave product stock below zero.

A product is considered low stock when its current stock is less than or equal to its minimum stock.

Users are soft deleted by setting `active = false`.

Clients are soft deleted by setting `active = false`.

Client email is optional.

Client email uniqueness is case-insensitive when provided.

Multiple clients can exist without email.

Sales can be created with or without a registered client.

Inactive users cannot log in.

Invalid email and invalid password return the same error message for security reasons.

Users can only access routes allowed for their role.

`ADMIN` has full administrative access.

`SUPERVISOR` can manage products, categories, sales cancellation, and inventory operations.

`EMPLOYEE` can perform operational tasks such as creating sales, registering clients, and reading allowed resources.
