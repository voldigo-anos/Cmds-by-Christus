const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "google",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🔍 Recherche Google Images",
    longDescription: "Récupère des images depuis Google selon le mot-clé fourni",
    category: "image",
    guide: "{pn} <mot-clé> [nombre]: recherche des images Google (par défaut 4)"
  },

  onStart: async function({ api, event, message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un mot-clé pour la recherche.");

    const query = args[0];
    const limit = Math.min(parseInt(args[1]) || 4, 20); // par défaut 4, max 20
    const apiUrl = `https://archive.lick.eu.org/api/search/googleimage?query=${encodeURIComponent(query)}`;

    try {
      message.reply(`🔍 Recherche de ${limit} images pour : "${query}"...`);

      const res = await axios.get(apiUrl);
      if (!res.data.status) return message.reply("❌ Erreur lors de la récupération des images.");

      const results = res.data.result.slice(0, limit);
      if (results.length === 0) return message.reply("❌ Aucune image trouvée.");

      const attachments = [];
      for (let i = 0; i < results.length; i++) {
        const imgData = await axios.get(results[i], { responseType: "arraybuffer" });
        const filePath = path.join(__dirname, "cache", `google_${Date.now()}_${i}.jpg`);
        fs.writeFileSync(filePath, imgData.data);
        attachments.push(fs.createReadStream(filePath));
      }

      api.sendMessage({
        body: `🖼 Résultats pour : "${query}"`,
        attachment: attachments
      }, event.threadID, () => {
        // nettoyage des fichiers temporaires
        attachments.forEach(a => fs.unlinkSync(a.path));
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la recherche.");
    }
  }
};