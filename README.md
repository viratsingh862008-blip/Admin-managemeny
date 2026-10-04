# Sports Arena Booking

Clean rebuild of the repository for a professional turf, pool and ground booking platform.

## Public website

- Live facilities from Supabase
- Date + facility availability
- Slot-level prices
- Public booking flow
- Automatic availability refresh
- Admin-controlled settings reflected on the public site

## Admin

Route: #admin

Username: Aryan
Password: Aryan

The login uses Supabase Auth. Change the bootstrap password after launch.

Admin controls:
- facilities: add/edit/activate/pause/delete
- recurring weekly slot schedules
- per-slot start/end times
- per-slot pricing
- date-specific closures
- date-specific special slots
- date-specific price overrides
- booking workflow
- public business settings

## Data model

facility_settings = public branding and settings
facilities = turf/pool/ground inventory
slot_templates = recurring weekly schedule and prices
date_overrides = one-off closures and special slots
bookings = reservations
audit_logs = administrator activity trail

Public users cannot insert directly into bookings. Public booking uses the validated create_public_booking RPC.

## Versions

Pinned package versions were checked against current package registries on 2026-10-05: React 19.3.0, Vite 8.3.2, TypeScript 7.0.2, Supabase JS 2.117.2, Lucide React 1.52.0 and @vitejs/plugin-react 6.1.1.