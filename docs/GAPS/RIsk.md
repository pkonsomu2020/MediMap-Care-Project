# Phase 1 Backend Gaps & Risks

## Identified Gaps
- **Caching Implementation**: Current caching uses simple bounding-box math instead of PostGIS geospatial queries, which may lead to inaccurate or incomplete results for radius-based searches.
- **Inline Supabase Writes**: Clinic data saves happen synchronously during API requests, potentially adding latency under high traffic without background job queuing.
- **Test Coverage**: No automated unit/integration tests yet for new endpoints (`/api/places/nearby`, `/api/places/details/:placeId`, `/api/places/geocode`, `/api/directions`), per QA_VALIDATION_PLAN.md requirements.
- **Environment Validation**: Env schema does not enforce required Google Maps API key or Supabase keys, risking runtime failures.

## Risks
- **Performance Bottleneck**: Synchronous database operations could degrade API response times if clinic upsert frequency increases.
- **Data Inconsistency**: Lack of geospatial indexing may cause cache misses or duplicates, affecting user experience.
- **Operational Blind Spots**: Without automated tests, regressions in backend logic could go undetected until manual QA.
- **Quota Management**: No monitoring or alerting for Google API usage, potentially leading to service interruptions.

## Mitigation Recommendations
- Implement PostGIS for accurate radius queries.
- Introduce background job system (e.g., Bull.js) for batch clinic saves.
- Add Jest/Supertest test suites as per QA_VALIDATION_PLAN.md.
- Enhance env validation to require critical keys.
- Set up API quota monitoring and alerts.