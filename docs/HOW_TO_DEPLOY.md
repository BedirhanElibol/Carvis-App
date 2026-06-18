# 🚀 Rapidsy App - Deployment Guide (v2.1 Partner Edition)

**Build Status:** ✅ SUCCESS
**New Mode:** Partner Ecosystem (Otopark, Vale, Usta)

---

## 📦 What is new?
We have enabled the **Partner Entry** (Satıcı Girişi) for:
1.  **🅿️ Otopark**: Manage Capacity & Occupancy.
2.  **🔑 Vale**: Handle Pickup/Delivery Requests.
3.  **🔧 Usta**: Manage Service Job Queue.

---

## 🛠️ Deployment Steps (Standard)
1.  **Use `dist` folder**: The build `dist` folder is updated and ready.
2.  **Deploy to Vercel/Netlify**: Run `npm run build` or upload `dist`.

---

## 🧪 How to Access Partner Panels?
Since this is a new feature, you can access it via direct link or role simulation.

**URL:** `/partner` (e.g. `localhost:5173/partner` or `your-site.com/partner`)

### 🎮 Developer Mode (Role Switcher)
Inside the Partner Panel, look at the **Left Sidebar (Bottom)**.
*   Click **OTO**: Switch to Parking Operator View.
*   Click **VALE**: Switch to Valet View.
*   Click **USTA**: Switch to Mechanic View.

---

## ⚠️ Known Limitations
*   **Database:** You must run `supabase/migrations/20260127_multi_role_suite.sql` for real data persistence. Currently data is **Simulated**.
*   **Disabled Modules:** Notifications & Old Seller Dashboard (Legacy) remain disabled to ensure build stability.

**Ready to Scale!** 🚀
