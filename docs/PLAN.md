# PLAN: Partner Dashboard Workflow & Record History Overhaul

This plan details the implementation of missing logical transitions (such as promoting approved appointments to active repair orders) and introducing tabs to view completed/historical records across all corporate dashboards.

---

## 🛠️ Proposed Enhancements

### 1. Appointment Promotion Workflow (Mechanics)
- **Problem:** When a mechanic approves a pending appointment, the appointment status becomes `approved` and vanishes from the list, with no follow-up.
- **Solution:** Update `handleApproveAppointment` in [MechanicDashboardView.jsx](file:///c:/Users/Bedirhan/Desktop/Carvis-App/Carvis/src/features/partners/components/MechanicDashboardView.jsx) to automatically create a corresponding record in the `orders` table with status `in_progress` and details of the vehicle.

### 2. Historical Records & History Tabs
Introduce a tab switch (`Active` vs `History`) on the main panels so partners can track completed services and shipped orders:
- **Mechanics:** Show completed work orders (`status === 'completed'`) and approved appointments.
- **Parts Sellers:** Show shipped or completed orders (`status === 'shipped'` or `'completed'`).
- **Seyyar Yıkama:** Show accepted vs completed washing jobs.
- **Acil Çekici:** Show ongoing towing assignments vs completed roadside assist records.
- **Sigorta Şirketi:** Show pending risk reviews vs approved active policies.

---

## 🏁 Verification Plan

### Automated Tests
- Run `npm run test` to verify no breakages.
- Run `python .agent/scripts/checklist.py .` to ensure compliance.
