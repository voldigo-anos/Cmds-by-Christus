const axios = require("axios");

module.exports = {
  config: {
    name: "mistral",
    aliases: ["mixtral", "mistralai"],
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Chat with Mistral AI" },
    longDescription: { en: "Talk with Mistral AI (Mixtral-8x7B) model." },
    category: "ai",
    guide: { en: "Use: !mistral <message>\nExample: !mistral who are you" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "⚠ Please provide a message to start chatting.\nExample: !mistral who are you",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get("https://arychauhann.onrender.com/api/heurist", {
        params: { prompt, model: "mistralai/mixtral-8x7b-instruct" }
      });

      if (!response.data || !response.data.result) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("❌ Mistral AI did not return a response.", event.threadID, event.messageID);
      }

      const { result } = response.data;

      api.sendMessage(`${result}`, event.threadID, (err) => {
        if (err) return;
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ An error occurred while contacting Mistral AI.", event.threadID, event.messageID);
    }
  }
};