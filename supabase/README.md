# Supabase Migrations

Database migrations for Wunabuy. Files are numbered and applied in order.

## Local Development

```bash
# Start local Supabase
npx supabase start

# Run migrations
npm run migrate:local

# Seed data
npm run seed:local

# Reset (destructive)
npx supabase db reset --local
```

## Migration Files

See `migrations/` directory. Refer to the [Backend Tech Spec](../docs/Wunabuy_Backend_Tech_Spec_v1.0.md) Section 4 for complete schema.

## RLS Policies

Row-Level Security policies are defined in `015_create_rls_policies.sql`.

## Edge Functions

Webhook handlers for payment gateways are in `functions/`.
