const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "htv",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Hentai TV Info",
    longDescription: "Affiche les informations d'un anime hentai avec miniature",
    category: "nsfw",
    guide: "{pn} <query>\nEx : {pn} loli"
  },

  onStart: async function({ args, message, event }) {
    const { threadID, messageID } = event;
    if (!args[0]) return message.reply(`❌ Veuillez fournir un mot-clé.\nEx : ${this.config.guide}`);

    const query = args.join(" ");
    const apiUrl = `https://archive.lick.eu.org/api/nsfw/hentai-tv?query=${encodeURIComponent(query)}`;
    const tempPath = path.join(__dirname, `htv_${Date.now()}.jpg`);

    try {
      const waitMsg = await message.reply("🔎✨ Recherche des infos en cours... ✨🔎");

      const response = await axios.get(apiUrl);
      if (!response.data.status || !response.data.result.length) {
        return message.reply(`❌ Aucun résultat trouvé pour : ${query}`);
      }

      // Choisir un résultat aléatoire
      const item = response.data.result[Math.floor(Math.random() * response.data.result.length)];

      // Télécharger la miniature
      const imgRes = await axios.get(item.thumbnail, { responseType: "arraybuffer" });
      fs.writeFileSync(tempPath, imgRes.data);

      // Envoyer le message
      await message.reply({
        body: `📺 𝗛𝗘𝗡𝗧𝗔𝗜 𝗧𝗩 📺\n\n🖼️ Titre : ${item.title}\n👀 Vues : ${item.views}\n🔗 Lien : ${item.url}\n\n✨💖 Enjoy! 💖✨`,
        attachment: fs.createReadStream(tempPath)
      });

      // Clear cache et supprimer message temporaire
      fs.unlinkSync(tempPath);
      await message.unsend(waitMsg.messageID);

    } catch (err) {
      console.error("Erreur HTV :", err);
      return message.reply("❌ Une erreur est survenue lors de la récupération des infos.", threadID, messageID);
    }
  }
};