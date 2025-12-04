const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "fluxpro",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI images using FluxPro (stream)" },
    longDescription: { en: "Send a prompt and the bot will generate an image using FluxPro API ( fluxai.pro ), supports stream download." },
    category: "ai",
    guide: { en: "{pn} <prompt>\n\nExample:\n{pn} cat in space" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Please provide a prompt for FluxPro.", event.threadID, event.messageID);

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    const prompt = args.join(" ");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/fluxpro?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl, { responseType: "stream", timeout: 60000 });

      const filename = `fluxpro_${Date.now()}.jpeg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `✨ Image generer par FluxPro: "${prompt}"`,
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => {
          try { fs.unlinkSync(filepath); } catch {}
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ File write error:", err.message);
        api.sendMessage("❌ Error saving the FluxPro AI image.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Error generating FluxPro AI image:", err.message);
      api.sendMessage("❌ Failed to generate FluxPro AI image.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};