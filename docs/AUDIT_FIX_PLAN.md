# [PLAN] Dashboard & Schema Stabilization (Audit Phase)

## 🔴 User Review Required

> [!IMPORTANT]
> **PartnerDashboard.jsx is CRITICALLY BROKEN**: The file is missing core React imports (`useEffect`) and contains invalid JSX syntax that will cause 500 errors. 
> 
> **Database Schema is MISSING**: `full_schema.sql` is currently empty. We must restore the master schema to verify API consistency.

## Proposed Changes

---

### 🛠️ Phase 1: Dashboard Emergency Fixes
Fixing the runtime-breaking errors to restore dashboard accessibility.

#### [MODIFY] [PartnerDashboard.jsx](file:///c:/Users/Bedirhan/Desktop/Rapidsy-App/Rapidsy/src/features/partners/PartnerDashboard.jsx)
- [x] Detected: Missing `useEffect` to React imports.
- [x] Detected: Invalid JSX Component naming: `<currentTheme.icon />`.
- [ ] Convert `lucide-react` imports to Namespace (`import * as Icons`).
- [ ] Fix logic: Ensure `stats` mapping doesn't crash on null `currentTheme`.

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/Bedirhan/Desktop/Rapidsy-App/Rapidsy/src/features/admin/AdminDashboard.jsx)
- [ ] Perform a similar audit for missing hooks or invalid JSX components.
- [ ] Sync theme logic with the global design system.

---

### 🗄️ Phase 2: Schema Restoration & Verification
Ensuring the "Source of Truth" for the database is restored and consistent.

#### [NEW] [full_schema.sql](file:///c:/Users/Bedirhan/Desktop/Rapidsy-App/Rapidsy/supabase/full_schema.sql)
- [ ] Populate the schema with the latest master definition (Orders, Products, Profiles, etc.).
- [ ] Verify `seller_id` and `total_amount` columns in the `orders` table.

#### [MODIFY] [supabaseApi.js](file:///c:/Users/Bedirhan/Desktop/Rapidsy-App/Rapidsy/src/utils/supabaseApi.js)
- [ ] Audit query helpers against the restored schema.

---

### 📱 Phase 3: PWA & Mobile Polish
#### [MODIFY] [assetlinks.json](file:///c:/Users/Bedirhan/Desktop/Rapidsy-App/Rapidsy/public/.well-known/assetlinks.json)
- [ ] Replace `YOUR_SHA256_FINGERPRINT_HERE` placeholders with dummy production values (or keep for user input).

---

## Verification Plan

### Automated Tests
- Run `npm run build` after Phase 1 and Phase 2.
- Execute `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`

### Manual Verification
- Verify Partner Dashboard landing for 'parking', 'mechanic', and 'valet' roles via query params.
