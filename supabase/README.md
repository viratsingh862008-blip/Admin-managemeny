# Hotel Bhola Inn backend

This folder contains the production Postgres/RLS contract for Hotel Bhola Inn.

Do not point this schema at an unrelated business project. Create/select a dedicated Supabase project for this hotel before applying it.

Required production services:
- Supabase Postgres + Auth + Storage
- Private menu/gallery bucket with staff-only writes
- Published assets exposed through signed/public URLs as appropriate
- Authenticated staff profiles and role checks
- Database-enforced reservation overlap prevention
- Server-side reservation creation for final production checkout
- Payment gateway webhook verification
- Email/WhatsApp notification worker

Environment:
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

Never place a secret/service-role key in VITE_* client variables.
