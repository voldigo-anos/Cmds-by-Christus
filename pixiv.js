const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pixiv",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎨 Pixiv NSFW Random Image",
    longDescription: "Récupère une image NSFW Pixiv aléatoire selon la recherche",
    category: "nsfw",
    guide: "{pn} <mot-clé>\nEx : pixiv loli"
  },

  onStart: async function(data) {
    const api = data.api;
    const event = data.event;
    const message = data.message;
    const args = data.args;

    if (!args || args.length === 0) {
      return message.reply("❌ Veuillez fournir un mot-clé.\nEx : pixiv loli");
    }

    const query = args.join("+");
    const apiUrl = `https://archive.lick.eu.org/api/nsfw/pixiv?query=${query}`;

    try {
      message.reply("🎨 Récupération de l'image Pixiv...");

      // Récupération de l'image en binaire
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `pixiv_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage({
        body: `✨ Voici une image Pixiv pour le mot-clé : "${args.join(" ")}"`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image.");
    }
  }
};