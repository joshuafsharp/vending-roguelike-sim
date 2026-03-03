# Vending Rogue — Progress Log

## Phase 2: Grid UI & Game Loop (551ad89 → current)

**What was built:**
- `src/app/components/VendingGrid.ts` — 3x3 interactive grid with PixiJS Graphics. Color-coded tag dots, synergy indicators (gold border + multiplier text), click-to-place/remove.
- `src/app/components/ProductList.ts` — Clickable product cards with name, price, tags. Supports inventory and draft modes.
- `src/app/components/NightLog.ts` — Scrolling text log with masking. Streams NPC events one-by-one with delay. Synergy breakdowns in gold.
- `src/game/gameState.ts` — State manager for the full game loop: new run, place/remove products, simulate night, draft phase, reset.
- `src/app/screens/GameScreen.ts` — Main screen assembling all components. Grid top-left, log top-right, products below, buttons at bottom.
- `src/main.ts` — Updated to boot directly into GameScreen.

**Status:** Fully playable MVP loop — place products, run night, watch scoring, draft new products, repeat. TypeScript clean, 16 tests pass, production build succeeds.

---

## Phase 1: Data & Core Systems (initial → 551ad89)

**What was built:**
- `src/game/types.ts` — Core types: Product, Tag, SynergyRule, Grid (3x3), NpcEvent, SimulationResult, RunState. Grid utility functions (neighbor lookup, index/position).
- `src/game/data/products.ts` — 15 products across 5 tags (Drink, Snack, Salty, Sweet, Caffeine).
- `src/game/data/synergies.ts` — 10 synergy rules in master list. 5 randomly active per run.
- `src/game/scoring.ts` — Pure scoring engine: synergy detection via orthogonal adjacency, multiplicative multiplier stacking, full night simulation with injectable RNG.
- `src/game/__tests__/scoring.test.ts` — 16 tests covering synergies, multiplier math, empty slots, buy chance, simulation output.
- `.agents/mvp-plan.md` — Full MVP plan and future directions.
- Added vitest for testing.

**Status:** All scoring logic complete and tested. No rendering — pure data layer.
