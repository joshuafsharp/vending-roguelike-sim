import { Container, Graphics, Text } from "pixi.js";
import type { NpcEvent, SimulationResult } from "../../game/types";

const LOG_WIDTH = 380;
const LOG_HEIGHT = 420;
const LINE_HEIGHT = 16;
const MAX_VISIBLE_LINES = Math.floor((LOG_HEIGHT - 40) / LINE_HEIGHT);

export class NightLog extends Container {
  private bg: Graphics;
  private logContainer: Container;
  private lines: Text[] = [];
  private lineData: string[] = [];
  private scrollOffset = 0;
  private titleText: Text;
  private totalText: Text;

  constructor() {
    super();

    // Background panel
    this.bg = new Graphics();
    this.drawBackground();
    this.addChild(this.bg);

    // Title
    this.titleText = new Text({
      text: "NIGHT LOG",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x888888 },
    });
    this.titleText.x = 10;
    this.titleText.y = 4;
    this.addChild(this.titleText);

    // Scrollable log area
    this.logContainer = new Container();
    this.logContainer.x = 10;
    this.logContainer.y = 24;
    this.addChild(this.logContainer);

    // Mask for log area
    const mask = new Graphics();
    mask.rect(10, 24, LOG_WIDTH - 20, LOG_HEIGHT - 64);
    mask.fill({ color: 0xffffff });
    this.addChild(mask);
    this.logContainer.mask = mask;

    // Total display at bottom
    this.totalText = new Text({
      text: "",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0x88dd88 },
    });
    this.totalText.x = 10;
    this.totalText.y = LOG_HEIGHT - 32;
    this.addChild(this.totalText);
  }

  private drawBackground() {
    this.bg.clear();
    this.bg.roundRect(0, 0, LOG_WIDTH, LOG_HEIGHT, 12);
    this.bg.fill({ color: 0x1a1a1a });
  }

  public clear() {
    this.lineData = [];
    this.scrollOffset = 0;
    this.totalText.text = "";
    this.refreshDisplay();
  }

  public setTitle(text: string) {
    this.titleText.text = text;
  }

  /**
   * Add a single line to the log and auto-scroll to bottom.
   */
  public addLine(text: string) {
    this.lineData.push(text);
    // Auto-scroll to show latest
    if (this.lineData.length > MAX_VISIBLE_LINES) {
      this.scrollOffset = this.lineData.length - MAX_VISIBLE_LINES;
    }
    this.refreshDisplay();
  }

  public setTotal(amount: number) {
    this.totalText.text = `TOTAL: $${amount.toFixed(2)}`;
  }

  /**
   * Display a full simulation result, adding all events at once.
   */
  public showResult(result: SimulationResult) {
    this.clear();
    this.setTitle(`NIGHT ${result.nightNumber} LOG`);

    for (const event of result.events) {
      this.addLine(this.formatEvent(event));
      // Add synergy detail lines for purchases
      if (event.bought && event.synergies && event.synergies.length > 0) {
        for (const syn of event.synergies) {
          this.addLine(`  ↳ ${syn.rule.name} x${syn.rule.multiplier}`);
        }
      }
    }

    this.setTotal(result.totalEarnings);
  }

  /**
   * Stream events one by one with a delay. Returns a promise that resolves when done.
   */
  public async streamResult(result: SimulationResult, delayMs = 120): Promise<void> {
    this.clear();
    this.setTitle(`NIGHT ${result.nightNumber}`);

    let runningTotal = 0;

    for (const event of result.events) {
      this.addLine(this.formatEvent(event));

      if (event.bought && event.finalPrice) {
        runningTotal += event.finalPrice;

        if (event.synergies && event.synergies.length > 0) {
          for (const syn of event.synergies) {
            this.addLine(`  ↳ ${syn.rule.name} x${syn.rule.multiplier}`);
          }
        }
      }

      this.setTotal(runningTotal);
      await this.delay(delayMs);
    }

    this.setTotal(result.totalEarnings);
    this.setTitle(`NIGHT ${result.nightNumber} — COMPLETE`);
  }

  private formatEvent(event: NpcEvent): string {
    if (!event.bought) {
      return `NPC #${event.npcIndex + 1}: walks by...`;
    }

    const productName = event.product?.name ?? "???";
    const base = `$${event.basePrice?.toFixed(2)}`;
    const mult =
      event.multiplier && event.multiplier !== 1 ? ` x${event.multiplier.toFixed(1)}` : "";
    const final = `$${event.finalPrice?.toFixed(2)}`;

    if (mult) {
      return `NPC #${event.npcIndex + 1}: ${productName} ${base}${mult} = ${final}`;
    }
    return `NPC #${event.npcIndex + 1}: ${productName} ${final}`;
  }

  private refreshDisplay() {
    // Remove old text nodes
    for (const line of this.lines) {
      this.logContainer.removeChild(line);
      line.destroy();
    }
    this.lines = [];

    const visibleStart = this.scrollOffset;
    const visibleEnd = Math.min(this.lineData.length, visibleStart + MAX_VISIBLE_LINES);

    for (let i = visibleStart; i < visibleEnd; i++) {
      const text = new Text({
        text: this.lineData[i],
        style: {
          fontFamily: "monospace",
          fontSize: 11,
          fill: this.lineData[i].startsWith("  ↳") ? 0xffd700 : 0xcccccc,
        },
      });
      text.y = (i - visibleStart) * LINE_HEIGHT;
      this.logContainer.addChild(text);
      this.lines.push(text);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public get logWidth(): number {
    return LOG_WIDTH;
  }

  public get logHeight(): number {
    return LOG_HEIGHT;
  }
}
