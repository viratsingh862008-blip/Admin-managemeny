# Hotel Bhola Inn — Website + Admin Management

WebTea HQ hospitality website and booking-management prototype for Hotel Bhola Inn, Bettiah.

See docs/BHOLA-INN-RESEARCH.md for the research record and docs/PDF-MENU-FLIPBOOK-SKILL.md for the reusable PDF-to-flipbook implementation pattern.

## Local
npm install
npm run test
npm run typecheck
npm run build
npm run dev

Website: /
Admin: /#admin

## Scope
Public hotel site, room discovery, reservation flow, admin dashboard, room inventory, availability, housekeeping, guest CRM, payments/folio view, reviews, media/CMS, settings, audit log, and PDF menu flipbook.

The current persistence layer is browser-local for prototyping. Commercial deployment should connect the domain layer to a transactional server/database and object storage for menus/media.
