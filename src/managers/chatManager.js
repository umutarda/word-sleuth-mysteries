export class ChatManager {
    chatHistory;
    characterDescription;

    constructor(scene) {
        this.chatHistory = [];
        this.characterDescription = scene.initPrompt;
        this.baseUrl = scene.config.llm.apiUrl;
        this.llmOptions = scene.config.llm.options;
    }

    addMessage(role, content) {
        this.chatHistory.push({ role, content });
    }

    getChatHistory() {
        return this.chatHistory;
    }

    cleanChatHistory() {
        this.chatHistory = [];
    }

    async getCharacterResponse(model, maxTokens = 120) {
        const systemMessage = {
            role: 'system',
            content: this.characterDescription
        };

        const fullMessages = [systemMessage, ...this.chatHistory];

        const payload = {
            model: model,
            stream: false,
            format: {
                type: "object",
                properties: {
                    description: {
                        type: "string"
                    }
                },
                required: ["description"]
            },
            messages: fullMessages,
            options: this.llmOptions
        };

        // Ollama currently may or may not support this param, but we include it
        if (maxTokens) {
            payload.options.num_predict = maxTokens;
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            // Assuming returned message.content is JSON string with a `description` field
            let parsed;
            try {
                parsed = JSON.parse(data.message.content);
            } catch (e) {
                parsed = JSON.parse(data.message.content + `..."}`);
            }

            return parsed;
        } catch (error) {
            console.error("Error during Ollama chat request:", error);
            return { description: "Error generating response." };
        }
    }
}
