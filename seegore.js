const axios = require("axios");

module.exports = {
  config: {
    name: "seegore",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "⚠️ Recherche de vidéos/images gore",
    longDescription: "Récupère des vidéos/images gore selon le mot-clé fourni",
    category: "nsfw",
    guide: "{pn} <mot-clé>"
  },

  onStart: async function({ api, event, message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un mot-clé pour rechercher le contenu gore.");

    const query = args.join(" ");
    const apiUrl = `https://archive.lick.eu.org/api/search/seegore?query=${encodeURIComponent(query)}`;

    try {
      message.reply(`🔍 Recherche de contenu gore pour : "${query}"...`);

      const res = await axios.get(apiUrl);
      if (!res.data.status || !res.data.result.length) return message.reply("❌ Aucun résultat trouvé.");

      // Récupération du premier résultat par défaut
      const item = res.data.result[0];

      api.sendMessage({
        body: `⚠️ ${item.judul}\nUploader: ${item.uploader}\nLien: ${item.link}`,
        attachment: item.thumb ? await global.utils.getStreamFromURL(item.thumb) : undefined
      }, event.threadID);

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération du contenu gore.");
    }
  }
};