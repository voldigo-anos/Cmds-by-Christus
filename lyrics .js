const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎵 Recherche de paroles de chanson",
    longDescription: "Récupère les paroles d'une chanson selon le mot-clé fourni",
    category: "text",
    guide: "{pn} <nom de l'artiste ou chanson>"
  },

  onStart: async function({ api, event, message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer le nom de l'artiste ou de la chanson.");

    const query = args.join(" ");
    const apiUrl = `https://archive.lick.eu.org/api/search/lyrics?query=${encodeURIComponent(query)}`;

    try {
      message.reply(`🔍 Recherche des paroles pour : "${query}"...`);

      const res = await axios.get(apiUrl);
      if (!res.data.status) return message.reply("❌ Aucune paroles trouvées.");

      const result = res.data.result;
      const lyricsText = result.lyrics.length > 2000 ? result.lyrics.slice(0, 2000) + "\n\n[...]" : result.lyrics;

      api.sendMessage({
        body: `🎶 ${result.title}\n\n${lyricsText}`,
        attachment: result.thumb ? await global.utils.getStreamFromURL(result.thumb) : undefined
      }, event.threadID);

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération des paroles.");
    }
  }
};