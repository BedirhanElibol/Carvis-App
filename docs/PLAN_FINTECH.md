# 💸 FinTech & Payment Implementation Plan

**Objective**: Turn Carvis into a revenue-generating platform by enabling real payments, user wallets, and commission automation.

## 🏗️ 1. Database Schema Extensions
We need to support "Stored Balance" for all users (not just sellers) and track every transaction history.

### New Tables
- **`wallets`**:
  - `user_id` (UUID, PK)
  - `balance` (Numeric, default 0)
  - `currency` (Text, default 'TRY')
  - `last_deposit_at` (Timestamp)
- **`wallet_transactions`**:
  - `wallet_id` (FK)
  - `amount` (+/- value)
  - `type` ('deposit', 'spending', 'refund')
  - `related_order_id` (Optional FK)

## 💳 2. Payment Integration (PayTR)
We will use the existing `create-payment` Edge Function infrastructure but connect it to the UI.

### Flows
1. **Direct Service Payment**: Customer -> PayTR -> Mechanic/Valet.
   - Status: `orders` table (Exists).
2. **Wallet Top-up**: Customer -> PayTR -> Carvis Wallet.
   - Action: `wallets` balance update.
3. **Wallet Spending**: Customer -> Wallet Balance -> Service.
   - Action: Check balance -> Deduct -> Create Order (Paid).

## 📱 3. UI/UX Implementation

### A. Wallet Screen (`/app/wallet`)
- **Connect Real Data**: Replace `useState(1250)` with `usePayment().wallet`.
- **Transaction History**: Fetch from `wallet_transactions` table.
- **Top-up Modal**: Pop-up to enter amount -> Redirect to PayTR iframe.

### B. Service Payment Modal
- Added to **Mechanic** and **Valet** screens.
- **"Ödeme Yap" Button**:
  - Opens Modal with Summary (Service cost + Commission).
  - Options: "Pay with Wallet" or "Credit Card (PayTR)".

## 🔄 4. Orchestration Steps
1. **Database**: Run SQL migration for `wallets`.
2. **Context**: Update `PaymentContext` to handle Wallet operations (`fetchBalance`, `topUp`, `payWithWallet`).
3. **Frontend**: Refactor `WalletScreen.jsx` and add Payment Modals.
4. **Logic**: Link Service "Accept" actions to Payment requests.

## 🛡️ Security Check
- **RLS Policies**: Users can only see/edit their OWN wallet.
- **Server-Side Verification**: Balances are calculated via database triggers/functions, never trusted from client.
