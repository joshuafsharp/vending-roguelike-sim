import type {
  Grid,
  SynergyRule,
  SynergyMatch,
  NpcEvent,
  SimulationResult,
} from "./types";
import { getNeighborIndices } from "./types";

/**
 * Find all synergy matches on the grid for a specific slot.
 * Checks orthogonal neighbors and returns all matching rules.
 */
export function findSynergiesForSlot(
  grid: Grid,
  slotIndex: number,
  activeRules: SynergyRule[],
): SynergyMatch[] {
  const product = grid[slotIndex];
  if (!product) return [];

  const neighbors = getNeighborIndices(slotIndex);
  const matches: SynergyMatch[] = [];

  for (const neighborIndex of neighbors) {
    const neighbor = grid[neighborIndex];
    if (!neighbor) continue;

    for (const rule of activeRules) {
      // Check if this slot is tagA and neighbor is tagB
      if (product.tags.includes(rule.tagA) && neighbor.tags.includes(rule.tagB)) {
        if (rule.target === "a" || rule.target === "both") {
          matches.push({ rule, targetIndex: slotIndex, sourceIndex: neighborIndex });
        }
      }

      // Check the reverse: this slot is tagB and neighbor is tagA
      // (skip if tagA === tagB to avoid double-counting the same rule direction)
      if (rule.tagA !== rule.tagB) {
        if (product.tags.includes(rule.tagB) && neighbor.tags.includes(rule.tagA)) {
          if (rule.target === "b" || rule.target === "both") {
            matches.push({ rule, targetIndex: slotIndex, sourceIndex: neighborIndex });
          }
        }
      }
    }
  }

  return matches;
}

/**
 * Calculate the final sale price for a product at a given slot.
 * Multipliers stack multiplicatively.
 */
export function calculateSalePrice(
  grid: Grid,
  slotIndex: number,
  activeRules: SynergyRule[],
): { basePrice: number; synergies: SynergyMatch[]; multiplier: number; finalPrice: number } {
  const product = grid[slotIndex];
  if (!product) {
    return { basePrice: 0, synergies: [], multiplier: 1, finalPrice: 0 };
  }

  const synergies = findSynergiesForSlot(grid, slotIndex, activeRules);

  // Stack multipliers multiplicatively
  let multiplier = 1;
  for (const match of synergies) {
    multiplier *= match.rule.multiplier;
  }

  const finalPrice = parseFloat((product.basePrice * multiplier).toFixed(2));

  return {
    basePrice: product.basePrice,
    synergies,
    multiplier,
    finalPrice,
  };
}

/**
 * Get indices of all occupied slots in the grid.
 */
function getOccupiedSlots(grid: Grid): number[] {
  const occupied: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== null) occupied.push(i);
  }
  return occupied;
}

/**
 * Simulate a full night of NPC visits.
 *
 * @param grid - The current vending machine grid
 * @param activeRules - Synergy rules active this run
 * @param npcCount - Number of NPCs visiting tonight
 * @param buyChance - Probability (0-1) each NPC will buy
 * @param nightNumber - Current night number for tracking
 * @param rng - Optional random function for deterministic testing (defaults to Math.random)
 */
export function simulateNight(
  grid: Grid,
  activeRules: SynergyRule[],
  npcCount: number,
  buyChance: number,
  nightNumber: number,
  rng: () => number = Math.random,
): SimulationResult {
  const occupiedSlots = getOccupiedSlots(grid);
  const events: NpcEvent[] = [];
  let totalEarnings = 0;

  for (let i = 0; i < npcCount; i++) {
    // Does this NPC buy?
    if (occupiedSlots.length === 0 || rng() > buyChance) {
      events.push({ npcIndex: i, bought: false });
      continue;
    }

    // Pick a random occupied slot
    const slotIndex = occupiedSlots[Math.floor(rng() * occupiedSlots.length)];
    const product = grid[slotIndex]!;
    const { basePrice, synergies, multiplier, finalPrice } = calculateSalePrice(
      grid,
      slotIndex,
      activeRules,
    );

    totalEarnings += finalPrice;

    events.push({
      npcIndex: i,
      bought: true,
      slotIndex,
      product,
      basePrice,
      synergies,
      multiplier,
      finalPrice,
    });
  }

  return {
    events,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    nightNumber,
  };
}
