# VehicleRegistration.ai

Verify that a vehicle registration document is legitimate and belongs to the person presenting it.

## Checks

1. **Document authenticity** – layout/metadata heuristics (extensible to template comparison)
2. **Vehicle data validation** – VIN format/checksum, registration expiry
3. **Owner identity match** – fuzzy name matching between registration and ID document

## Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes (Node.js)
- **Database & storage:** Supabase (PostgreSQL + optional Storage)
- **OCR:** Tesseract.js (swap for Google Vision or AWS Textract for production)
- **Matching:** string-similarity for owner name comparison

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - Run the migration: Supabase Dashboard → SQL Editor → run `supabase/migrations/001_verification_schema.sql`.
   - Copy the project URL and anon key into `.env.local` (see `.env.local.example`).

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), upload a registration document and an ID document, then click **Verify registration**.

## API

**POST** `/api/verify-registration`

- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `registration_document` (file, required) – vehicle registration image or PDF
  - `id_document` (file, required) – driver licence or passport image/PDF
  - `selfie` (file, optional) – face image

**Response (200):**

```json
{
  "status": "verified",
  "score": 91,
  "owner_match": true,
  "document_authentic": true,
  "vehicle_valid": true,
  "registration_data": { "rego": "ABC123", "vin": "...", "owner": "...", "expiry": "...", "state": "NSW" },
  "identity_data": { "name": "...", "dob": "...", "licence_number": "..." },
  "fraud_signals": [],
  "message": "Document and identity verified."
}
```

`status` is one of: `verified`, `suspicious`, `failed`.

## Project layout

- `src/app/` – Next.js App Router (page, layout, API route)
- `src/lib/ocr/` – Registration & identity OCR (Tesseract + regex parsing)
- `src/lib/authenticity/` – Document authenticity heuristics
- `src/lib/matching/` – Owner name fuzzy matching
- `src/lib/vehicle/` – VIN validation and expiry check
- `src/types/verification.ts` – Shared types
- `supabase/migrations/` – PostgreSQL schema for verifications

## Optional integrations

- **Google Vision / AWS Textract:** Replace or augment Tesseract in `src/lib/ocr/index.ts` for higher accuracy.
- **PPSR (ppsr.gov.au):** Add a vehicle validation step that checks VIN against PPSR for stolen/written-off flags.
- **Supabase Storage:** Upload `registration_document`, `id_document`, and `selfie` to Storage and store paths in `verification_documents` for audit.
