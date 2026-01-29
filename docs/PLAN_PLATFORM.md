# 🛡️ Phase 8: Platform Maturity & Admin Panel

**Objective**: Create a "Control Center" for Carvis owners to manage the ecosystem and prepare the app for public distribution (PWA).

## 🏗️ 1. Admin Dashboard (`/admin`)

### Architecture
- **Route**: Protected `src/routes.jsx` entry. Checks `user_metadata.role === 'admin'`.
- **Layout**: `AdminLayout.jsx` with dedicated sidebar (Users, Finance, Settings).

### Features
1.  **Overview (KPIs)**:
    -   Total Users / Active Partners.
    -   Total Revenue (Commission).
    -   System Health Status.
2.  **User Management**:
    -   Table view of all users (`profiles`).
    -   Actions: Ban User, Upgrade Role (e.g., make someone a Partner).
3.  **Finance View**:
    -   List of recent transactions (`wallet_transactions`).
    -   Total platform commission earned.

## 📱 2. PWA (Progressive Web App)

### Requirements
- **Manifest**: `public/manifest.json` (Icons, Name, Theme Color).
- **Service Worker**: `vite-plugin-pwa` integration for offline support and "Add to Home Screen".
- **Meta Tags**: iOS specifics (`apple-mobile-web-app-capable`).

## 🔄 3. Orchestration Steps
1.  **Admin**: Create `AdminDashboard.jsx` and `AdminUsers.jsx`.
2.  **Routing**: Update `AppRoutes.jsx` to secure `/admin`.
3.  **PWA**: Configure Vite and Manifest.
4.  **Polish**: Run final lint/cleanup.

## ⚠️ Notes
- You can manually set your user to 'admin' via Supabase Dashboard to test this.
