

export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgrounds = [...this.scene.imageAssets.backgrounds.keys];
        this.currentBg = null;
        this.bg = null;
        this.darkOverlay = null;
        this.mainCamera = this.scene.cameras.main;
    }

    preload() {
        this.scene.imageAssets.backgrounds.keys.forEach((key, index) => {
            this.scene.load.image(key, this.scene.imageAssets.backgrounds.urls[index]);
        });
    }

    create() {
        this.darkOverlay = this.scene.add.graphics({
            fillStyle: { color: 0x000000, alpha: 0.6 }
        });
        this.darkOverlay.fillRect(0, 0,
            this.mainCamera.width,
            this.mainCamera.height
        );

        this.changeBackground();
    }

    changeBackground() {
        const availableBackgrounds = this.backgrounds.filter(bg => bg !== this.currentBg);
        const newBg = Phaser.Utils.Array.GetRandom(availableBackgrounds);

        if (this.bg) {
            this.scene.tweens.add({
                targets: this.bg,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    this.bg.destroy();
                    this.createBackground(newBg);
                }
            });
        } else {
            this.createBackground(newBg);
        }

        this.currentBg = newBg;
    }

    createBackground(bgKey) {
        this.bg = this.scene.add.image(0, 0, bgKey)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDisplaySize(this.mainCamera.width, this.mainCamera.height);

        this.scaleImageToCover(this.bg);

        if (this.darkOverlay) this.darkOverlay.destroy();
        this.darkOverlay = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.6 } });
        this.darkOverlay.fillRect(0, 0, this.mainCamera.width, this.mainCamera.height);

        // Fade in new background
        this.scene.tweens.add({
            targets: this.bg,
            alpha: 1,
            duration: 1000
        });

    }


    scaleImageToCover(image) {
        const canvasWidth = this.mainCamera.width;
        const canvasHeight = this.mainCamera.height;

        // Calculate the scale factor for both width and height
        const scaleX = canvasWidth / image.width;
        const scaleY = canvasHeight / image.height;

        // Use the larger scale factor
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale);

        // Optionally, center the image if it overflows in one dimension
        if (scale === scaleX) {
            // If scaling to width, center vertically
            image.setY((canvasHeight - image.height * scale) / 2);
        } else {
            // If scaling to height, center horizontally
            image.setX((canvasWidth - image.width * scale) / 2);
        }
    }


}