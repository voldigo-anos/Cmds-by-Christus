const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "1.0.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Chat with AI (asi1-mini)" },
    longDescription: { en: "Talk with AI using asi1-mini model. Works with both prefix command and normal chat 'ai <message>' plus continuous replies." },
    category: "ai",
    guide: { en: "{p}ai <message>\nOR just type: ai <message>\nThen reply to continue the chat." }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return api.sendMessage("⚠️ Please provide a message.", event.threadID, event.messageID);

    await handleChat(api, event, prompt);
  },

  onChat: async function ({ api, event }) {
    const body = event.body?.trim();
    if (!body) return;

    if (body.toLowerCase().startsWith("ai ")) {
      const prompt = body.slice(3).trim();
      if (prompt) await handleChat(api, event, prompt);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.type !== "message_reply") return;
    if (event.messageReply?.messageID !== Reply.messageID) return;

    const prompt = event.body?.trim();
    if (!prompt) return;

    await handleChat(api, event, prompt, true);
  }
};

async function handleChat(api, event, prompt, isReply = false) {
  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  try {
    const { data } = await axios.get("https://aryxapi.onrender.com/api/ai/heurist/pondera", {
      params: {
        action: "chat",
        message: prompt,
        modelId: "asi1-mini"
      }
    });

    const text = data?.result || "❌ No response from AI.";

    api.sendMessage(text, event.threadID, (err, info) => {
      if (err) api.setMessageReaction("❌", event.messageID, () => {}, true);
      else {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

global.GoatBot.onReply.set(info.messageID, {
          commandName: "ai",
          messageID: info.messageID
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Error while contacting AI API.", event.threadID, event.messageID);
  }
}