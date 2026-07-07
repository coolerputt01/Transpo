# Transpo

Escrow logistics MVP scaffold built with Next.js and Supabase placeholders.

## Pages

- `/` - landing page with signup and login CTAs
- `/auth` - central signup/login page with buyer, seller, driver, and storekeeper roles
- `/dashboard` - role-based dashboard using the selected auth role
- `/transactions` - transaction records and escrow/payment statuses
- `/wallet/fund` - wallet funding page for buyers and sellers
- `/deliveries` - delivery tracking for buyers, sellers, drivers, and storekeepers
- `/search/seller` - buyer seller lookup by email ID
- `/search/partners` - seller driver/storekeeper lookup by email ID
- `/escrow/confirm-delivery` - buyer delivery confirmation and escrow release placeholder
- `/withdraw` - withdrawal request page for all roles
- `/profile` - profile details with email ID, phone number, role, and pending KYC/Keys status

## Integration Points

- Supabase client: `lib/supabase.ts`
- Payment gateway placeholders: `lib/payments.ts`
- Mock users, transactions, and deliveries: `lib/mock-data.ts`
- Starter database schema: `supabase/schema.sql`

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then replace the placeholder keys in `.env.local` with your Supabase and payment gateway values.

## Notes

The current UI uses browser `localStorage` as a demo session so every role can be previewed before Supabase auth is connected. KYC/Keys verification is intentionally shown as pending everywhere until a real verification provider is added.
