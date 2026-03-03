import type { SynergyRule } from "../types";

/**
 * Master list of all synergy rules.
 * Each run randomly activates a subset of these.
 */
export const ALL_SYNERGY_RULES: SynergyRule[] = [
  {
    id: "thirst_trap",
    name: "Thirst Trap",
    description: "Salty items make adjacent Drinks sell for more",
    tagA: "Salty",
    tagB: "Drink",
    multiplier: 2.0,
    target: "b",
  },
  {
    id: "sugar_rush",
    name: "Sugar Rush",
    description: "Sweet items boost adjacent Caffeine products",
    tagA: "Sweet",
    tagB: "Caffeine",
    multiplier: 1.5,
    target: "b",
  },
  {
    id: "combo_meal",
    name: "Combo Meal",
    description: "Snacks and Drinks boost each other",
    tagA: "Snack",
    tagB: "Drink",
    multiplier: 1.5,
    target: "both",
  },
  {
    id: "junk_food",
    name: "Junk Food Frenzy",
    description: "Salty next to Sweet creates an irresistible combo",
    tagA: "Salty",
    tagB: "Sweet",
    multiplier: 1.75,
    target: "both",
  },
  {
    id: "caffeine_crash",
    name: "Caffeine & Crash",
    description: "Caffeine next to Snacks drives impulse buys",
    tagA: "Caffeine",
    tagB: "Snack",
    multiplier: 1.5,
    target: "a",
  },
  {
    id: "hydration",
    name: "Stay Hydrated",
    description: "Drinks boost other adjacent Drinks",
    tagA: "Drink",
    tagB: "Drink",
    multiplier: 1.25,
    target: "both",
  },
  {
    id: "snack_stack",
    name: "Snack Stack",
    description: "Snacks boost other adjacent Snacks",
    tagA: "Snack",
    tagB: "Snack",
    multiplier: 1.25,
    target: "both",
  },
  {
    id: "wake_up_call",
    name: "Wake-Up Call",
    description: "Caffeine next to Caffeine creates a powerful buzz",
    tagA: "Caffeine",
    tagB: "Caffeine",
    multiplier: 2.0,
    target: "both",
  },
  {
    id: "sweet_tooth",
    name: "Sweet Tooth",
    description: "Sweet items boost adjacent Sweet items",
    tagA: "Sweet",
    tagB: "Sweet",
    multiplier: 1.5,
    target: "both",
  },
  {
    id: "salt_lick",
    name: "Salt Lick",
    description: "Salty boosts adjacent Salty for maximum crunch",
    tagA: "Salty",
    tagB: "Salty",
    multiplier: 1.5,
    target: "both",
  },
];

/** Number of rules to activate per run */
export const RULES_PER_RUN = 5;
