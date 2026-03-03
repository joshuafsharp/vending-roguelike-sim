import { Container, Graphics, Text } from "pixi.js";
import type { Grid, Product, SynergyMatch } from "../../game/types";
import { GRID_SIZE, gridPos } from "../../game/types";
import { findSynergiesForSlot } from "../../game/scoring";
import type { SynergyRule } from "../../game/types";

const SLOT_SIZE = 120;
const SLOT_GAP = 8;
const GRID_PADDING = 16;

const TAG_COLORS: Record<string, number> = {
  Drink: 0x4a90d9,
  Snack: 0xd9944a,
  Salty: 0xd9d94a,
  Sweet: 0xd94a90,
  Caffeine: 0x4ad990,
};

const EMPTY_COLOR = 0x2a2a2a;
const OCCUPIED_COLOR = 0x3a3a3a;
const SELECTED_COLOR = 0x4a6a4a;
const SYNERGY_BORDER_COLOR = 0xffd700;

export class VendingGrid extends Container {
  private slots: Container[] = [];
  private slotBackgrounds: Graphics[] = [];
  private grid: Grid;
  private activeRules: SynergyRule[] = [];
  private selectedSlot: number | null = null;

  /** Fired when user clicks a grid slot. Handler receives slot index. */
  public onSlotClick: ((index: number) => void) | null = null;

  constructor() {
    super();
    this.grid = [null, null, null, null, null, null, null, null, null];
    this.buildGrid();
  }

  private buildGrid() {
    const totalSize = GRID_SIZE * SLOT_SIZE + (GRID_SIZE - 1) * SLOT_GAP + GRID_PADDING * 2;

    // Background panel
    const bg = new Graphics();
    bg.roundRect(0, 0, totalSize, totalSize, 12);
    bg.fill({ color: 0x1a1a1a });
    this.addChild(bg);

    // Title
    const title = new Text({
      text: "VENDING MACHINE",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x888888, align: "center" },
    });
    title.anchor.set(0.5, 0);
    title.x = totalSize / 2;
    title.y = 2;
    this.addChild(title);

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const { row, col } = gridPos(i);
      const slotContainer = new Container();
      const x = GRID_PADDING + col * (SLOT_SIZE + SLOT_GAP);
      const y = GRID_PADDING + row * (SLOT_SIZE + SLOT_GAP) + 16;
      slotContainer.x = x;
      slotContainer.y = y;

      const slotBg = new Graphics();
      this.drawSlotBackground(slotBg, EMPTY_COLOR, false);
      slotContainer.addChild(slotBg);

      // Make slot interactive
      slotBg.eventMode = "static";
      slotBg.cursor = "pointer";
      const index = i;
      slotBg.on("pointerdown", () => {
        this.onSlotClick?.(index);
      });

      // Empty label
      const emptyLabel = new Text({
        text: "Empty",
        style: { fontFamily: "monospace", fontSize: 12, fill: 0x555555, align: "center" },
      });
      emptyLabel.anchor.set(0.5);
      emptyLabel.x = SLOT_SIZE / 2;
      emptyLabel.y = SLOT_SIZE / 2;
      slotContainer.addChild(emptyLabel);

      this.addChild(slotContainer);
      this.slots.push(slotContainer);
      this.slotBackgrounds.push(slotBg);
    }
  }

  private drawSlotBackground(g: Graphics, color: number, hasSynergy: boolean) {
    g.clear();
    if (hasSynergy) {
      g.roundRect(-2, -2, SLOT_SIZE + 4, SLOT_SIZE + 4, 10);
      g.fill({ color: SYNERGY_BORDER_COLOR });
    }
    g.roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 8);
    g.fill({ color });
  }

  public updateGrid(grid: Grid, activeRules: SynergyRule[]) {
    this.grid = grid;
    this.activeRules = activeRules;
    this.refresh();
  }

  public setSelectedSlot(index: number | null) {
    this.selectedSlot = index;
    this.refresh();
  }

  private refresh() {
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const slot = this.slots[i];
      const product = this.grid[i];
      const slotBg = this.slotBackgrounds[i];

      // Remove old content (keep background at index 0)
      while (slot.children.length > 1) {
        slot.removeChildAt(1);
      }

      // Check synergies for this slot
      const synergies = product ? findSynergiesForSlot(this.grid, i, this.activeRules) : [];
      const hasSynergy = synergies.length > 0;
      const isSelected = this.selectedSlot === i;

      if (product) {
        this.drawSlotBackground(
          slotBg,
          isSelected ? SELECTED_COLOR : OCCUPIED_COLOR,
          hasSynergy,
        );
        this.renderProductInSlot(slot, product, synergies);
      } else {
        this.drawSlotBackground(slotBg, isSelected ? SELECTED_COLOR : EMPTY_COLOR, false);
        const emptyLabel = new Text({
          text: "Empty",
          style: { fontFamily: "monospace", fontSize: 12, fill: 0x555555, align: "center" },
        });
        emptyLabel.anchor.set(0.5);
        emptyLabel.x = SLOT_SIZE / 2;
        emptyLabel.y = SLOT_SIZE / 2;
        slot.addChild(emptyLabel);
      }
    }
  }

  private renderProductInSlot(slot: Container, product: Product, synergies: SynergyMatch[]) {
    // Product name
    const name = new Text({
      text: product.name,
      style: {
        fontFamily: "monospace",
        fontSize: 13,
        fill: 0xffffff,
        align: "center",
        wordWrap: true,
        wordWrapWidth: SLOT_SIZE - 12,
      },
    });
    name.anchor.set(0.5, 0);
    name.x = SLOT_SIZE / 2;
    name.y = 8;
    slot.addChild(name);

    // Price
    const price = new Text({
      text: `$${product.basePrice.toFixed(2)}`,
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x88dd88, align: "center" },
    });
    price.anchor.set(0.5, 0);
    price.x = SLOT_SIZE / 2;
    price.y = 40;
    slot.addChild(price);

    // Tag dots
    const tagStartX = SLOT_SIZE / 2 - ((product.tags.length - 1) * 16) / 2;
    product.tags.forEach((tag, idx) => {
      const dot = new Graphics();
      dot.circle(0, 0, 5);
      dot.fill({ color: TAG_COLORS[tag] ?? 0xffffff });
      dot.x = tagStartX + idx * 16;
      dot.y = 70;
      slot.addChild(dot);
    });

    // Tag labels
    const tagText = new Text({
      text: product.tags.join(" "),
      style: { fontFamily: "monospace", fontSize: 8, fill: 0x999999, align: "center" },
    });
    tagText.anchor.set(0.5, 0);
    tagText.x = SLOT_SIZE / 2;
    tagText.y = 80;
    slot.addChild(tagText);

    // Synergy multiplier indicator
    if (synergies.length > 0) {
      let mult = 1;
      for (const s of synergies) mult *= s.rule.multiplier;
      const multText = new Text({
        text: `x${mult.toFixed(1)}`,
        style: { fontFamily: "monospace", fontSize: 12, fill: 0xffd700, align: "center" },
      });
      multText.anchor.set(0.5, 0);
      multText.x = SLOT_SIZE / 2;
      multText.y = 96;
      slot.addChild(multText);
    }
  }

  public get gridWidth(): number {
    return GRID_SIZE * SLOT_SIZE + (GRID_SIZE - 1) * SLOT_GAP + GRID_PADDING * 2;
  }

  public get gridHeight(): number {
    return GRID_SIZE * SLOT_SIZE + (GRID_SIZE - 1) * SLOT_GAP + GRID_PADDING * 2 + 16;
  }
}
