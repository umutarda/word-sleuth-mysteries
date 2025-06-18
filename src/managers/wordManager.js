export class WordManager {
    constructor(scene) {
        this.scene = scene;
        this.words = [];
        this.highlightedWords = [];
        this.drawing = false;
        this.startPoint = new Phaser.Math.Vector2();
        this.currentPoint = new Phaser.Math.Vector2();
        this.drawnPath = null;
        this.graphics = null;
        this.endDrawingBound = this.endDrawing.bind(this);
        this.wordStyle = this.scene.config.game.wordStyle;
    }

    create() {
        this.graphics = this.scene.add.graphics({
            lineStyle: { width: 10, color: 0xff0000, alpha: 0.3 }
        });
        this.setupDrawing();
        this.setupKeyboardControls();
    }

    setupDrawing() {
        this.scene.input.on('pointerdown', (pointer) => {
            this.drawing = true;
            this.startPoint.set(pointer.x, pointer.y);
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (!this.drawing) return;
            this.currentPoint.set(pointer.x, pointer.y);
            this.updateDrawing();
            this.highlightIntersectedWords();
        });

        document.addEventListener('mouseup', this.endDrawingBound);
    }

    setupKeyboardControls() {
        this.scene.input.keyboard.on('keydown-CTRL', () => {
            this.scene.controlKeyDown = true;
        });

        this.scene.input.keyboard.on('keyup-CTRL', () => {
            this.scene.controlKeyDown = false;
            if (!this.drawing) this.resetHighlightedWords();
        });
    }

    updateDrawing() {
        this.graphics.clear();
        this.graphics.beginPath();
        this.graphics.moveTo(this.startPoint.x, this.startPoint.y);
        this.graphics.lineTo(this.currentPoint.x, this.currentPoint.y);
        this.graphics.strokePath();
        this.drawnPath = new Phaser.Geom.Line(
            this.startPoint.x, this.startPoint.y,
            this.currentPoint.x, this.currentPoint.y
        );
    }

    highlightIntersectedWords() {
        this.words.forEach(wordObj => {
            const bounds = wordObj.wordText.getBounds();
            if (Phaser.Geom.Intersects.LineToRectangle(this.drawnPath, bounds)) {
                if (!this.highlightedWords.includes(wordObj)) {
                    wordObj.wordText.setColor('#ff0000');
                    this.highlightedWords.push(wordObj);
                }
            } else if (!this.scene.controlKeyDown && this.highlightedWords.includes(wordObj)) {
                wordObj.wordText.setColor('#ffffff');
                this.highlightedWords = this.highlightedWords.filter(w => w !== wordObj);
            }
        });
    }

    endDrawing() {
        if (!this.drawing) return;
        this.drawing = false;
        this.checkWordSelection();
        this.graphics.clear();
        this.drawnPath = null;

        if (!this.scene.controlKeyDown) {
            this.resetHighlightedWords();
        }
    }

    resetHighlightedWords() {
        this.highlightedWords.forEach(wordObj => {
            wordObj.wordText.setColor('#ffffff');
        });
        this.highlightedWords = [];
    }

    checkWordSelection() {


        // Sort selected words by their index to ensure they are in sequence
        this.highlightedWords.sort((a, b) => a.index - b.index);

        // Now check for continuity and form a phrase if possible
        let phrase = "";
        let lastIdx = -2; // Start with an impossible index for continuity check
        for (let wordObj of this.highlightedWords) {
            // Check if this word is next in sequence
            if (wordObj.index === lastIdx + 1) {
                phrase += wordObj.wordText.text + " ";
                lastIdx = wordObj.index;
            } else {
                // Sequence broken, handle the last phrase
                if (phrase !== "") {
                    this.checkPhrase(phrase.trim());
                }
                phrase = wordObj.wordText.text + " "; // Start a new phrase
                lastIdx = wordObj.index;
            }

        }
        // Handle the final phrase
        if (phrase !== "") {


            this.checkPhrase(phrase.trim());
        }
    }

    checkPhrase(phrase) {


        phrase = phrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");


        console.log(this.scene.selectedInjectedWords);
        console.log(phrase);
        if (!this.scene.selectedInjectedWords.includes(phrase)) {
            const phraseWords = phrase.split(' ');
            let phraseIncludes = false;
            this.scene.selectedInjectedWords.forEach(s => {

                if (s != null) {


                    const injectPhrase = s.split(' ');


                    if (phraseWords.length == injectPhrase.length) {
                        if (phrase.includes(s)) {
                            phraseIncludes = true;
                            phrase = s;
                        }


                    }
                }


            });

            if (!phraseIncludes)
                return;
        }

        // If the score is non-zero, darken the highlighted words to indicate a found phrase
        this.highlightedWords.forEach(wordObj => {
            this.scene.foundWords.push(wordObj);
            wordObj.wordText.setColor('#8b0000');
        });


        let targetUILocation;
        const index = this.scene.selectedInjectedWords.indexOf(phrase);
        switch (index) {
            case 0: targetUILocation = this.scene.uiManager.objectText; break;
            case 1: targetUILocation = this.scene.uiManager.placeText; break;
            case 2: targetUILocation = this.scene.uiManager.peopleText; break;
            case 3: targetUILocation = this.scene.uiManager.eventText; break;
            default: targetUILocation = null;

        }

        this.scene.selectedInjectedWords[index] = null;

        const firstWordObj = this.highlightedWords[0];
        if (targetUILocation)
            this.scene.animationManager.showAndAnimatePhrase(firstWordObj.wordText.x, firstWordObj.wordText.y, phrase, targetUILocation);

        this.words = this.words.filter(w => !this.highlightedWords.includes(w));
        this.highlightedWords = [];



    }


    displayDescription(description, lineWidth = this.scene.cameras.main.width - 200, minSpaceWidth = 5) {

        let words = description.split(' ');
        let currentLine = [];
        let currentWidth = 0;
        let yPos = 100; // Starting Y position
        let spaceWidth = minSpaceWidth;
        this.words = []; // Reset or initialize the words array
        let lineWordStartIndex = 0;
        words.forEach((word, index) => {
            // Estimate the width of the current word
            let wordWidth = this.estimateWordWidth(word);
            let nextWordWidth = index < words.length - 1 ? this.estimateWordWidth(words[index + 1]) : 0;

            // Check if adding the current word would exceed the lineWidth
            if (currentWidth + wordWidth + nextWordWidth + spaceWidth > lineWidth && currentLine.length > 0) {
                // Display the current line because adding another word would exceed the limit
                this.justifyAndDisplayLine(currentLine, yPos, lineWidth, lineWordStartIndex);

                yPos += 30; // Move to the next line
                currentLine = []; // Reset current line
                currentWidth = 0; // Reset current width
                lineWordStartIndex = index;
            }


            // Add the current word to the line and update the width
            currentLine.push(word);
            currentWidth += wordWidth + spaceWidth;


            // If it's the last word, display what's remaining
            if (index === words.length - 1) {
                this.justifyAndDisplayLine(currentLine, yPos, lineWidth, lineWordStartIndex, true);
            }
        });
    }

    justifyAndDisplayLine(words, yPos, lineWidth, startIndex, lastLine = false, maxSpaceWidth = 50) {


        let totalWordsWidth = words.reduce((total, word) => total + this.estimateWordWidth(word), 0);
        let spaceWidth = (lineWidth - totalWordsWidth) / (words.length - 1);

        // Check and apply min space width
        spaceWidth = Math.max(5, spaceWidth);

        if (lastLine && spaceWidth > maxSpaceWidth)
            spaceWidth = this.estimateWordWidth(' ');


        let xPosition = 100;

        words.forEach((word, index) => {

            const wordText = this.scene.add.text(xPosition, yPos, word, this.wordStyle).setInteractive()
                .setDepth(this.scene.config.game.wordDepth);
            this.words.push({ wordText, index: startIndex + index }); // Maintain structure for interactivity
            xPosition += this.estimateWordWidth(word) + spaceWidth; // Position next word
        });
    }

    estimateWordWidth(word) {
        // Create a temporary text object to measure width
        let measureText = this.scene.add.text(0, 0, word, this.wordStyle);
        let wordWidth = measureText.width;
        measureText.destroy(); // Properly clean up the temporary text object
        return wordWidth;
    }

}