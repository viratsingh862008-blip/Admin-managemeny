# PDF Menu to Flipbook Skill

Allow a hotel admin to upload one approved menu PDF and publish it as an interactive page-by-page menu.

Architecture:
Admin upload -> MIME/file validation -> asset metadata -> persistent storage -> PDF.js renderer -> page state -> flipbook UI -> public menu.

Required:
- PDF-only upload.
- File metadata and publishing state.
- PDF.js rendering.
- Previous/next page controls.
- Mobile and desktop presentation.
- Fullscreen.
- Source PDF download.
- No invented menu data.

Production storage should use Supabase Storage/S3 (or equivalent) and a database record with asset ID, property ID, URL, size, checksum, version, published state and uploader.

QA:
single-page PDF, multi-page PDF, invalid file, large file, slow network, mobile, desktop, replace/unpublish, first/last page controls, download, stale-version protection.

Security:
validate type, enforce file-size limits, safe storage keys, safe response headers.