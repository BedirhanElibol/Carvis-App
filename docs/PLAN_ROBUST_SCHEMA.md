# 🛡️ Plan: Robust Schema & Role Error Resolution

**Objective**: Fix `ERROR: 23514` (Role Check Constraint) and implement a strategy to prevent future data-schema mismatches.

## 🧠 Brainstorming Summary (as requested)
The problem: Schema says "Only X, Y, Z allowed", but Data says "I am Seller".
**Options:**
1.  **Strict Enums (Current)**: Hardcode allowed values. Safe but fragile to new data.
2.  **Lookup Table**: `public.roles` table. Flexible, correct relational design, but adds complexity to joins.
3.  **Loose Text**: Remove constraint. Very flexible, but dangerous (typos: 'sller').

**Decision**: **Option 1 (Expanded)** for now. We will strictly add `seller` to the allowed list. Moving to Option 2 is a larger architectural change for Phase 9.

## 👥 Orchestration Team
1.  **Project Planner**: This plan.
2.  **Database Architect**: Update `20260128_TRUE_MASTER_SCHEMA.sql`.
3.  **Debugger**: Verify file content and ensure no other constraints block us.

## 🛠️ Implementation Steps
1.  **Analyze**: Confirm all legacy roles (`driver`? `dealer`?).
2.  **Edit**: Modify `TRUE_MASTER_SCHEMA.sql`.
    - Add `seller` to `profiles.role` CHECK.
    - Add `seller` to `handle_new_user` logic if needed.
3.  **Execute**: User runs the updated script.

## 🛑 Verification
- Check Constraint must read: `CHECK (role IN ('customer', 'seller', 'parking', 'valet', 'mechanic', 'admin'))`

## ✅ User Approval
Proceeding to Implementation Phase immediately to unblock the user.
