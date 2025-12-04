const axios = require("axios");

module.exports = {
  config: {
    name: "mangasearch",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔍 Recherche un manga",
    longDescription: "Cherche un manga via le nom et affiche les détails avec image et lien MyAnimeList",
    category: "anime",
    guide: "{pn} <nom_du_manga>"
  },

  onStart: async function({ message, event }) {
    try {
      if (!event.args || event.args.length === 0) {
        return message.reply("❌ Merci de fournir le nom d'un manga à rechercher.\nExemple : mangasearch Naruto");
      }

      const query = encodeURIComponent(event.args.join(" "));
      const apiUrl = `https://aryanapi.up.railway.app/api/mangasearch?query=${query}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || data.length === 0) {
        return message.reply(`❌ Aucun résultat trouvé pour "${event.args.join(" ")}"`);
      }

      // Affichage top 5 résultats
      let replyMsg = `╭─━─🔖 Résultats pour "${event.args.join(" ")}" ─━─╮\n`;
      data.slice(0, 5).forEach((manga, index) => {
        replyMsg += `\n📌 [${index + 1}] ${manga.title}\n`;
        replyMsg += `📖 Type : ${manga.type}\n`;
        replyMsg += `📚 Volume(s) : ${manga.vol}\n`;
        replyMsg += `⭐ Score : ${manga.score}\n`;
        replyMsg += `🔗 Lien : ${manga.link}\n`;
        replyMsg += `🖼️ Image : ${manga.imageUrl}\n`;
        replyMsg += `📝 Description : ${manga.description.length > 100 ? manga.description.slice(0, 100) + "..." : manga.description}\n`;
        replyMsg += "────────────────────────\n";
      });
      replyMsg += "╰─━─✨ Fin des résultats ─━─╯";

      message.reply(replyMsg);

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la recherche du manga.");
    }
  }
};