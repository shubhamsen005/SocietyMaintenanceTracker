# Architecture and implementation plan

## Chosen approach

Next.js App Router provides the polished responsive interface and can expose REST route handlers behind one deployable boundary. Production persistence is PostgreSQL via Prisma, with storage and email behind adapters. This avoids microservice overhead while keeping domain services testable.

## Phased checklist

- [x] Product shell, roles, access accounts and guided evaluator story
- [x] Command center, resident view, complaint intake, incident/asset/intelligence/notice UI
- [x] Explainable client prototype of Fusion, SLA, risk and immutable timeline
- [x] Deployment environment contract and core documentation
- [ ] Wire production Prisma migrations and route handlers
- [ ] Add credentials session, upload adapter, email worker and integration tests

The final two items are intentionally listed as implementation work; this repository currently ships an executable product prototype, not a falsely claimed connected backend.
