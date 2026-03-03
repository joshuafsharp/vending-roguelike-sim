import type { Grid, Product, RunState, SynergyRule } from "./types";
import { ALL_PRODUCTS } from "./data/products";
import { ALL_SYNERGY_RULES, RULES_PER_RUN } from "./data/synergies";
import { simulateNight } from "./scoring";

const NPC_COUNT = 20;
const BUY_CHANCE = 0.6;
const DRAFT_CHOICES = 4;
const STARTING_PRODUCTS = 3;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type GamePhase = "setup" | "simulating" | "results" | "draft";

export class GameState {
  public run: RunState;
  public phase: GamePhase = "setup";
  public draftOptions: Product[] = [];

  /** Callback when phase changes */
  public onPhaseChange: ((phase: GamePhase) => void) | null = null;

  constructor() {
    this.run = this.createNewRun();
  }

  private createNewRun(): RunState {
    // Pick random active rules
    const shuffledRules = shuffleArray(ALL_SYNERGY_RULES);
    const activeRules = shuffledRules.slice(0, RULES_PER_RUN);

    // Give player a few random starting products
    const shuffledProducts = shuffleArray(ALL_PRODUCTS);
    const startingInventory = shuffledProducts.slice(0, STARTING_PRODUCTS);

    return {
      grid: [null, null, null, null, null, null, null, null, null],
      inventory: startingInventory,
      activeRules,
      totalMoney: 0,
      nightNumber: 0,
    };
  }

  public newRun() {
    this.run = this.createNewRun();
    this.phase = "setup";
    this.onPhaseChange?.(this.phase);
  }

  public placeProduct(slotIndex: number, product: Product) {
    if (slotIndex < 0 || slotIndex >= 9) return;
    this.run.grid[slotIndex] = product;
  }

  public removeProduct(slotIndex: number): Product | null {
    const product = this.run.grid[slotIndex];
    this.run.grid[slotIndex] = null;
    return product;
  }

  public hasProductsOnGrid(): boolean {
    return this.run.grid.some((cell) => cell !== null);
  }

  public runNight() {
    this.run.nightNumber++;
    this.phase = "simulating";
    this.onPhaseChange?.(this.phase);

    const result = simulateNight(
      this.run.grid,
      this.run.activeRules,
      NPC_COUNT,
      BUY_CHANCE,
      this.run.nightNumber,
    );

    this.run.totalMoney += result.totalEarnings;
    return result;
  }

  public onSimulationComplete() {
    this.phase = "results";
    this.onPhaseChange?.(this.phase);
  }

  public startDraft() {
    // Pick random products from the full catalog that aren't already in inventory
    const inventoryIds = new Set(this.run.inventory.map((p) => p.id));
    const available = ALL_PRODUCTS.filter((p) => !inventoryIds.has(p.id));

    if (available.length === 0) {
      // All products owned, just offer from the full catalog
      this.draftOptions = shuffleArray(ALL_PRODUCTS).slice(0, DRAFT_CHOICES);
    } else {
      this.draftOptions = shuffleArray(available).slice(0, DRAFT_CHOICES);
    }

    this.phase = "draft";
    this.onPhaseChange?.(this.phase);
  }

  public draftProduct(product: Product) {
    this.run.inventory.push(product);
    this.phase = "setup";
    this.onPhaseChange?.(this.phase);
  }

  public skipDraft() {
    this.phase = "setup";
    this.onPhaseChange?.(this.phase);
  }

  public get activeRules(): SynergyRule[] {
    return this.run.activeRules;
  }

  public get grid(): Grid {
    return this.run.grid;
  }

  public get inventory(): Product[] {
    return this.run.inventory;
  }
}
