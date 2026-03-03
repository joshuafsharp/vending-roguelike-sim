import { describe, it, expect } from "vitest";
import type { Grid, Product, SynergyRule } from "../types";
import { findSynergiesForSlot, calculateSalePrice, simulateNight } from "../scoring";

// Helper products
const cola: Product = { id: "cola", name: "Cola", basePrice: 2.0, tags: ["Drink", "Sweet"] };
const chips: Product = { id: "chips", name: "Chips", basePrice: 1.5, tags: ["Snack", "Salty"] };
const energy: Product = { id: "energy", name: "Energy Drink", basePrice: 3.5, tags: ["Drink", "Caffeine"] };
const candy: Product = { id: "candy", name: "Candy Bar", basePrice: 1.0, tags: ["Snack", "Sweet"] };

// Helper rules
const thirstTrap: SynergyRule = {
  id: "thirst_trap", name: "Thirst Trap",
  description: "Salty boosts adjacent Drinks",
  tagA: "Salty", tagB: "Drink", multiplier: 2.0, target: "b",
};

const comboMeal: SynergyRule = {
  id: "combo_meal", name: "Combo Meal",
  description: "Snacks and Drinks boost each other",
  tagA: "Snack", tagB: "Drink", multiplier: 1.5, target: "both",
};

const sugarRush: SynergyRule = {
  id: "sugar_rush", name: "Sugar Rush",
  description: "Sweet boosts adjacent Caffeine",
  tagA: "Sweet", tagB: "Caffeine", multiplier: 1.5, target: "b",
};

const sweetTooth: SynergyRule = {
  id: "sweet_tooth", name: "Sweet Tooth",
  description: "Sweet boosts adjacent Sweet",
  tagA: "Sweet", tagB: "Sweet", multiplier: 1.5, target: "both",
};

function emptyGrid(): Grid {
  return [null, null, null, null, null, null, null, null, null];
}

describe("findSynergiesForSlot", () => {
  it("returns empty array for empty slot", () => {
    const grid = emptyGrid();
    expect(findSynergiesForSlot(grid, 0, [thirstTrap])).toEqual([]);
  });

  it("returns empty array when no neighbors", () => {
    const grid = emptyGrid();
    grid[0] = cola;
    expect(findSynergiesForSlot(grid, 0, [thirstTrap])).toEqual([]);
  });

  it("finds synergy when Salty is adjacent to Drink (target=b)", () => {
    const grid = emptyGrid();
    // Chips at [0,0], Cola at [0,1] — adjacent horizontally
    grid[0] = chips;
    grid[1] = cola;

    // Cola (Drink) should get the thirst trap bonus from Chips (Salty)
    const matches = findSynergiesForSlot(grid, 1, [thirstTrap]);
    expect(matches).toHaveLength(1);
    expect(matches[0].rule.id).toBe("thirst_trap");
    expect(matches[0].targetIndex).toBe(1);
    expect(matches[0].sourceIndex).toBe(0);

    // Chips (Salty) should NOT get the bonus (target=b means Drink gets it)
    const chipMatches = findSynergiesForSlot(grid, 0, [thirstTrap]);
    expect(chipMatches).toHaveLength(0);
  });

  it("finds synergy for both sides when target=both", () => {
    const grid = emptyGrid();
    grid[0] = chips; // Snack
    grid[1] = cola;  // Drink

    const colaMatches = findSynergiesForSlot(grid, 1, [comboMeal]);
    expect(colaMatches).toHaveLength(1);

    const chipMatches = findSynergiesForSlot(grid, 0, [comboMeal]);
    expect(chipMatches).toHaveLength(1);
  });

  it("finds same-tag synergy (Sweet + Sweet)", () => {
    const grid = emptyGrid();
    grid[0] = cola;  // Sweet
    grid[1] = candy; // Sweet

    const matches = findSynergiesForSlot(grid, 0, [sweetTooth]);
    expect(matches).toHaveLength(1);
    expect(matches[0].rule.id).toBe("sweet_tooth");
  });

  it("does not match non-adjacent products", () => {
    const grid = emptyGrid();
    // [0,0] and [0,2] are NOT adjacent (gap in between)
    grid[0] = chips;
    grid[2] = cola;

    const matches = findSynergiesForSlot(grid, 2, [thirstTrap]);
    expect(matches).toHaveLength(0);
  });

  it("finds multiple synergies from different neighbors", () => {
    const grid = emptyGrid();
    // Layout:
    // [chips] [cola] [chips]
    //         [    ] [     ]
    //         [    ] [     ]
    grid[0] = chips;
    grid[1] = cola;
    grid[2] = { ...chips, id: "chips2" };

    // Cola has Salty neighbor on left (index 0), but index 2 is NOT adjacent to index 1 in a 3x3
    // Wait: in row-major 3x3, index 1 neighbors are 0, 2, 4
    // So chips at 0 and chips2 at 2 are BOTH adjacent to cola at 1
    const matches = findSynergiesForSlot(grid, 1, [thirstTrap]);
    expect(matches).toHaveLength(2);
  });
});

describe("calculateSalePrice", () => {
  it("returns base price with no synergies", () => {
    const grid = emptyGrid();
    grid[4] = cola; // center, no neighbors

    const result = calculateSalePrice(grid, 4, [thirstTrap]);
    expect(result.basePrice).toBe(2.0);
    expect(result.multiplier).toBe(1);
    expect(result.finalPrice).toBe(2.0);
    expect(result.synergies).toHaveLength(0);
  });

  it("applies single multiplier", () => {
    const grid = emptyGrid();
    grid[0] = chips; // Salty
    grid[1] = cola;  // Drink

    const result = calculateSalePrice(grid, 1, [thirstTrap]);
    expect(result.basePrice).toBe(2.0);
    expect(result.multiplier).toBe(2.0);
    expect(result.finalPrice).toBe(4.0);
  });

  it("stacks multipliers multiplicatively", () => {
    const grid = emptyGrid();
    // Chips (Salty, Snack) at [0,0], Cola (Drink, Sweet) at [0,1]
    grid[0] = chips;
    grid[1] = cola;

    // thirstTrap: Salty->Drink x2.0 (cola gets this)
    // comboMeal: Snack<->Drink x1.5 (both get this)
    const result = calculateSalePrice(grid, 1, [thirstTrap, comboMeal]);
    expect(result.multiplier).toBe(2.0 * 1.5); // 3.0
    expect(result.finalPrice).toBe(2.0 * 3.0); // 6.0
  });

  it("returns zero for empty slot", () => {
    const grid = emptyGrid();
    const result = calculateSalePrice(grid, 0, [thirstTrap]);
    expect(result.finalPrice).toBe(0);
  });
});

describe("simulateNight", () => {
  it("all NPCs pass when grid is empty", () => {
    const grid = emptyGrid();
    const result = simulateNight(grid, [], 10, 0.6, 1);
    expect(result.events).toHaveLength(10);
    expect(result.events.every((e) => !e.bought)).toBe(true);
    expect(result.totalEarnings).toBe(0);
  });

  it("respects buy chance with deterministic rng", () => {
    const grid = emptyGrid();
    grid[4] = cola;

    // rng always returns 0.5 => 0.5 <= 0.6 buyChance => always buys
    // for slot selection: floor(0.5 * 1) = 0 => picks occupiedSlots[0] = index 4
    const alwaysBuy = () => 0.5;
    const result = simulateNight(grid, [], 5, 0.6, 1, alwaysBuy);

    expect(result.events.every((e) => e.bought)).toBe(true);
    expect(result.totalEarnings).toBe(2.0 * 5); // 5 purchases at $2 each
  });

  it("no one buys when buy chance is 0", () => {
    const grid = emptyGrid();
    grid[4] = cola;

    // rng returns 0.5 => 0.5 > 0 buyChance... wait, buyChance=0 means rng() > 0 is always true
    const result = simulateNight(grid, [], 10, 0, 1);
    expect(result.events.every((e) => !e.bought)).toBe(true);
  });

  it("includes synergy data in purchase events", () => {
    const grid = emptyGrid();
    grid[0] = chips;
    grid[1] = cola;

    // Always picks slot index 1 (cola)
    let callCount = 0;
    const rng = () => {
      callCount++;
      // First call: buy check (0.1 <= 0.6, buys)
      // Second call: slot pick (0.99 * 2 slots = floor(1.98) = 1 => occupiedSlots[1] = index 1)
      return callCount % 2 === 1 ? 0.1 : 0.99;
    };

    const result = simulateNight(grid, [thirstTrap], 1, 0.6, 1, rng);
    expect(result.events[0].bought).toBe(true);
    expect(result.events[0].synergies).toHaveLength(1);
    expect(result.events[0].multiplier).toBe(2.0);
    expect(result.events[0].finalPrice).toBe(4.0);
  });

  it("tracks night number", () => {
    const grid = emptyGrid();
    const result = simulateNight(grid, [], 1, 0, 5);
    expect(result.nightNumber).toBe(5);
  });
});
