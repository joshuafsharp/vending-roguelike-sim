import { Container, Graphics, Text } from "pixi.js";
import type { Product } from "../../game/types";

const ITEM_WIDTH = 140;
const ITEM_HEIGHT = 80;
const ITEM_GAP = 8;
const ITEMS_PER_ROW = 5;

const TAG_COLORS: Record<string, number> = {
  Drink: 0x4a90d9,
  Snack: 0xd9944a,
  Salty: 0xd9d94a,
  Sweet: 0xd94a90,
  Caffeine: 0x4ad990,
};

export class ProductList extends Container {
  private items: Container[] = [];
  private selectedProductId: string | null = null;
  private products: Product[] = [];

  /** Fired when user clicks a product. */
  public onProductSelect: ((product: Product) => void) | null = null;

  /** Header label for context ("Your Products", "Choose a product", etc.) */
  private headerText: Text;

  constructor() {
    super();
    this.headerText = new Text({
      text: "PRODUCTS",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x888888 },
    });
    this.addChild(this.headerText);
  }

  public setHeader(text: string) {
    this.headerText.text = text;
  }

  public setProducts(products: Product[]) {
    this.products = products;
    this.refresh();
  }

  public setSelectedProduct(productId: string | null) {
    this.selectedProductId = productId;
    this.refresh();
  }

  private refresh() {
    // Remove old items
    for (const item of this.items) {
      this.removeChild(item);
      item.destroy({ children: true });
    }
    this.items = [];

    this.products.forEach((product, idx) => {
      const col = idx % ITEMS_PER_ROW;
      const row = Math.floor(idx / ITEMS_PER_ROW);

      const item = new Container();
      item.x = col * (ITEM_WIDTH + ITEM_GAP);
      item.y = 24 + row * (ITEM_HEIGHT + ITEM_GAP);

      const isSelected = product.id === this.selectedProductId;

      // Background
      const bg = new Graphics();
      if (isSelected) {
        bg.roundRect(-2, -2, ITEM_WIDTH + 4, ITEM_HEIGHT + 4, 8);
        bg.fill({ color: 0x88bb88 });
      }
      bg.roundRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 6);
      bg.fill({ color: isSelected ? 0x3a4a3a : 0x2a2a2a });
      bg.eventMode = "static";
      bg.cursor = "pointer";
      bg.on("pointerdown", () => {
        this.onProductSelect?.(product);
      });
      item.addChild(bg);

      // Name
      const name = new Text({
        text: product.name,
        style: {
          fontFamily: "monospace",
          fontSize: 12,
          fill: 0xffffff,
          wordWrap: true,
          wordWrapWidth: ITEM_WIDTH - 8,
        },
      });
      name.x = 6;
      name.y = 6;
      item.addChild(name);

      // Price
      const price = new Text({
        text: `$${product.basePrice.toFixed(2)}`,
        style: { fontFamily: "monospace", fontSize: 11, fill: 0x88dd88 },
      });
      price.x = 6;
      price.y = 28;
      item.addChild(price);

      // Tag dots
      product.tags.forEach((tag, tagIdx) => {
        const dot = new Graphics();
        dot.circle(0, 0, 4);
        dot.fill({ color: TAG_COLORS[tag] ?? 0xffffff });
        dot.x = 10 + tagIdx * 14;
        dot.y = 55;
        item.addChild(dot);
      });

      // Tag text
      const tagText = new Text({
        text: product.tags.join(" "),
        style: { fontFamily: "monospace", fontSize: 7, fill: 0x777777 },
      });
      tagText.x = 6;
      tagText.y = 64;
      item.addChild(tagText);

      this.addChild(item);
      this.items.push(item);
    });
  }

  public get listWidth(): number {
    const cols = Math.min(this.products.length, ITEMS_PER_ROW);
    return cols * (ITEM_WIDTH + ITEM_GAP) - ITEM_GAP;
  }

  public get listHeight(): number {
    const rows = Math.ceil(this.products.length / ITEMS_PER_ROW);
    return 24 + rows * (ITEM_HEIGHT + ITEM_GAP);
  }
}
