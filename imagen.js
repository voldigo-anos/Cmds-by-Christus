const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "imagen",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI images using Imagen (stream)" },
    longDescription: { en: "Send a prompt and the bot will generate an image using Imagen API (Aryan API), supports stream download." },
    category: "ai",
    guide: { en: "{pn} <prompt>\n\nExample:\n{pn} cat in a garden" }
  },

  onStart: async function ({ api, args, event }) {
    if (!args[0]) return api.sendMessage("❌ Please provide a prompt for Imagen.", event.threadID, event.messageID);

    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    const prompt = args.join(" ");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/imgen?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl, { responseType: "stream", timeout: 60000 });

      const filename = `imagen_${Date.now()}.jpeg`;
      const filepath = path.join(CACHE_DIR, filename);
      const writer = fs.createWriteStream(filepath);

      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `✨ Imagen AI image generated for prompt: "${prompt}"`,
          attachment: fs.createReadStream(filepath)
        }, event.threadID, () => {
          try { fs.unlinkSync(filepath); } catch {}
        }, event.messageID);

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on("error", (err) => {
        console.error("❌ File write error:", err.message);
        api.sendMessage("❌ Error saving the Imagen AI image.", event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("❌ Error generating Imagen AI image:", err.message);
      api.sendMessage("❌ Failed to generate Imagen AI image.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};