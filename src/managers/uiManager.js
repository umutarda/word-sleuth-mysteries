export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.objectText = null;
        this.placeText = null;
        this.peopleText = null;
        this.eventText = null;
        this.skipButton = null;
        this.timerText = null;
    }

    preload() {
        // Load UI assets from IMAGE_ASSETS
        this.scene.imageAssets.uiElements.keys.forEach((key, index) => {
            this.scene.load.image(key, this.scene.imageAssets.uiElements.urls[index]);
        });
    }

    create() {
        this.createCategoryUI();
        this.createTimer();
        this.createSkipButton();
        this.setupSkipButton();
    }

    createCategoryUI() {
        const { width, height } = this.scene.cameras.main;
        const style = this.scene.config.game.categoryStyle;
        const titleStyle = this.scene.config.game.categoryTitleStyle;

        // Create icons and labels
        const iconKeys = this.scene.imageAssets.uiElements.keys;

        this.createCategoryIcon(120, height - 90, iconKeys[0]);
        this.createCategoryIcon(305, height - 90, iconKeys[1]);
        this.createCategoryIcon(490, height - 90, iconKeys[2]);
        this.createCategoryIcon(680, height - 90, iconKeys[3]);

        this.createCategoryText(120, height - 70, 'Object', titleStyle);
        this.createCategoryText(305, height - 70, 'Place', titleStyle);
        this.createCategoryText(490, height - 70, 'People', titleStyle);
        this.createCategoryText(680, height - 70, 'Event', titleStyle);

        this.objectText = this.createCategoryText(120, height - 50, '', style);
        this.placeText = this.createCategoryText(305, height - 50, '', style);
        this.peopleText = this.createCategoryText(490, height - 50, '', style);
        this.eventText = this.createCategoryText(680, height - 50, '', style);
    }

    createCategoryIcon(x, y, key) {
        return this.scene.add.image(x, y, key).setScale(0.05).setDepth(this.scene.config.game.uiDepth);
    }
    createCategoryText(x, y, text, style) {
        return this.scene.add.text(x, y, text, style)
            .setOrigin(0.5, 0)
            .setDepth(this.scene.config.game.uiDepth);
    }

    createTimer() {
        this.timerText = this.scene.add.text(700, 50, `Time: ${this.scene.roundManager.timeRemaining}`, {
            fill: '#fff'
        }).setDepth(this.scene.config.game.uiDepth);
    }

    createSkipButton() {
        this.skipButton = this.scene.add.text(
            this.scene.cameras.main.width - 100,
            10,
            'Skip Round',
            { font: '16px Courier', fill: '#ffffff' }
        )
            .setInteractive()
            .setDepth(this.scene.config.game.uiDepth);
    }

    setupSkipButton() {
        // Clear existing listeners to prevent duplicates
        this.skipButton.off('pointerdown');
        this.skipButton.off('pointerover');
        this.skipButton.off('pointerout');

        // Reattach event handlers
        this.skipButton.on('pointerdown', () => {
            this.scene.roundManager.endRound();
        })
            .on('pointerover', () => this.skipButton.setStyle({ fill: '#ffaaaa' }))
            .on('pointerout', () => this.skipButton.setStyle({ fill: '#ffffff' }));
    }
}