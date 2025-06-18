import Phaser from "phaser";

import { MainSceneConfig } from "./config.js";
import { ChatManager } from "../managers/chatManager.js";
import { WordManager } from "../managers/wordManager.js";
import { UIManager } from "../managers/uiManager.js";
import { RoundManager } from "../managers/roundManager.js";
import { BackgroundManager } from "../managers/backgroundManager.js";
import { AnimationManager } from "../managers/animationManager.js";
import { INJECTED_WORDS } from "../data/injectedWords.js";
import { TOPICS } from "../data/topics.js";
import { INIT_PROMPT } from "../data/initPrompt.js";
import { IMAGE_ASSETS } from "../data/imageAssets.js";
import { AUDIO_ASSETS } from "../data/audioAssets.js";


export class MainScene extends Phaser.Scene {
    constructor() {
        super(MainSceneConfig);

        this.config = MainSceneConfig;

        // Game state
        this.selectedInjectedWords = [];
        this.foundWords = [];
        this.roundEndAnimationPlaying = false;
        this.controlKeyDown = false;

        // Subsystems
        this.wordManager = null;
        this.uiManager = null;
        this.roundManager = null;
        this.backgroundManager = null;
        this.animationManager = null;
        

        // Data
        this.injectedWords = INJECTED_WORDS;
        this.topics = TOPICS;
        this.initPrompt = INIT_PROMPT;
        this.imageAssets = IMAGE_ASSETS;
        this.audioAssets = AUDIO_ASSETS;

        this.music = null;

    }

    preload() {
        // Initialize managers
        this.chatManager = new ChatManager(this);
        this.wordManager = new WordManager(this);
        this.uiManager = new UIManager(this);
        this.roundManager = new RoundManager(this);
        this.backgroundManager = new BackgroundManager(this);
        this.animationManager = new AnimationManager(this);

        // Load assets
        this.backgroundManager.preload();
        this.uiManager.preload();
        this.load.audio(this.audioAssets.music.keys[0], [this.audioAssets.music.urls[0]]);

    }

    create() {

        // Play the music and loop it
        this.music = this.sound.add(this.audioAssets.music.keys[0], { loop: true, volume: 0.2});
        this.music.play();

        // Setup game systems
        this.backgroundManager.create();
        this.uiManager.create();
        this.wordManager.create();

        // Start game flow
        this.roundManager.startGame();
    }

    update() {
        //this.wordManager.update();
    }

    // Cleanup when scene is destroyed
    destroy() {
        document.removeEventListener('mouseup', this.wordManager.endDrawingBound);
        super.destroy();
    }
}