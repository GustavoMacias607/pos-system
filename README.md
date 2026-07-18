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
- Supplier management
- Supplier activation and deactivation
- Optional supplier email
- Case-insensitive unique supplier email validation
- Supplier-product relationship management
- Supplier-specific product codes and unit costs
- Supplier-product relationship activation and deactivation
- Purchase management
- Purchase detail registration
- Optional supplier invoice tracking
- Case-insensitive invoice uniqueness per supplier
- Automatic stock increase after purchases
- Purchase cancellation
- Automatic stock decrease after purchase cancellation
- Supplier return inventory movements
- Supplier-product unit cost updates after purchases
- Transactional purchase creation and cancellation
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
- [Suppliers API](./docs/suppliers-api.md)
- [Supplier Products API](./docs/supplier-products-api.md)
- [Purchases API](./docs/purchases-api.md)
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

### Suppliers

```http
/api/suppliers
```

Available endpoints:

```http
GET /api/suppliers
GET /api/suppliers/:id
POST /api/suppliers
PUT /api/suppliers/:id
DELETE /api/suppliers/:id
PATCH /api/suppliers/:id/activate
```

Main features:

- Create suppliers
- List suppliers
- Get supplier by ID
- Update suppliers
- Activate suppliers
- Deactivate suppliers
- Store an optional supplier contact name
- Validate required supplier fields
- Validate supplier email format
- Validate unique supplier email without case sensitivity
- Support multiple suppliers without email
- Soft delete suppliers using `active = false`

### Supplier Products

```http
/api/suppliers/:supplierId/products
```

Available endpoints:

```http
GET /api/suppliers/:supplierId/products
GET /api/suppliers/:supplierId/products/:productId
POST /api/suppliers/:supplierId/products
PUT /api/suppliers/:supplierId/products/:productId
DELETE /api/suppliers/:supplierId/products/:productId
PATCH /api/suppliers/:supplierId/products/:productId/activate
```

Main features:

- Associate multiple products with a supplier
- Associate the same product with multiple suppliers
- Store supplier-specific product codes
- Store the current unit cost for each supplier-product relationship
- Validate unique supplier-product pairs
- Validate supplier product codes without case sensitivity
- Preserve fields that are not included in partial updates
- Remove optional supplier product codes using `null`
- Activate and deactivate supplier-product relationships
- Prevent relationship creation or activation when the supplier or product is inactive
- Allow all authenticated roles to read supplier-product relationships
- Restrict relationship management to `ADMIN` and `SUPERVISOR`

### Purchases

```http
/api/purchases
```

Available endpoints:

```http
GET /api/purchases
GET /api/purchases/:id
POST /api/purchases
PATCH /api/purchases/:id/cancel
```

Main features:

- Create completed supplier purchases
- List purchases
- Get purchases with their details
- Store optional supplier invoice numbers
- Validate invoice uniqueness per supplier without case sensitivity
- Calculate line totals, subtotal, tax, and total on the backend
- Register the authenticated user who created the purchase
- Increase product stock after purchase creation
- Create positive `PURCHASE` inventory movements
- Update the current supplier-product unit cost
- Cancel completed purchases
- Decrease stock safely during purchase cancellation
- Create negative `SUPPLIER_RETURN` inventory movements
- Prevent cancellation when current stock is insufficient
- Preserve cancelled purchases and their details for audit purposes
- Execute creation and cancellation inside database transactions
- Restrict purchase access to `ADMIN` and `SUPERVISOR`

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
- `suppliers`
- `supplier_products`
- `purchases`
- `purchase_details`
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

Suppliers are soft deleted by setting `active = false`.

Supplier email is optional.

Supplier email uniqueness is case-insensitive when provided.

Multiple suppliers can exist without email.

Suppliers and products have a many-to-many relationship through `supplier_products`.

A supplier-product pair can exist only once.

Supplier product codes are optional and unique within each supplier without case sensitivity.

Each supplier-product relationship stores the supplier's current unit cost.

Supplier-product relationships are soft deleted by setting `active = false`.

Inactive supplier-product relationships must be reactivated instead of recreated.

Supplier-product relationships cannot be created or activated when the supplier or product is inactive.

Sales can be created with or without a registered client.

Inactive users cannot log in.

Invalid email and invalid password return the same error message for security reasons.

Users can only access routes allowed for their role.

`ADMIN` has full administrative access.

`SUPERVISOR` can manage products, categories, supplier-product relationships, sales cancellation, and inventory operations.

`EMPLOYEE` can perform operational tasks such as creating sales, registering clients, and reading allowed resources, including supplier-product relationships.

Purchase creation and purchase cancellation are executed using database transactions to keep purchases, details, stock, inventory movements, and supplier costs consistent.

Purchases are created directly with `COMPLETED` status.

Completed purchases are immutable. Incorrect purchases must be cancelled and recreated instead of being edited or deleted.

Purchase invoice numbers are optional and unique per supplier without case sensitivity.

Multiple purchases without an invoice number are allowed.

A purchase can only include active products associated with an active supplier through active supplier-product relationships.

Purchase totals are calculated by the backend using item quantities, unit costs, and tax amounts.

Creating a purchase increases product stock and creates positive `PURCHASE` inventory movements.

Creating a purchase updates the current unit cost stored in the supplier-product relationship.

Cancelling a purchase decreases product stock and creates negative `SUPPLIER_RETURN` inventory movements.

A purchase cannot be cancelled when the current stock is insufficient to reverse all purchased quantities.

Cancelled purchases and their details remain stored for audit purposes.

Purchase endpoints are restricted to users with the `ADMIN` or `SUPERVISOR` role.
