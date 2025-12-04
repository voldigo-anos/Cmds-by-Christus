const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const axios = require("axios");

module.exports = {
  config: {
    name: "waifu2",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Envoie une illustration d’anime mignonne (SFW)",
    longDescription: "Récupère des images d’anime sûres (non R18) depuis l’API Lolicon.",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function({ message }) {
    try {
      const res = await axios.post("https://api.lolicon.app/setu/v2", {
        r18: 0,
        num: 1
      });

      if (!res.data || !res.data.data || res.data.data.length === 0) {
        return message.reply("❌ Aucune image trouvée.");
      }

      const imageUrl = res.data.data[0].urls.original || res.data.data[0].urls.regular;
      const filePath = path.join(__dirname, "cache/waifu2.jpg");

      const file = fs.createWriteStream(filePath);
      https.get(imageUrl, resImg => {
        resImg.pipe(file);
        file.on("finish", () => {
          const caption = `
✨ Illustration d’anime mignonne ✨

🌸 Crédit API : Christus
          `;
          message.reply({
            body: caption.trim(),
            attachment: fs.createReadStream(filePath)
          });
        });
      }).on("error", () => {
        message.reply("❌ Une erreur est survenue lors du téléchargement de l’image.");
      });

    } catch (error) {
      message.reply("❌ Une erreur est survenue lors de la récupération de l’image.");
    }
  }
};