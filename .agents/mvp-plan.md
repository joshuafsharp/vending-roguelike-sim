# Vending Rogue — MVP Plan

## Overview

A text-based scoring sandbox built with PixiJS + TypeScript. The core loop is: place products on a vending machine grid, simulate a night of customers, watch the math cascade, draft new products, repeat.

No art assets. Programmatic drawing for the grid, text log for the simulation.

---

## Core Concepts

### Products
- ~12-15 products
- Each has: **name**, **base price**, **tags** (1-2 from the tag pool)
- Tag pool (~5): `Drink`, `Snack`, `Salty`, `Sweet`, `Caffeine`

### The Grid
- 3x3 vending machine grid
- Slots can be empty
- Rendered visually in PixiJS (colored rectangles, text labels, tag indicators — no art assets)

### Synergy Rules
- Master list of ~8-10 tag-pair synergy rules
- Each rule: "If [Tag A] is adjacent (orthogonal) to [Tag B], apply x[N] multiplier to [target]"
- Per run: 4-5 rules randomly activated from the master list
- Multipliers stack **multiplicatively**

### Night Simulation
- Fixed location with 20 NPCs per night
- Each NPC has a buy chance (e.g., 60%)
- If buying, NPC picks a random **occupied** slot
- Scoring formula: `(Base Price + Flat Bonuses) x (Product of all active multipliers)`
- Output as a scrolling text log with full math breakdown per purchase

### Draft Phase
- After each night, player picks 1 product from 3-4 random options
- Product is added to the player's collection
- Player must place it in a grid slot
- If grid is full, placing in an occupied slot swaps out (removes) the existing product
- No cost for drafting in MVP

---

## MVP Game Flow

1. **New Run** — Empty 3x3 grid. ~4-5 randomly active synergy rules for this run. Player starts with a few products (2-3?).
2. **Grid Setup** — Visual grid rendered in PixiJS. Product list shown alongside. Click product to select, click grid slot to place. Click occupied slot to remove or swap.
3. **"Run Night"** — Button triggers simulation. Text log scrolls through 20 NPC events. Each event shows: buy/pass, which product picked, base price, active synergies, multipliers applied, final sale price. Running total displayed.
4. **Night Summary** — Total earnings for the night.
5. **Draft** — Choose 1 of 3-4 randomly offered products. Place it on the grid.
6. **Repeat** from step 3.
7. **No win/lose state** — Open-ended freeplay. Player experiments and chases high scores.

---

## UI Layout (Rough)

```
+------------------------------------------+
|  VENDING ROGUE                           |
+------------------+-----------------------+
|                  |                       |
|   [Grid 3x3]    |   Night Log           |
|                  |   (scrolling text)    |
|   [ ][ ][ ]     |                       |
|   [ ][ ][ ]     |   NPC #1: Pass        |
|   [ ][ ][ ]     |   NPC #2: Buys Cola!  |
|                  |   $2.00 x2.0 = $4.00  |
|                  |   ...                 |
+------------------+-----------------------+
|  Product List / Draft Options            |
|  [Cola] [Chips] [Energy Bar] ...         |
+------------------------------------------+
|  [Run Night]     Total: $42.00           |
+------------------------------------------+
```

---

## Implementation Plan

### Phase 1: Data & Core Systems
1. **Define data types** — `Product`, `SynergyRule`, `GridState`, `SimulationResult`, `NpcEvent`
2. **Create product catalog** — ~12-15 products with names, prices, tags
3. **Create synergy rule master list** — ~8-10 rules
4. **Build the scoring engine** — Pure functions, no rendering. Takes a grid state + active rules, simulates N NPCs, returns results with full math breakdown per event
5. **Unit test the scoring engine** — Verify synergy detection, multiplier stacking, edge cases (empty slots, no synergies)

### Phase 2: Grid UI
6. **Render the 3x3 grid** — PixiJS rectangles with text labels. Show product name + tag indicators per slot.
7. **Product list panel** — Display available products. Click to select (highlight).
8. **Grid interaction** — Click empty slot to place selected product. Click occupied slot to swap/remove.
9. **Show active synergies on grid** — Visual indicator (border color, line between slots, text) when adjacent products trigger an active rule.

### Phase 3: Simulation & Log
10. **Night simulation runner** — Orchestrate the scoring engine, produce a sequence of events.
11. **Text log panel** — Scrolling text area showing each NPC event with math breakdown.
12. **"Run Night" button** — Triggers simulation, streams events to the log (with slight delay per event for readability).
13. **Night summary** — Display total earnings after all events.

### Phase 4: Draft & Loop
14. **Draft screen** — After night ends, show 3-4 random product options. Click to pick one.
15. **Placement after draft** — Selected product goes to player's collection, must be placed on grid.
16. **Run counter / cumulative score** — Track nights played and total earnings across the run.
17. **"New Run" reset** — Clear grid, re-randomize active synergy rules, start fresh.

---

## Synergy System — Future Directions (Not MVP)

These are noted for later exploration:

- **Option B: Randomized bonus tags** — Products gain 1-2 random extra tags when acquired. Core tag stays fixed (Cola is always a Drink), but bonus tags vary per acquisition. Same synergy rules, but product-level variance.
- **Option C: Both** — Randomized tags AND randomized active rules. Maximum run-to-run variance.
- **Non-adjacency synergy types** — Diagonal, same-row, same-column, grid-wide ("all Drinks get +$0.50"), count-based ("3+ Salty items = global x1.5").
- **Product-specific synergy rules** — Individual products with unique effects beyond their tags.
- **Synergy items / modifiers** — Separate purchasable items that add or modify synergy rules mid-run.

---

## Broader Game — Future Directions (Not MVP)

- Day phase: top-down city exploration, wholesale warehouse for drafting
- Multiple locations with different footfall / buy chance
- Product rarity, cost-to-stock, shop economy
- Run structure: 4 weeks, mandatory purchases (gatekeepers), news bulletins (global modifiers)
- Visual assets: MS Paint sprites, wobble shaders, procedural jitter
- NPC visualization during night phase
- Sound design
