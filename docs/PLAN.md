# PLAN: Actionable Enhancements based on Strategic Review Comments

This plan addresses the critical feedback from the core review panels (Skeptic, First Principles, Expander, Outsider, and Executor). We will focus on solving the key "trust & pricing guarantee" problem, ensuring regulatory compliance, and aligning digital flows with real-world sanayi dynamics.

---

## 🔒 Proposed Action Items

### 1. Payment Compliance & Escrow Gateway Integration (BDDK/Fintech)
- **Problem:** Holding user funds in a custom escrow table directly is not compliant with BDDK regulations (which require a licensed payment provider).
- **Solution:** Integrate a compliant Marketplace Split-Payment flow using a licensed provider (e.g., PayTR or iyzico Marketplace API). 
  - Update [PaymentScreen.jsx](file:///c:/Users/Bedirhan/Desktop/Carvis-App/Carvis/src/features/orders/PaymentScreen.jsx) and the checkout backend endpoints to model how funds are captured and held in the **PayTR/iyzico secure escrow pool**, rather than a custom internal DB wallet, releasing them to the partner upon PIN code validation.

### 2. Sourcing Vehicle Data (Automated vs Manual & Privacy)
- **Problem:** Clarifying where sensitive vehicle data (mileage, market value, insurance expiry) comes from, avoiding high manual entry overhead while addressing privacy concerns.
- **Solution:**
  - Add an integration configuration in `DigitalPassport.jsx` explaining the data sourcing.
  - Implement a mock EGM / TRAMER API fetch configuration inside `externalApis.js` which automatically pre-fills vehicle data upon entering the license plate and owner's national ID (TCKN), requiring explicit user consent (GDPR/KVKK compliance).

### 3. Off-Platform Escrow Bypass Mitigation
- **Problem:** Physical services and mechanics prefer immediate cash flow and may try to bypass the escrow.
- **Solution:**
  - **Rapidsy Assurance Warranty (%100 Rapidsy Güvencesi):** Display badges clarifying that the repair warranty (up to ₺50,000) is only active *if* the transaction is completed via the Escrow pool.
  - **Esnaf Kredisi (Partner Loans):** Motivate partners to stay on-platform by showing that their escrow volume qualifies them for low-interest commercial loans (modeled in `PartnerLoanView.jsx`).

---

## 🏁 Verification Plan

### Automated Checks
- Run `npm run test` to verify zero app regressions.
- Run `python .agent/scripts/checklist.py .` to audit quality standards.
