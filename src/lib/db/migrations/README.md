# AI Event Planner Database Migrations

This directory contains SQL migration files for the AI Event Planner feature.

## Overview

The AI Event Planner requires several database tables and modifications to existing tables to support:

- Anonymous event planning requests with session management
- AI-generated event plan storage
- Vendor categorization for event planning
- Geospatial queries for location-based vendor recommendations

## Migration Files

### 001_create_ai_event_planner_tables.sql

This migration creates the core tables and indexes needed for the AI Event Planner:

**Tables Created:**

1. `event_plan_requests` - Stores event planning requests
2. `event_plan_results` - Stores AI-generated analysis and plans
3. `vendor_categories` - Defines vendor categories

**Tables Modified:**

1. `vendors` - Adds event planning fields (event_types, pricing, location, availability)

**Features:**

- PostGIS extension for geospatial queries
- JSONB columns for flexible data storage
- Automatic timestamp updates
- Session expiration management
- Comprehensive indexing for performance

## Running Migrations

### Prerequisites

- PostgreSQL 12+ with PostGIS extension
- Database user with CREATE TABLE and CREATE EXTENSION privileges

### Using psql

```bash
psql -U your_username -d your_database -f 001_create_ai_event_planner_tables.sql
```

### Using Node.js Migration Tool

If you're using a migration tool like `node-pg-migrate` or `knex`:

```javascript
// Example with node-pg-migrate
exports.up = (pgm) => {
  const sql = fs.readFileSync(
    path.join(__dirname, "001_create_ai_event_planner_tables.sql"),
    "utf8"
  );
  pgm.sql(sql);
};
```

### Using Prisma

If you're using Prisma, you can execute raw SQL:

```typescript
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runMigration() {
  const sql = fs.readFileSync(
    path.join(__dirname, "001_create_ai_event_planner_tables.sql"),
    "utf8"
  );

  await prisma.$executeRawUnsafe(sql);
}
```

## Post-Migration Tasks

After running the migration:

1. **Verify Tables Created:**

   ```sql
   \dt event_plan_*
   \dt vendor_categories
   ```

2. **Verify Indexes:**

   ```sql
   \di event_plan_*
   \di idx_vendors_*
   ```

3. **Verify PostGIS Extension:**

   ```sql
   SELECT PostGIS_version();
   ```

4. **Verify Vendor Categories Seeded:**
   ```sql
   SELECT COUNT(*) FROM vendor_categories;
   -- Should return 19 categories
   ```

## Rollback

To rollback this migration:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS event_plan_results CASCADE;
DROP TABLE IF EXISTS event_plan_requests CASCADE;
DROP TABLE IF EXISTS vendor_categories CASCADE;

-- Remove columns from vendors table
ALTER TABLE vendors
  DROP COLUMN IF EXISTS event_types,
  DROP COLUMN IF EXISTS average_price,
  DROP COLUMN IF EXISTS price_range_min,
  DROP COLUMN IF EXISTS price_range_max,
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  DROP COLUMN IF EXISTS availability_status;

-- Drop indexes
DROP INDEX IF EXISTS idx_vendors_location_gist;
DROP INDEX IF EXISTS idx_vendors_event_types;
DROP INDEX IF EXISTS idx_vendors_availability;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS delete_expired_event_plans();
```

## Maintenance

### Cleaning Up Expired Sessions

The migration includes a function to delete expired sessions. Set up a cron job to run it daily:

```sql
-- Run this daily via cron or pg_cron
SELECT delete_expired_event_plans();
```

### Using pg_cron (if available)

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'delete-expired-event-plans',
  '0 2 * * *',
  'SELECT delete_expired_event_plans();'
);
```

## Performance Considerations

1. **Geospatial Queries:** The PostGIS indexes enable efficient location-based vendor searches within a radius.

2. **JSONB Indexing:** Consider adding GIN indexes on JSONB columns if you need to query specific fields:

   ```sql
   CREATE INDEX idx_event_plan_requests_guest_class
   ON event_plan_requests USING GIN (guest_class_data);
   ```

3. **Partitioning:** For high-volume deployments, consider partitioning `event_plan_requests` by created_at:
   ```sql
   -- Example: Partition by month
   CREATE TABLE event_plan_requests_2025_01
   PARTITION OF event_plan_requests
   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
   ```

## Monitoring

Monitor these metrics:

1. **Session Expiration Rate:**

   ```sql
   SELECT
     COUNT(*) FILTER (WHERE status = 'expired') as expired,
     COUNT(*) FILTER (WHERE status = 'completed') as completed,
     COUNT(*) FILTER (WHERE status = 'processing') as processing
   FROM event_plan_requests
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

2. **Average Processing Time:**

   ```sql
   SELECT
     AVG(processing_time_ms) as avg_ms,
     MAX(processing_time_ms) as max_ms,
     MIN(processing_time_ms) as min_ms
   FROM event_plan_results
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

3. **Vendor Coverage by Location:**
   ```sql
   SELECT
     location_city,
     location_state,
     COUNT(*) as request_count
   FROM event_plan_requests
   WHERE created_at > NOW() - INTERVAL '30 days'
   GROUP BY location_city, location_state
   ORDER BY request_count DESC
   LIMIT 20;
   ```

## Support

For issues or questions about these migrations, please contact the backend team or refer to the design document at `.kiro/specs/ai-event-planner/design-backend.md`.
