import { setEngine } from "./app/getEngine";
import { GameScreen } from "./app/screens/GameScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#1E1E1E",
    resizeOptions: { minWidth: 900, minHeight: 700, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the game screen directly
  await engine.navigation.showScreen(GameScreen);
})();
