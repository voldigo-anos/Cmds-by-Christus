const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cosplay",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎭 Cosplay aléatoire",
    longDescription: "Récupère une image cosplay aléatoire depuis l'API",
    category: "image",
    guide: "{pn} pour recevoir une image cosplay aléatoire"
  },

  onStart: async function({ api, event, message }) {
    const apiUrl = "https://archive.lick.eu.org/api/random/cosplay";

    try {
      message.reply("✨ Récupération de l'image cosplay...");

      // Récupération de l'image en binaire
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, "cache", `cosplay_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage({
        body: "🎭 Voici une image cosplay aléatoire !",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération de l'image cosplay.");
    }
  }
};