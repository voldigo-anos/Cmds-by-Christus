const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "loli",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🍥 Image Loli aléatoire",
    longDescription: "Récupère une image Loli aléatoire depuis l'API",
    category: "image",
    guide: "{pn} pour recevoir une image Loli aléatoire"
  },

  onStart: async function({ api, event, message }) {
    const apiUrl = "https://archive.lick.eu.org/api/random/loli";

    try {
      message.reply("✨ Récupération de l'image Loli...");

      // Récupération de l'image en binaire
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `loli_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage({
        body: "🍥 Voici une image Loli aléatoire !",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image Loli.");
    }
  }
};