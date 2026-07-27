# POS System

REST API for a Point of Sale system built with Node.js, Express, PostgreSQL, and Docker.

The system manages products, inventory, suppliers, purchases, sales, clients, cash registers, authentication, role-based authorization, two-factor authentication, and business reports.

It is designed as a professional learning and portfolio project, applying layered architecture, database transactions, business rules, security practices, and real-world API design.

## Current Features

### Catalog Management

- Product and category management
- Client and supplier management
- Supplier-product relationships
- Optional client and supplier emails
- Case-insensitive email uniqueness validation
- Activation and deactivation through soft deletion
- Supplier-specific product codes and unit costs

### Inventory and Purchases

- Transactional purchase creation and cancellation
- Purchase detail and optional supplier invoice registration
- Automatic stock updates after purchases and cancellations
- Inventory movement history and filters
- Manual adjustments, stock entries, waste, and supplier returns
- Low-stock detection
- Negative-stock prevention
- Supplier-product unit cost updates after purchases

### Sales and Cash Management

- Transactional sale creation and cancellation
- Sale detail registration
- Optional client association and anonymous sales
- Sales history filtering by client
- Automatic stock decrease and restoration
- Cash register and session management
- Manual cash entries and withdrawals
- Cash movement history
- Expected cash and closing difference calculation

### Authentication and Security

- Password hashing with bcrypt
- Login with email and password
- JWT access and refresh tokens
- Refresh token session revocation
- Protected routes and role-based authorization
- TOTP two-factor authentication
- QR code generation for authenticator apps
- Single-use backup codes
- Google Login and account linking

### Reports

- Sales summary by date range
- Sales grouped by payment method
- Daily sales reporting
- Top-selling product reporting
- Low-stock product reporting
- Purchases grouped by supplier
- Completed and cancelled operation counts
- Totals and average calculations

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

## Architecture

The backend follows a layered architecture:

- `backend/src/controllers`: HTTP request and response handling
- `backend/src/services`: business rules and transaction orchestration
- `backend/src/repositories`: database access and SQL queries
- `backend/src/middlewares`: authentication, authorization, validation, and error handling
- `backend/src/validators`: reusable input validation
- `backend/src/constants`: shared constants
- `backend/src/errors`: custom application errors
- `backend/src/utils`: shared utilities
- `backend/migrations`: versioned database migrations
- `docs`: detailed API documentation

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
- [Cash Registers API](./docs/cash-registers-api.md)
- [Reports API](./docs/reports-api.md)
- [Auth API](./docs/auth-api.md)

## Available API Modules

All protected endpoints require a valid JWT access token:

```http
Authorization: Bearer <accessToken>
```

### Products

Base route:

```http
/api/products
```

Main features:

- Create, list, retrieve, and update products
- Activate and deactivate products
- Assign products to categories
- Validate stock and detect low-stock products

### Categories

Base route:

```http
/api/categories
```

Main features:

- Create, list, retrieve, and update categories
- Activate and deactivate categories

### Users

```http
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/activate
```

Main features:

- User CRUD with activation and deactivation
- Email format and uniqueness validation
- Password hashing
- Role validation
- Password and password-hash exclusion from API responses

Valid roles:

- `ADMIN`
- `EMPLOYEE`
- `SUPERVISOR`

### Clients

```http
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
PATCH  /api/clients/:id/activate
```

Main features:

- Client CRUD with activation and deactivation
- Optional email with case-insensitive uniqueness
- Association of active clients with new sales
- Preservation of sales history after client deactivation

### Suppliers

```http
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
PATCH  /api/suppliers/:id/activate
```

Main features:

- Supplier CRUD with activation and deactivation
- Optional contact information
- Optional email with case-insensitive uniqueness

### Supplier Products

```http
GET    /api/suppliers/:supplierId/products
GET    /api/suppliers/:supplierId/products/:productId
POST   /api/suppliers/:supplierId/products
PUT    /api/suppliers/:supplierId/products/:productId
DELETE /api/suppliers/:supplierId/products/:productId
PATCH  /api/suppliers/:supplierId/products/:productId/activate
```

Main features:

- Many-to-many supplier-product relationships
- Supplier-specific product codes and unit costs
- Activation and deactivation
- Validation of active suppliers and products
- Read access for all authenticated roles
- Management restricted to `ADMIN` and `SUPERVISOR`

### Purchases

```http
GET   /api/purchases
GET   /api/purchases/:id
POST  /api/purchases
PATCH /api/purchases/:id/cancel
```

Main features:

- Completed purchase creation with purchase details
- Optional supplier invoice numbers
- Backend calculation of subtotal, tax, and total
- Automatic stock increase and `PURCHASE` inventory movements
- Supplier-product unit cost updates
- Purchase cancellation with stock reversal
- Negative `SUPPLIER_RETURN` inventory movements
- Transactional creation and cancellation
- Access restricted to `ADMIN` and `SUPERVISOR`

### Cash Registers

```http
GET    /api/cash-registers
GET    /api/cash-registers/:id
POST   /api/cash-registers
PUT    /api/cash-registers/:id
DELETE /api/cash-registers/:id
PATCH  /api/cash-registers/:id/activate

GET   /api/cash-register-sessions
GET   /api/cash-register-sessions/current
GET   /api/cash-register-sessions/:id
POST  /api/cash-register-sessions/open
PATCH /api/cash-register-sessions/:id/close
GET   /api/cash-register-sessions/:sessionId/movements

POST /api/cash-movements
```

Main features:

- Cash register activation and deactivation
- Cash register session opening and closing
- One open session per register and user
- Manual `CASH_IN` and `CASH_OUT` movements
- Employee ownership restrictions
- Expected cash and closing difference calculation
- Transactional cash movements with concurrent-closing protection

### Authentication

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

- Email and password authentication
- JWT access and refresh tokens
- Refresh token sessions and revocation
- Role-based access control
- TOTP two-factor authentication
- Backup code recovery
- Google ID token verification and account linking

Authentication flows:

```text
Email/password
→ accessToken + refreshToken
```

```text
Email/password with 2FA enabled
→ requiresTwoFactor = true
→ verify TOTP token or backup code
→ accessToken + refreshToken
```

```text
Google ID token
→ backend token verification
→ existing POS user account linking
→ accessToken + refreshToken
```

### Sales

Base route:

```http
/api/sales
```

Main features:

- Create and list sales
- Retrieve a sale by ID
- Register sale details
- Create sales with or without a registered client
- Filter sale history by client
- Decrease stock and register inventory movements
- Cancel sales and restore stock
- Transactional creation and cancellation

### Inventory

```http
GET  /api/inventory/movements
GET  /api/inventory/movements?type=WASTE
GET  /api/inventory/movements?productId=1
GET  /api/inventory/movements?type=PURCHASE&productId=1
GET  /api/inventory/low-stock
POST /api/inventory/adjustment
POST /api/inventory/stock-entry
POST /api/inventory/waste
```

Main features:

- Inventory movement history
- Movement filters by type and product
- Low-stock detection
- Positive and negative stock adjustments
- Stock entries and waste movements
- Negative-stock prevention
- Transactional stock updates and movement creation

### Reports

```http
GET /api/reports/sales-summary?from=2026-07-01&to=2026-07-31
GET /api/reports/sales-by-payment-method?from=2026-07-01&to=2026-07-31
GET /api/reports/sales-by-day?from=2026-07-01&to=2026-07-31
GET /api/reports/top-selling-products?from=2026-07-01&to=2026-07-31&limit=10
GET /api/reports/low-stock-products
GET /api/reports/purchases-by-supplier?from=2026-07-01&to=2026-07-31
```

Main features:

- Inclusive date-range reporting
- Sales summary totals and average ticket
- Sales grouped by payment method
- Daily sales results, including dates without sales
- Top-selling products with a configurable limit
- Current low-stock products
- Purchases grouped by supplier
- Completed and cancelled operation counts
- Access restricted to `ADMIN` and `SUPERVISOR`

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

- `.env` contains local values and must not be committed.
- `.env.example` contains placeholder values and should be committed.
- `JWT_SECRET` must remain private.
- `DB_HOST` must match the PostgreSQL service name in `docker-compose.yml`.
- `GOOGLE_CLIENT_ID` is used to validate Google ID tokens.
- A Google Client Secret is not required by the current Google Login flow.

## Run the Project

Start the services:

```bash
docker compose up -d
```

Rebuild and recreate the backend container:

```bash
docker compose up -d --build --force-recreate backend
```

Run database migrations:

```bash
docker exec -it pos-backend npm run migrate
```

Check backend logs:

```bash
docker logs -f pos-backend
```

Access PostgreSQL:

```bash
docker exec -it pos-postgres psql -U pos_user -d pos_db
```

## Database

PostgreSQL runs in Docker and stores the application data.

Main tables:

- `products`
- `categories`
- `users`
- `clients`
- `suppliers`
- `supplier_products`
- `purchases`
- `purchase_details`
- `cash_registers`
- `cash_register_sessions`
- `cash_movements`
- `user_sessions`
- `user_backup_codes`
- `user_identities`
- `sales`
- `sale_details`
- `inventory_movements`
- `schema_migrations`

## Key Business Rules

### Security and Access

- Passwords and backup codes are stored as hashes and are never returned by the API.
- Inactive users cannot log in.
- Invalid email and password attempts return the same message.
- Refresh tokens are stored as hashes and can be revoked during logout.
- Routes are protected according to the authenticated user's role.
- `ADMIN` has full administrative access.
- `SUPERVISOR` can manage operational and supervisory modules.
- `EMPLOYEE` can perform permitted operational tasks and read allowed resources.

### Catalogs and Relationships

- Users, clients, suppliers, products, categories, and supplier-product relationships support soft deletion where applicable.
- Optional client and supplier emails are unique without case sensitivity when provided.
- A supplier-product pair can exist only once.
- Supplier product codes are optional and unique within each supplier without case sensitivity.
- Inactive supplier-product relationships must be reactivated instead of recreated.
- Supplier-product relationships cannot be created or activated when the supplier or product is inactive.

### Sales and Inventory

- Sales can be created with or without a registered client.
- Only active clients can be associated with new sales.
- Anonymous sales store `client_id = NULL`.
- Deactivating a client does not remove previous sales.
- Sale creation and cancellation run inside database transactions.
- Inventory operations cannot leave product stock below zero.
- A product is considered low stock when `stock <= minimum_stock`.
- Inventory adjustments, entries, waste, and purchase movements preserve movement history.

### Purchases

- Purchases are created directly with `COMPLETED` status.
- Completed purchases are immutable and must be cancelled rather than edited or deleted.
- Invoice numbers are optional and unique per supplier without case sensitivity.
- Purchase totals are calculated by the backend.
- Creating a purchase increases stock and updates supplier-product unit costs.
- Cancelling a purchase decreases stock and creates supplier-return movements.
- A purchase cannot be cancelled when stock is insufficient to reverse its quantities.
- Cancelled purchases and their details remain stored for audit purposes.
- A purchase can include only active products associated with the active supplier through active supplier-product relationships.
- Purchase endpoints are restricted to `ADMIN` and `SUPERVISOR`.

### Cash Registers

- Only active cash registers can open new sessions.
- A cash register and a user can each have only one open session at a time.
- Employees can create movements in and close only their own open sessions.
- Manual movement creation accepts only `CASH_IN` and `CASH_OUT`.
- Cash movements run inside database transactions and lock the session against concurrent closing.
- Expected cash is calculated from the opening amount plus entries and applicable inflows, minus withdrawals and applicable outflows.
- Closing difference equals the declared closing amount minus the expected amount.
- Cash registers are soft deleted by setting `active = false`.
- `SALE` and `REFUND` movements are reserved for automatic system operations.

### Reports

- Report endpoints are available only to `ADMIN` and `SUPERVISOR`.
- Date-based reports require valid `from` and `to` values in `YYYY-MM-DD` format.
- Date ranges include both boundary dates.
- Completed and cancelled operations are counted separately.
- Cancelled operations are excluded from totals and averages.
- Payment method reports always include `CASH`, `CARD`, and `TRANSFER`.
- Daily reports include dates without sales.
- Top-selling products use completed sales only.
- The top-selling-products limit defaults to `10` and cannot exceed `100`.
- Low-stock reports include active products whose stock is equal to or below the configured minimum.
- Report monetary values are returned as strings to preserve decimal precision.
- Report queries do not modify sales, inventory, purchases, or cash register data.
