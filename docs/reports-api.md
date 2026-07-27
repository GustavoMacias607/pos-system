# Reports API

This module provides business reports for the POS system.

It currently supports:

- Sales summaries by date range
- Sales grouped by payment method
- Daily sales reports
- Top-selling products
- Low-stock product alerts
- Purchases grouped by supplier
- Completed and cancelled operation counts
- Totals and average calculations

---

## Get Sales Summary

Returns a sales summary for the specified date range.

```http
GET /api/reports/sales-summary?from=2026-07-01&to=2026-07-31
```

### Access

This endpoint requires authentication and is restricted to:

```text
ADMIN
SUPERVISOR
```

Users with the `EMPLOYEE` role cannot access this report.

### Query parameters

- `from`: Required start date in `YYYY-MM-DD` format.
- `to`: Required end date in `YYYY-MM-DD` format.
- Both dates are inclusive.
- `from` cannot be later than `to`.
- Both values must represent real calendar dates.

### Calculations

- `completed_sales_count`: Number of sales with `COMPLETED` status created during the requested period.
- `cancelled_sales_count`: Number of sales with `CANCELLED` status created during the requested period.
- `total_sold`: Sum of `total` from completed sales only.
- `average_ticket`: Average `total` from completed sales only.

Monetary values are returned as strings with two decimal places to preserve numeric precision.

### Success response

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-07-01",
      "to": "2026-07-31"
    },
    "completed_sales_count": 11,
    "cancelled_sales_count": 11,
    "total_sold": "201000.00",
    "average_ticket": "18272.73"
  }
}
```

### Period without sales

When the requested period contains no sales, the endpoint returns zero values instead of `null`.

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2030-01-01",
      "to": "2030-01-31"
    },
    "completed_sales_count": 0,
    "cancelled_sales_count": 0,
    "total_sold": "0.00",
    "average_ticket": "0.00"
  }
}
```

### Validation errors

#### Missing start date

```http
GET /api/reports/sales-summary?to=2026-07-31
```

```json
{
  "success": false,
  "message": "From date is required"
}
```

#### Missing end date

```http
GET /api/reports/sales-summary?from=2026-07-01
```

```json
{
  "success": false,
  "message": "To date is required"
}
```

#### Invalid date format

```http
GET /api/reports/sales-summary?from=07-01-2026&to=2026-07-31
```

```json
{
  "success": false,
  "message": "From date must use YYYY-MM-DD format"
}
```

#### Invalid calendar date

```http
GET /api/reports/sales-summary?from=2026-02-30&to=2026-07-31
```

```json
{
  "success": false,
  "message": "From date is invalid"
}
```

#### Invalid date range

```http
GET /api/reports/sales-summary?from=2026-07-31&to=2026-07-01
```

```json
{
  "success": false,
  "message": "From date cannot be after to date"
}
```

Validation errors return HTTP status `400`.

### Authorization errors

- Requests without a valid access token return HTTP status `401`.
- Requests made by users with the `EMPLOYEE` role return HTTP status `403`.

---

## Get Sales by Payment Method

Returns sales totals grouped by payment method for the specified date range.

```http
GET /api/reports/sales-by-payment-method?from=2026-07-01&to=2026-07-31
```

### Access

Requires authentication and the `ADMIN` or `SUPERVISOR` role.

### Query parameters

- `from`: Required start date in `YYYY-MM-DD` format.
- `to`: Required end date in `YYYY-MM-DD` format.
- Both dates are inclusive.

### Success response

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-07-01",
      "to": "2026-07-31"
    },
    "paymentMethods": [
      {
        "payment_method": "CASH",
        "completed_sales": 5,
        "cancelled_sales": 1,
        "total_sold": "1250.00",
        "average_ticket": "250.00"
      },
      {
        "payment_method": "CARD",
        "completed_sales": 3,
        "cancelled_sales": 0,
        "total_sold": "900.00",
        "average_ticket": "300.00"
      },
      {
        "payment_method": "TRANSFER",
        "completed_sales": 0,
        "cancelled_sales": 0,
        "total_sold": "0.00",
        "average_ticket": "0.00"
      }
    ]
  }
}
```

The response always includes `CASH`, `CARD`, and `TRANSFER`, even when a payment method has no sales during the requested period.

Cancelled sales are counted but excluded from `total_sold` and `average_ticket`.

---

## Get Sales by Day

Returns one sales summary for every day in the specified date range.

```http
GET /api/reports/sales-by-day?from=2026-07-01&to=2026-07-03
```

### Access

Requires authentication and the `ADMIN` or `SUPERVISOR` role.

### Query parameters

- `from`: Required start date in `YYYY-MM-DD` format.
- `to`: Required end date in `YYYY-MM-DD` format.
- Both dates are inclusive.

### Success response

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-07-01",
      "to": "2026-07-03"
    },
    "days": [
      {
        "date": "2026-07-01",
        "completed_sales": 2,
        "cancelled_sales": 1,
        "total_sold": "500.00",
        "average_ticket": "250.00"
      },
      {
        "date": "2026-07-02",
        "completed_sales": 0,
        "cancelled_sales": 0,
        "total_sold": "0.00",
        "average_ticket": "0.00"
      },
      {
        "date": "2026-07-03",
        "completed_sales": 1,
        "cancelled_sales": 0,
        "total_sold": "300.00",
        "average_ticket": "300.00"
      }
    ]
  }
}
```

Every date in the period is included. Days without sales return zero values instead of being omitted.

---

## Get Top-Selling Products

Returns the products with the highest number of units sold during the specified period.

```http
GET /api/reports/top-selling-products?from=2026-07-01&to=2026-07-31&limit=10
```

### Access

Requires authentication and the `ADMIN` or `SUPERVISOR` role.

### Query parameters

- `from`: Required start date in `YYYY-MM-DD` format.
- `to`: Required end date in `YYYY-MM-DD` format.
- `limit`: Optional maximum number of products. Defaults to `10`.
- `limit` must be an integer between `1` and `100`.

### Success response

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-07-01",
      "to": "2026-07-31"
    },
    "limit": 10,
    "products": [
      {
        "product_id": "3",
        "product_name": "Keyboard",
        "completed_sales": 4,
        "units_sold": 11,
        "total_sold": "5500.00"
      }
    ]
  }
}
```

### Calculations

- `completed_sales`: Number of distinct completed sales containing the product.
- `units_sold`: Total units sold across completed sales.
- `total_sold`: Sum of the product line totals from completed sales.

Products are ordered by:

1. Units sold, from highest to lowest.
2. Total sold, from highest to lowest.
3. Product ID, from lowest to highest.

### Limit validation errors

A non-integer limit returns HTTP status `400`:

```json
{
  "success": false,
  "message": "Limit must be an integer"
}
```

A limit of `0` returns:

```json
{
  "success": false,
  "message": "Limit must be greater than 0"
}
```

A limit greater than `100` returns:

```json
{
  "success": false,
  "message": "Limit cannot be greater than 100"
}
```

---

## Get Low-Stock Products

Returns active products whose current stock is equal to or lower than their configured minimum stock.

```http
GET /api/reports/low-stock-products
```

### Access

Requires authentication and the `ADMIN` or `SUPERVISOR` role.

This endpoint does not receive date parameters because it reports the current inventory state.

### Success response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": "5",
        "product_name": "Laptop",
        "stock": 2,
        "minimum_stock": 7,
        "units_needed": 5
      }
    ]
  }
}
```

### Calculations

- `stock`: Current product stock.
- `minimum_stock`: Configured minimum stock.
- `units_needed`: Units required to reach the minimum stock.

A product whose stock is exactly equal to its minimum is included. In that case, `units_needed` is `0`.

Inactive products are excluded.

---

## Get Purchases by Supplier

Returns purchases grouped by supplier for the specified date range.

```http
GET /api/reports/purchases-by-supplier?from=2026-07-01&to=2026-07-31
```

### Access

Requires authentication and the `ADMIN` or `SUPERVISOR` role.

### Query parameters

- `from`: Required start date in `YYYY-MM-DD` format.
- `to`: Required end date in `YYYY-MM-DD` format.
- Both dates are inclusive.

### Success response

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-07-01",
      "to": "2026-07-31"
    },
    "suppliers": [
      {
        "supplier_id": "1",
        "supplier_name": "Technology Supplier",
        "completed_purchases": 1,
        "cancelled_purchases": 1,
        "total_purchased": "156.00",
        "average_purchase": "156.00"
      }
    ]
  }
}
```

### Calculations

- `completed_purchases`: Number of completed purchases from the supplier.
- `cancelled_purchases`: Number of cancelled purchases from the supplier.
- `total_purchased`: Sum of completed purchase totals.
- `average_purchase`: Average total of completed purchases.

Cancelled purchases are counted but excluded from `total_purchased` and `average_purchase`.

Only suppliers with purchases during the requested period are included.

---

## Shared Validation and Authorization

The reports that receive `from` and `to` use the same date-range validation:

- Both parameters are required.
- Both parameters must be strings using the exact `YYYY-MM-DD` format.
- Both values must represent real calendar dates.
- `from` cannot be later than `to`.
- Validation errors return HTTP status `400`.

All report endpoints require a valid JWT access token:

- Requests without a valid access token return HTTP status `401`.
- Requests made by users with the `EMPLOYEE` role return HTTP status `403`.

---

## Business Rules

- Reports require a valid JWT access token.
- Reports are available only to users with the `ADMIN` or `SUPERVISOR` role.
- `from` and `to` are required for date-range reports and must use the exact `YYYY-MM-DD` format.
- Impossible calendar dates are rejected.
- The start date cannot be later than the end date.
- Both boundary dates are included in date-range reports.
- Sales are grouped by their status without changing historical records.
- Cancelled sales are counted but excluded from sales totals and averages.
- Sales totals and average tickets use completed sales only.
- Periods without sales return zero values instead of `null`.
- Payment method reports always include `CASH`, `CARD`, and `TRANSFER`.
- Daily reports include dates without sales.
- Top-selling products use completed sales only.
- The top-selling-products limit defaults to `10` and cannot exceed `100`.
- Low-stock reports include active products whose stock is equal to or lower than their minimum stock.
- Purchase totals and averages use completed purchases only.
- Report monetary values are returned as strings to preserve decimal precision.
- Report queries do not modify sales, purchases, inventory, or cash register data.
- Date ranges are interpreted using the `America/Mexico_City` business time zone.
