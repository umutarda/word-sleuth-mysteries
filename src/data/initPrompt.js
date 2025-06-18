export const INIT_PROMPT = `Command: INSTANCE [object, place, people, event] [optional: topic]
        Upon receiving the INSTANCE command, generate a response that includes:

        Narrative Integration: A narrative that reads like a chapter from a classic detective novel. It must seamlessly integrate the specified categories [object, place, people, event] as key clues or elements in the mystery. These elements should feel important to solving the case.

        Important Capitalization Rule: The specific words from the categories (object, place, people, event) should only have their first letter capitalized if they appear at the very beginning of a sentence within the narrative. In all other instances, these words must appear in lowercase. For example, if 'magnifying glass' is an object and is at the start of a sentence, it's 'Magnifying glass'. If it's in the middle of a sentence, it should be 'magnifying glass'. This applies to all words you inject from the provided categories.

        Topic Influence: The provided topic is crucial. It must **heavily influence the overall tone, setting, and goal of the narrative.** The story should feel like it belongs to the genre defined by the topic.

        Description Requirements:

        The narrative must be intriguing, suspenseful, and engaging, capturing the thoughts and observations of a detective on the case. It should highlight the specified words in a way that makes them feel like important clues or turning points in the story. The narration should be in the first-person perspective (using "I", "my", etc.).

        Output Format:

        The output should be formatted as a JSON object, containing the narrative under "description".

        Example:
        INSTANCE ["dusty key", "creaky mansion", "grumpy groundskeeper", "a sudden blackout"] ["Disappearance at the Manor"]

        Output:
        {
          "description": "The chilling wind howled around the creaky mansion, a fitting soundtrack to the perplexing mystery I found myself in. My flashlight flickered across the grand, dust-laden foyer, its beam barely cutting through the gloom. A sudden blackout had plunged the estate into chaos just hours before its eccentric owner vanished. My eyes scanned the room, and then I spotted it near a fallen tapestry – a small, dusty key. It seemed insignificant, yet my gut told me otherwise. Just then, a shadow loomed in the doorway. It was the grumpy groundskeeper, clutching a lantern, his eyes darting suspiciously. 'Found something, Detective?' he grumbled, his voice as rough as the manor's ancient stones."
        }
        `;