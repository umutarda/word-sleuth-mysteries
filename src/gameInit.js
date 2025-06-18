import Phaser from "phaser";
import { PhaserGameConfig } from "./scenes/config.js";
import { MainScene } from "./scenes/mainScene.js";

export function initializeGame() {
    // Set the scene in the config
    const config = {
        ...PhaserGameConfig,
        scene: [MainScene]
    };

    // Create and store the game instance
    const game = new Phaser.Game(config);
    window.phaserGame = game;
    
    return game;
}

// Initialize the game when this module is loaded
initializeGame();