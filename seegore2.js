const axios = require("axios");

module.exports = {
  config: {
    name: "seegore",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "⚠️ Recherche et télécharge des vidéos gore",
    longDescription: "Recherche sur Seegore et télécharge directement les vidéos en répondant au numéro du résultat",
    category: "nsfw",
    guide: "{pn} <mot-clé>"
  },

  // Stock temporaire pour gérer l'interaction (mot-clé → résultats)
  cache: {},

  onStart: async function({ api, event, message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un mot-clé pour rechercher le contenu gore.");

    const query = args.join(" ");
    const searchUrl = `https://archive.lick.eu.org/api/search/seegore?query=${encodeURIComponent(query)}`;

    try {
      message.reply(`🔍 Recherche de contenu gore pour : "${query}"...`);

      const searchRes = await axios.get(searchUrl);
      if (!searchRes.data.status || !searchRes.data.result.length) return message.reply("❌ Aucun résultat trouvé.");

      // Garde les résultats en cache pour l'utilisateur
      this.cache[event.senderID] = searchRes.data.result.slice(0, 5);

      // Affiche les 5 premiers résultats avec index
      let text = "Voici les résultats trouvés :\n\n";
      this.cache[event.senderID].forEach((item, i) => {
        text += `${i + 1}. ${item.judul} (${item.uploader})\n`;
        text += `Lien: ${item.link}\n\n`;
      });
      text += "➡️ Répondez simplement avec le numéro du résultat que vous souhaitez télécharger.";
      return message.reply(text);

    } catch (err) {
      return message.reply("❌ Une erreur est survenue lors de la recherche.");
    }
  },

  onChat: async function({ api, event, message }) {
    const num = parseInt(event.body);
    if (!num || num < 1 || num > 5) return; // valide le numéro
    if (!this.cache[event.senderID]) return; // aucun résultat en cache

    const item = this.cache[event.senderID][num - 1];

    // Téléchargement via l'API download
    const downloadUrl = `https://archive.lick.eu.org/api/download/seegore?url=${encodeURIComponent(item.link)}`;

    try {
      const downloadRes = await axios.get(downloadUrl);
      if (!downloadRes.data.status) return message.reply("❌ Impossible de télécharger la vidéo.");

      const videoUrl = downloadRes.data.result.link;
      await message.reply({
        body: `🎬 ${downloadRes.data.result.judul}\n👀 ${downloadRes.data.result.views} vues\n💬 ${downloadRes.data.result.comment} commentaires`,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      });

      // Supprime le cache après téléchargement
      delete this.cache[event.senderID];

    } catch (err) {
      return message.reply("❌ Une erreur est survenue lors du téléchargement de la vidéo.");
    }
  }
};