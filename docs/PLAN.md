# Plan: System Health & Codebase Status Audit

## 1. Goal
Evaluate the complete health of the Carvis application, ensuring that:
- Codebase style guidelines are met (no ESLint errors or warnings).
- Security policies are respected (no vulnerabilities or secrets checked-in).
- Database migrations and schemas are in sync.
- The UI components compile and follow correct UX patterns.
- The active development server is running healthy.

## 2. Agent Roles & Strategy

### Phase 1: Planning & Discovery
*   **project-planner**: Coordinate the system status audit and summarize the checklist results.
*   **explorer-agent**: Check project configurations, Git state, and inspect active build/development configurations.

### Phase 2: Execution & Verification (Pending Approval)
*   **test-engineer**: Execute lint, security, schema, and UX validation scripts.
*   **devops-engineer**: Check background dev server status and build compilation verification.

---

## 3. Verification Commands
We will execute the project's master audit script to verify all core components:
```powershell
python .agent/scripts/checklist.py .
```
