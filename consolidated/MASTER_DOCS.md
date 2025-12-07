# MASTER_DOCS.md - Consolidated Project Documentation

This file consolidates the most important project documentation: README, implementation plans, and key guides.

## Quick Links
- README.md (kept in root) — Overview & Quick Start
- consolidated/MASTER_DOCS.md — This file
- consolidated/MASTER_DATABASE_AND_SEED.sql — Consolidated SQL migrations + permissions seed
- consolidated/run_all.ps1 — Consolidated PowerShell operations (migrations, seeding, tests, start backend)

---

## Annotated Merge List
The following documents are captured or summarized in this consolidated file; originals have been archived under `archive/docs/`.

- `PERMISSIONS_SEEDING_REFERENCE.md` - Permission seeding steps (297 permissions across modules)
- `COMPLETE_RBAC_IMPLEMENTATION_PLAN.md` - High-level plan and seeds
- `EYE_HOSPITAL_IMPLEMENTATION_COMPLETE.md` - Eye hospital seed and validation notes
- `DATA_SEEDING_COMPLETE.md` - Validation and checks done after seeding
- `DAY1_APPOINTMENTS_GUIDE.md` - Step-by-step for day 1 appointments setup
- `START_HERE.md` - Starter guide (link to README)

Content from the files above has been collapsed and summarized here to provide a single authoritative reference with key commands and sequences for an initial install, seeding, and testing.


---

## Purpose
This file is the single, merged documentation file created to help reduce duplicate or out-of-date docs. It summarizes:
- Permissions & seeding details
- Migration + DB setup guidelines
- Implementation plan highlights
- Links to more detailed docs (now archived)

## Migration / Seeding
- For migrations and SQL seeding, use `consolidated/MASTER_DATABASE_AND_SEED.sql`.
- For step-by-step execution and safe re-run procedures, use `consolidated/run_all.ps1`.

## Implementation Plan (summary)
- Week 1: Permissions & Roles seeding
- Week 2: Document sharing & ABAC
- Week 3: Roles + Permissions UI
- Week 4: Testing & Deployment

---

## Archived Documents
All older, duplicate or deprecated docs have been moved to the /archive/docs/ folder. If you need the full historical docs, look there.

---

## Contact
If anything in this document is out of date or you want a copy of a specific archived doc, open an issue and tag @samaluri005
