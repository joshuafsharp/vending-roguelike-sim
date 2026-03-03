export type Tag = "Drink" | "Snack" | "Salty" | "Sweet" | "Caffeine";

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  tags: Tag[];
}

export interface SynergyRule {
  id: string;
  name: string;
  description: string;
  tagA: Tag;
  tagB: Tag;
  /** Multiplier applied when tagA is adjacent to tagB */
  multiplier: number;
  /** Which side of the pair gets the multiplier: "a", "b", or "both" */
  target: "a" | "b" | "both";
}

/** A single cell in the 3x3 grid. null = empty slot. */
export type GridCell = Product | null;

/** 3x3 grid represented as a flat 9-element array (row-major). */
export type Grid = [
  GridCell, GridCell, GridCell,
  GridCell, GridCell, GridCell,
  GridCell, GridCell, GridCell,
];

export const GRID_SIZE = 3;

/** Get row/col from a flat grid index. */
export function gridPos(index: number): { row: number; col: number } {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

/** Get flat index from row/col. */
export function gridIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

/** Get orthogonal neighbor indices for a given grid index. */
export function getNeighborIndices(index: number): number[] {
  const { row, col } = gridPos(index);
  const neighbors: number[] = [];
  if (row > 0) neighbors.push(gridIndex(row - 1, col));
  if (row < GRID_SIZE - 1) neighbors.push(gridIndex(row + 1, col));
  if (col > 0) neighbors.push(gridIndex(row, col - 1));
  if (col < GRID_SIZE - 1) neighbors.push(gridIndex(row, col + 1));
  return neighbors;
}

export interface SynergyMatch {
  rule: SynergyRule;
  /** The grid index of the product receiving the multiplier */
  targetIndex: number;
  /** The grid index of the product triggering the synergy */
  sourceIndex: number;
}

export interface NpcEvent {
  npcIndex: number;
  bought: boolean;
  /** Set if bought=true */
  slotIndex?: number;
  product?: Product;
  basePrice?: number;
  synergies?: SynergyMatch[];
  multiplier?: number;
  finalPrice?: number;
}

export interface SimulationResult {
  events: NpcEvent[];
  totalEarnings: number;
  nightNumber: number;
}

export interface RunState {
  grid: Grid;
  /** Products the player currently owns (including those on the grid) */
  inventory: Product[];
  /** Synergy rules active for this run */
  activeRules: SynergyRule[];
  /** Total money earned across all nights */
  totalMoney: number;
  /** Current night number */
  nightNumber: number;
}
