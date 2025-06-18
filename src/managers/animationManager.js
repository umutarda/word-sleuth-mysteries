export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.messageText = null; 
    }

    showAndAnimatePhrase(x, y, phrase, targetLocation) {
        const phraseText = this.scene.add.text(x, y, phrase, { 
            fill: '#f00', 
            font: '16px Courier' 
        });

        this.scene.tweens.add({
            targets: phraseText,
            x: targetLocation.x,
            y: targetLocation.y,
            alpha: 0,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => {
                phraseText.destroy();
                targetLocation.text = phrase;
                if (!this.scene.selectedInjectedWords.find(s => s != null)) {
                    this.scene.roundManager.stopTimer(); // Completely stop timer on win
                    setTimeout(() => this.scene.roundManager.endRound(), 500);
                }
            }
        });
    }

    hideMessageText() 
    {
        this.messageText?.destroy();
        this.messageText = null;
    }
    showMessage(message, autoHide = true) {
        if (this.messageText)
            return;
        
        this.messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            message,
            {
                font: '24px Courier',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(this.scene.config.game.messageDepth);

        if (autoHide) {
            this.scene.time.delayedCall(2000, () => {
                messageText.destroy();
            });
        }
    }
}