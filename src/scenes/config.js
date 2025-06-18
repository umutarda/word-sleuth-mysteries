import { GAME_CONFIG } from "../data/gameConfig.js";

export const MainSceneConfig = {
    key: 'MainScene',
    active: false,
    visible: true,
    // Phaser scene-specific configuration
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    // Game-specific configuration
    game: {
        roundTime: GAME_CONFIG.ROUND_TIME,
        uiDepth: GAME_CONFIG.UI_DEPTH,
        messageDepth: GAME_CONFIG.MESSAGE_DEPTH,
        wordDepth: GAME_CONFIG.WORD_DEPTH,
        wordStyle: {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#FFF'
        },
        categoryStyle: {
            font: '16px Courier',
            fill: '#ff0000'
        },
        categoryTitleStyle: {
            font: 'bold 16px Courier',
            fill: '#ff0000'
        }
    },

    llm:
    {
        modelName: GAME_CONFIG.MODEL_NAME,
        llmApiUrl: GAME_CONFIG.LLM_API_URL
    }
};

// Phaser game configuration
export const PhaserGameConfig = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: null, // Will be set when creating the game
    ...MainSceneConfig.physics // Spread the physics config
};