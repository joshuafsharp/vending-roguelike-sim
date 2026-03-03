import { Container, Graphics, Text } from "pixi.js";
import { VendingGrid } from "../components/VendingGrid";
import { ProductList } from "../components/ProductList";
import { NightLog } from "../components/NightLog";
import { GameState } from "../../game/gameState";
import type { Product } from "../../game/types";

export class GameScreen extends Container {
  private vendingGrid: VendingGrid;
  private productList: ProductList;
  private nightLog: NightLog;
  private gameState: GameState;

  private selectedProduct: Product | null = null;

  // UI elements
  private runButton: Container;
  private runButtonBg: Graphics;
  private draftButton: Container;
  private draftButtonBg: Graphics;
  private skipButton: Container;
  private skipButtonBg: Graphics;
  private newRunButton: Container;
  private newRunButtonBg: Graphics;
  private moneyText: Text;
  private nightText: Text;
  private phaseText: Text;
  private rulesText: Text;

  private screenWidth = 800;
  private screenHeight = 600;

  constructor() {
    super();

    this.gameState = new GameState();

    // Build components
    this.vendingGrid = new VendingGrid();
    this.addChild(this.vendingGrid);

    this.productList = new ProductList();
    this.addChild(this.productList);

    this.nightLog = new NightLog();
    this.addChild(this.nightLog);

    // Money display
    this.moneyText = new Text({
      text: "$0.00",
      style: { fontFamily: "monospace", fontSize: 22, fill: 0x88dd88, fontWeight: "bold" },
    });
    this.addChild(this.moneyText);

    // Night counter
    this.nightText = new Text({
      text: "Night: 0",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0xaaaaaa },
    });
    this.addChild(this.nightText);

    // Phase indicator
    this.phaseText = new Text({
      text: "SETUP",
      style: { fontFamily: "monospace", fontSize: 12, fill: 0x666666 },
    });
    this.addChild(this.phaseText);

    // Active synergy rules display
    this.rulesText = new Text({
      text: "",
      style: { fontFamily: "monospace", fontSize: 10, fill: 0xffd700, wordWrap: true, wordWrapWidth: 380 },
    });
    this.addChild(this.rulesText);

    // Run Night button
    const { container: runBtn, bg: runBg } = this.createButton("RUN NIGHT", 0x4a7a4a);
    this.runButton = runBtn;
    this.runButtonBg = runBg;
    this.addChild(this.runButton);

    // Next Night (draft) button
    const { container: draftBtn, bg: draftBg } = this.createButton("NEXT NIGHT", 0x4a6a8a);
    this.draftButton = draftBtn;
    this.draftButtonBg = draftBg;
    this.draftButton.visible = false;
    this.addChild(this.draftButton);

    // Skip draft button
    const { container: skipBtn, bg: skipBg } = this.createButton("SKIP", 0x5a5a5a);
    this.skipButton = skipBtn;
    this.skipButtonBg = skipBg;
    this.skipButton.visible = false;
    this.addChild(this.skipButton);

    // New Run button
    const { container: newRunBtn, bg: newRunBg } = this.createButton("NEW RUN", 0x8a4a4a);
    this.newRunButton = newRunBtn;
    this.newRunButtonBg = newRunBg;
    this.addChild(this.newRunButton);

    // Wire up events
    this.setupEvents();

    // Initial render
    this.updateUI();
  }

  private createButton(
    label: string,
    color: number,
  ): { container: Container; bg: Graphics } {
    const container = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, 140, 40, 8);
    bg.fill({ color });
    bg.eventMode = "static";
    bg.cursor = "pointer";
    container.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: "monospace", fontSize: 14, fill: 0xffffff, fontWeight: "bold" },
    });
    text.anchor.set(0.5);
    text.x = 70;
    text.y = 20;
    container.addChild(text);

    return { container, bg };
  }

  private setupEvents() {
    // Grid slot clicked
    this.vendingGrid.onSlotClick = (index) => {
      if (this.gameState.phase !== "setup") return;

      const currentProduct = this.gameState.grid[index];

      if (this.selectedProduct) {
        // Place selected product in slot
        if (currentProduct) {
          // Swap: remove current product back to inventory if it's not the same
          if (currentProduct.id !== this.selectedProduct.id) {
            this.gameState.removeProduct(index);
          }
        }
        this.gameState.placeProduct(index, this.selectedProduct);
        this.selectedProduct = null;
      } else if (currentProduct) {
        // Remove product from slot
        this.gameState.removeProduct(index);
      }

      this.updateUI();
    };

    // Product selected from list
    this.productList.onProductSelect = (product) => {
      if (this.gameState.phase === "draft") {
        // In draft mode, picking a product adds it and returns to setup
        this.gameState.draftProduct(product);
        this.selectedProduct = product;
        this.updateUI();
        return;
      }

      if (this.gameState.phase !== "setup") return;

      // Toggle selection
      if (this.selectedProduct?.id === product.id) {
        this.selectedProduct = null;
      } else {
        this.selectedProduct = product;
      }
      this.updateUI();
    };

    // Run Night button
    this.runButtonBg.on("pointerdown", async () => {
      if (this.gameState.phase !== "setup") return;
      if (!this.gameState.hasProductsOnGrid()) return;

      this.selectedProduct = null;
      const result = this.gameState.runNight();
      this.updateUI();

      // Stream the results
      await this.nightLog.streamResult(result, 100);

      this.gameState.onSimulationComplete();
      this.updateUI();
    });

    // Draft / Next Night button
    this.draftButtonBg.on("pointerdown", () => {
      if (this.gameState.phase !== "results") return;
      this.gameState.startDraft();
      this.updateUI();
    });

    // Skip draft button
    this.skipButtonBg.on("pointerdown", () => {
      if (this.gameState.phase !== "draft") return;
      this.gameState.skipDraft();
      this.selectedProduct = null;
      this.updateUI();
    });

    // New Run button
    this.newRunButtonBg.on("pointerdown", () => {
      this.gameState.newRun();
      this.selectedProduct = null;
      this.nightLog.clear();
      this.nightLog.setTitle("NIGHT LOG");
      this.updateUI();
    });
  }

  private updateUI() {
    const { phase } = this.gameState;

    // Update grid
    this.vendingGrid.updateGrid(this.gameState.grid, this.gameState.activeRules);

    // Update product list based on phase
    if (phase === "draft") {
      this.productList.setHeader("DRAFT — Choose a product:");
      this.productList.setProducts(this.gameState.draftOptions);
    } else {
      this.productList.setHeader("YOUR PRODUCTS (click to select, then click a grid slot)");
      this.productList.setProducts(this.gameState.inventory);
    }

    this.productList.setSelectedProduct(this.selectedProduct?.id ?? null);

    // Update money
    this.moneyText.text = `$${this.gameState.run.totalMoney.toFixed(2)}`;

    // Update night counter
    this.nightText.text = `Night: ${this.gameState.run.nightNumber}`;

    // Update phase
    const phaseLabels: Record<string, string> = {
      setup: "SETUP — Place products, then Run Night",
      simulating: "SIMULATING...",
      results: "RESULTS — Click Next Night to continue",
      draft: "DRAFT — Pick a new product for your machine",
    };
    this.phaseText.text = phaseLabels[phase] ?? phase;

    // Update active rules display
    const rulesStr = this.gameState.activeRules
      .map((r) => `${r.name}: ${r.description} (x${r.multiplier})`)
      .join("\n");
    this.rulesText.text = `Active Synergies:\n${rulesStr}`;

    // Button visibility
    this.runButton.visible = phase === "setup";
    this.runButtonBg.eventMode = phase === "setup" && this.gameState.hasProductsOnGrid() ? "static" : "none";
    this.runButton.alpha = phase === "setup" && this.gameState.hasProductsOnGrid() ? 1 : 0.4;

    this.draftButton.visible = phase === "results";
    this.skipButton.visible = phase === "draft";

    this.layout();
  }

  private layout() {
    const padding = 20;

    // Grid: top-left area
    this.vendingGrid.x = padding;
    this.vendingGrid.y = 60;

    // Night log: to the right of grid
    this.nightLog.x = this.vendingGrid.x + this.vendingGrid.gridWidth + padding;
    this.nightLog.y = 60;

    // Active rules: below the night log
    this.rulesText.x = this.nightLog.x;
    this.rulesText.y = this.nightLog.y + this.nightLog.logHeight + 8;

    // Product list: below grid
    this.productList.x = padding;
    this.productList.y = this.vendingGrid.y + this.vendingGrid.gridHeight + padding;

    // Money display: top right
    this.moneyText.x = this.screenWidth - padding;
    this.moneyText.y = 12;
    this.moneyText.anchor.set(1, 0);

    // Night counter: top center-right
    this.nightText.x = this.screenWidth - padding;
    this.nightText.y = 40;
    this.nightText.anchor.set(1, 0);

    // Phase text: top left
    this.phaseText.x = padding;
    this.phaseText.y = 42;

    // Title
    // (we set this once)

    // Buttons: bottom area
    const buttonY = this.screenHeight - 60;
    this.runButton.x = padding;
    this.runButton.y = buttonY;

    this.draftButton.x = padding;
    this.draftButton.y = buttonY;

    this.skipButton.x = padding + 160;
    this.skipButton.y = buttonY;

    this.newRunButton.x = this.screenWidth - 160;
    this.newRunButton.y = buttonY;
  }

  public resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.layout();
  }

  public async show() {
    // Add title
    const title = new Text({
      text: "VENDING ROGUE",
      style: {
        fontFamily: "monospace",
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    title.x = 20;
    title.y = 10;
    this.addChild(title);

    this.updateUI();
  }
}
