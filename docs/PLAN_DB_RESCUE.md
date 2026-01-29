# 🚑 Operation: Database Rescue (Clean Slate)

**Objective**: Eliminate SQL errors by consolidating all scattered migration files into ONE definitive Master Script.

## 🛑 The Problem
- The SQL Editor is cluttered.
- Migrations are conflicting.
- User requested "From Scratch".

## 🛠️ The Solution (Orchestration)
We will use 3 agents to fix this:

### 1. Database Architect 🏗️
- **Action**: Read ALL existing migration files.
- **Output**: Create `20260128_MASTER_SCHEMA.sql`.
- **Logic**:
    1.  `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` (Hard Reset).
    2.  Define `profiles` (with Roles).
    3.  Define `wallets`, `transactions`, `orders`, `parking_lots`.
    4.  Apply RLS & Triggers.

### 2. Backend Specialist ⚙️
- **Action**: Verify Schema matches Code.

### 3. DevOps Engineer 🚀
- **Action**: Use `execute_sql` tool to apply changes directly.

## ⏳ Execution Steps
1.  **Read**: Scan migrations.
2.  **Build**: Write `MASTER_SCHEMA.sql`.
3.  **Execute**: Run it.

## ❓ Critical Question
Assuming **HARD RESET** (Data Loss) is acceptable as requested ("Sıfırdan yaz").
