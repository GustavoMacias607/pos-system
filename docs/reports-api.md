# Reports API

This module provides business reports for the POS system.

It currently supports:

- Sales summaries by date range
- Completed and cancelled sales counts
- Total completed sales amount
- Average ticket calculation

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

## Business Rules

- Reports require a valid JWT access token.
- Sales reports are available only to users with the `ADMIN` or `SUPERVISOR` role.
- `from` and `to` are required and must use the exact `YYYY-MM-DD` format.
- Impossible calendar dates are rejected.
- The start date cannot be later than the end date.
- Both boundary dates are included in the report.
- Sales are grouped by their status without changing historical records.
- Cancelled sales are counted but excluded from `total_sold` and `average_ticket`.
- `total_sold` and `average_ticket` use completed sales only.
- Periods without sales return zero values instead of `null`.
- Report queries do not modify sales, inventory, or cash register data.
