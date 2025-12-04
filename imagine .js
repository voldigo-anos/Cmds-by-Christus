const axios = require('axios');

module.exports = {
  config: {
    name: "imagine",
    aliases: ["ima"],
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate image using AI"
    },
    longDescription: {
      en: "Send a prompt to the AI image generation API and get back an image."
    },
    category: "ai",
    guide: {
      en: "{pn} [prompt text]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\nExample: imagine a beautiful sunset over the mountains",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("🍓", event.messageID, () => {}, true);

    const apiUrl = `http://65.109.80.126:20409/aryan/imagine?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      await api.sendMessage({
        body: `✅  voici l'Image que vous aviez demandé!\n\n📝 Prompt: ${prompt}`,
        attachment: response.data
      }, event.threadID, null, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error("AI Image API Error:", error.message || error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ Image generation failed from the AI API.", event.threadID, event.messageID);
    }
  }
};