# 🛠️ Fix Plan: Systematic Cleanup

## 🚨 Critical Issues
1. **Syntax Error (`PartnerDashboard.jsx`)**: Premature closing of `div` tags caused build failure.
   - Status: likely fixed in previous step, needs verification.
2. **Database Schema Mismatch (`profiles` table)**: Missing `company_name` column causes `QuoteContext` to crash.
   - Status: Fallback code added, but DB needs actual migration.
3. **Linting/Build Errors**: `npm run lint` failing indicates potential unused variables or malformed JSX in new features.

## 📋 Implementation Steps
### 1. Verification (Frontend Specialist)
- [ ] Verify `src/features/partners/PartnerDashboard.jsx` structure.
- [ ] Verify `src/features/orders/OrdersScreen.jsx` and `OrderDetailsModal.jsx` integration.

### 2. Database Repair (Database Architect)
- [ ] Execute SQL to add `company_name` to `profiles` table.
- [ ] Verify `profiles` table schema.

### 3. Cleanup (Test Engineer)
- [ ] Run `npm run lint` and fix reported issues.
- [ ] Verify application build `npm run build`.

## ✅ Acceptance Criteria
- App compiles without "Expected ... but found ..." errors.
- `QuoteContext` loads without console errors.
- Partner Dashboard renders all sections correctly.
