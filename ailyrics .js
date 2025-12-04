const axios = require("axios");

module.exports = {
  config: {
    name: "ailyrics",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI song lyrics" },
    longDescription: { en: "Creates lyrics based on your prompt using AI." },
    category: "ai",
    guide: { en: "Use: !lyrics <prompt>\nExample: !lyrics A girl" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "⚠️ Please provide a prompt for the lyrics.\nExample: !lyrics A girl",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(
        "https://aryxapi.onrender.com/api/ai/music/lyrics/v1",
        { params: { prompt } }
      );

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage(
          "❌ Could not generate lyrics, try again later.",
          event.threadID,
          event.messageID
        );
      }

      const lyrics = response.data.result;

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(
        `${lyrics}`,
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "❌ An error occurred while generating lyrics.",
        event.threadID,
        event.messageID
      );
    }
  },
};