export class RoundManager {
    constructor(scene) {
        this.scene = scene;
        this.timeRemaining = this.scene.config.game.roundTime;
        this.timerEvent = null;
        this.response = null;
    }

    startTimer() {
        this.timeRemaining = this.scene.config.game.roundTime;

        // Ensure timer text exists before updating it
        if (!this.scene.uiManager.timerText || !this.scene.uiManager.timerText.active) {
            this.scene.uiManager.timerText = this.scene.add.text(700, 50, `Time: ${this.timeRemaining}`, { fill: '#fff' }).setDepth(this.scene.config.game.uiDepth);
        } else {
            this.scene.uiManager.timerText.setText(`Time: ${this.timeRemaining}`);
        }

        if (this.timerEvent) this.timerEvent.remove();

        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                if (this.scene.uiManager.timerText && this.scene.uiManager.timerText.active) {
                    this.scene.uiManager.timerText.setText(`Time: ${this.timeRemaining}`);
                }
                if (this.timeRemaining <= 0) {
                    this.timerEvent.remove();
                    this.showMessage("Game Over - Starting New Round", false);
                    this.scene.time.delayedCall(2000, () => {
                        this.messageText?.destroy();
                        this.roundEnd();
                    });
                }
            },
            loop: true
        });
    }

    resetTimer() {
        this.stopTimer(); // Clear any existing timer
        this.timeRemaining = this.scene.config.game.roundTime;
        this.scene.uiManager.timerText?.setText(`Time: ${this.timeRemaining}`);

        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer.bind(this),
            loop: true
        });
    }

    updateTimer() {
        this.timeRemaining--;
        this.scene.uiManager.timerText.setText(`Time: ${this.timeRemaining}`);

        if (this.timeRemaining <= 0) {
            this.handleTimeOut();
        }
    }

    handleTimeOut() {
        this.stopTimer();
        this.showMessage("Time's Up! Next Round...", false);
        this.scene.time.delayedCall(1500, () => {
            this.messageText?.destroy();
            this.roundEnd();
        });
    }


    stopTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }
    startGame() {
        this.startNewRound();
    }

    startNewRound() {
        this.fetchInstanceData();
        this.scene.backgroundManager.changeBackground();

    }

    async fetchInstanceData() {
        if (this.scene.roundEndAnimationPlaying) {
            this.scene.time.delayedCall(1000, () => this.fetchInstanceData(), [], this);
            return;
        }

        this.scene.uiManager.skipButton.disableInteractive();
        this.scene.animationManager.showMessage("Generating...", false);

        try {
            this.response = await this.getCharacterResponse();

            if (this.allSelectedInjectedWordsIncluded()) {
                if (!this.scene.roundEndAnimationPlaying) {
                    this.scene.animationManager.messageText?.destroy();
                    this.scene.wordManager.displayDescription(this.response.description);
                    this.scene.uiManager.skipButton.setInteractive();
                    this.startTimer();
                    this.scene.animationManager.hideMessageText();
                }
            } else {
                this.retryFetch();
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            this.scene.animationManager.showMessage("Error generating content. Retrying...");
            this.retryFetch();
        }
    }

    async getCharacterResponse() {
        this.scene.chatManager.cleanChatHistory();
        this.scene.chatManager.addMessage('user', this.generatePrompt());
        return await this.scene.chatManager.getCharacterResponse(this.scene.config.llm.modelName);
    }

    retryFetch() {
        this.scene.injectedWords.object.words.push(this.scene.selectedInjectedWords[0]);
        // ... (push other words back)
        this.response = null;
        this.fetchInstanceData();
    }

    allSelectedInjectedWordsIncluded() {
        const description = this.response.description.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s{2,}/g, " ");
        return !this.scene.selectedInjectedWords.find(s => !description.includes(s));
    }

    generatePrompt() {
        // Determine the number of injected words to use

        // Fetch and remove injected words from the array
        this.scene.selectedInjectedWords = [this.scene.injectedWords.object.words.splice(Math.floor(Math.random() * this.scene.injectedWords.object.words.length), 1)[0],
        this.scene.injectedWords.place.words.splice(Math.floor(Math.random() * this.scene.injectedWords.place.words), 1)[0],
        this.scene.injectedWords.people.words.splice(Math.floor(Math.random() * this.scene.injectedWords.people.words), 1)[0],
        this.scene.injectedWords.event.words.splice(Math.floor(Math.random() * this.scene.injectedWords.event.words), 1)[0]];


        // Randomly select a topic from the topics array without removing it
        const selectedTopic = this.scene.topics[Math.floor(Math.random() * this.scene.topics.length)];

        // Construct the INSTANCE prompt with the selected injected words and include a topic
        const instancePrompt = `INSTANCE [${this.scene.selectedInjectedWords.map(word => `"${word.toLowerCase()}"`).join(', ')}] "${selectedTopic}"`;
        this.scene.selectedInjectedWords = this.scene.selectedInjectedWords.map(s => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " "));
        console.log(instancePrompt);
        console.log(this.scene.selectedInjectedWords);
        // Optionally, return the prompt if needed elsewhere
        return instancePrompt;
    }


    endRound() {
        if (this.scene.roundEndAnimationPlaying) return;
        this.scene.roundEndAnimationPlaying = true;
        this.stopTimer();

        // Clear any existing messages
        this.messageText?.destroy();

        // Disable interactions temporarily
        this.scene.uiManager.skipButton?.disableInteractive();
        this.scene.input.enabled = false;

        // Only animate and destroy the actual game words, not UI elements
        const wordsToDestroy = this.scene.wordManager.words.filter(word => word.wordText);

        // Animate out regular words
        wordsToDestroy.forEach(wordObj => {
            this.scene.tweens.add({
                targets: wordObj.wordText,
                alpha: 0,
                duration: 1500,
                ease: 'Power1',
                onComplete: () => {
                    if (wordObj.wordText && wordObj.wordText.active) {
                        wordObj.wordText.destroy();
                    }
                }
            });
        });

        // Animate found words with color change
        this.scene.foundWords.forEach(wordObj => {
            const originalColor = Phaser.Display.Color.HexStringToColor('#8b0000');
            const targetColor = Phaser.Display.Color.HexStringToColor('#ff0000');

            this.scene.tweens.addCounter({
                from: 0,
                to: 100,
                duration: 1500,
                ease: 'Power1',
                onUpdate: tween => {
                    if (wordObj.wordText && wordObj.wordText.active) {
                        const value = tween.getValue();
                        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(originalColor, targetColor, 100, value);
                        const hexR = Math.round(colorObject.r).toString(16).padStart(2, '0');
                        wordObj.wordText.setColor(`#${hexR}0000`);
                    }
                },
                onComplete: () => {
                    setTimeout(() => {
                        this.scene.tweens.add({
                            targets: wordObj.wordText,
                            alpha: 0,
                            duration: 1500,
                            ease: 'Power1',
                            onComplete: () => {
                                if (wordObj.wordText && wordObj.wordText.active) {
                                    wordObj.wordText.destroy();
                                }
                            }
                        });
                    }, 1500);
                }
            });
        });

        // Clean up arrays
        this.scene.wordManager.words = [];
        this.scene.foundWords = [];
        this.scene.wordManager.highlightedWords = [];

        // Start new round after animations complete
        this.scene.time.delayedCall(6000, () => {
            // Re-enable interactions
            this.scene.input.enabled = true;
            this.scene.roundEndAnimationPlaying = false;

            // Start new round
            this.startNewRound();
        });
    }
}