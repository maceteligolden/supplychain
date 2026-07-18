# Demo script — Nigeria importer deforestation flow

**Persona:** Import operator moving goods from farm → customer.  
**Surface:** Farm detail → **Deforestation** tab (desktop).

## Prerequisites

1. Backend: `GFW_API_KEY` and `WHISP_API_KEY` set; `ASSESSMENT_WORKER_ENABLED=true`; run `yarn worker:assessments` (or npm equivalent).
2. Frontend: `NEXT_PUBLIC_USE_MOCK_API=false`, `API_PROXY_TARGET` pointing at the backend.
3. A farm record exists (create via Add farm; location country can be Nigeria).

## Walkthrough (~5 minutes)

1. Open a farm → **Deforestation**.
2. Click **Open full-screen map**.
3. **Locate** the plot (Nigeria):
   - Search a place or postcode (e.g. Abuja / a known local postcode), pick a suggestion; or
   - Paste lat/lng; or
   - Use GPS; or
   - Pick on map.
4. Click **Use this location** — farm GPS is saved and the map stays centered.
5. Click **Draw boundary** (satellite basemap auto-enables).
6. Click corners (≥3), **Close plot**, drag vertices if needed. Optionally **Add plot** for multi-plot farms.
7. **Save boundary** — basemap returns to street; close full-screen.
8. Click **Run assessment**. Wait for COMPLETE (or async poll). Confirm provenance shows **Live (WHISP + GFW)** when keys are valid — not Demo fallback.
9. Toggle **Satellite evidence** vs **Risk layers**. Confirm overlays stay inside the boundary and the legend shows loss / gain / stable / non-forest.
10. Open a supply chain that uses this farm — confirm compact **Deforestation risk** badge; drill back to the farm tab for the map.

## Talking points

- Supports due diligence; **not** a legal EUDR certificate.
- FALLBACK metrics are for demo only when API keys are missing.
- Chain/dashboard stay compact; deep work stays on the farm Deforestation tab.
