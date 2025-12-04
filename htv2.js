const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "htv",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Hentai TV info + image",
    longDescription: "Affiche les infos d'un hentai TV et envoie l'image",
    category: "nsfw",
    guide: "{pn} <query>"
  },

  onStart: async function({ api, event, args, message }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer une requête !\nEx: htv loli");

    const query = args.join(" ");
    const apiUrl = `https://archive.lick.eu.org/api/nsfw/hentai-tv?query=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl);
      if (!res.data.status || !res.data.result || res.data.result.length === 0) 
        return message.reply("❌ Aucun résultat trouvé pour cette requête.");

      const results = res.data.result.slice(0, 10); // on prend max 10 résultats
      let msg = "📺 Voici les résultats :\n\n";
      results.forEach((item, i) => {
        msg += `${i + 1}. 🎬 ${item.title}\n👁️ Vues: ${item.views}\n\n`;
      });

      message.reply(msg);

      // On attend la réponse de l'utilisateur
      global.GoatBot.onReply.set(event.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        results
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue lors de la récupération des données.");
    }
  },

  onReply: async function({ event, api, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) {
      return api.sendMessage("❌ Veuillez entrer un numéro valide correspondant à la liste.", event.threadID);
    }

    const selected = Reply.results[choice - 1];
    const filePath = path.join(__dirname, "cache", `htv_${Date.now()}.jpg`);

    try {
      const imgData = (await axios.get(selected.thumbnail, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, imgData);

      api.sendMessage({
        body: `🎬 ${selected.title}\n👁️ Vues: ${selected.views}\n🔗 Lien: ${selected.url}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de récupérer l'image.", event.threadID);
    }
  }
};