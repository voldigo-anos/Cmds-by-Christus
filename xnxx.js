const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports = {
  config: {
    name: "xnxx",
    version: "1.4",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    shortDescription: "Rechercher des vidéos xnxx",
    longDescription: "Rechercher des vidéos xnxx et télécharger en qualité faible/élevée/HLS au format mp4",
    category: "nsfw",
    guide: "{pn} <recherche>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("❌ Veuillez fournir une recherche", event.threadID, event.messageID);
    let q = encodeURIComponent(args.join(" "));
    try {
      let res = await axios.get(`https://aryanapi.up.railway.app/api/xnxxsearch?query=${q}`);
      let data = res.data;
      let list = Object.keys(data).filter(k => !isNaN(k)).slice(0, 6).map(k => data[k]);

      let msg = `🔞 Résultats pour : ${args.join(" ")}\n\n`;
      list.forEach((vid, i) => {
        msg += `${i + 1}. ${vid.title}\n👤 ${vid.uploader || "Inconnu"}\n👁️ ${vid.views} | ⏱️ ${vid.duration}\n🔗 ${vid.link}\n\n`;
      });

      api.sendMessage(
        msg + "Répondez avec 1-6 pour choisir une vidéo.",
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            stage: "chooseVideo",
            author: event.senderID,
            results: list
          });
        },
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Erreur lors de la récupération des résultats", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID != Reply.author) return;

    if (Reply.stage === "chooseVideo") {
      let choice = parseInt(event.body);
      if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
        return api.sendMessage("❌ Choix invalide", event.threadID, event.messageID);

      let vid = Reply.results[choice - 1];
      api.sendMessage(
        `📹 Vidéo sélectionnée : ${vid.title}\nRépondez avec :\n1️⃣ Qualité faible\n2️⃣ Qualité élevée\n3️⃣ Qualité HLS`,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            stage: "chooseQuality",
            author: Reply.author,
            video: vid
          });
        },
        event.messageID
      );
    }

    else if (Reply.stage === "chooseQuality") {
      let qual = parseInt(event.body);
      if (![1, 2, 3].includes(qual)) return api.sendMessage("❌ Choix invalide", event.threadID, event.messageID);

      let vid = Reply.video;
      try {
        let res = await axios.get(`https://aryanapi.up.railway.app/api/xnxxdl?url=${encodeURIComponent(vid.link)}`);
        let data = res.data;
        if (!data.status) return api.sendMessage("❌ Échec du téléchargement", event.threadID, event.messageID);

        let fileURL;
        if (qual === 1) fileURL = data.files.low;
        else if (qual === 2) fileURL = data.files.high;
        else fileURL = data.files.hls;

        let filePath = path.join(__dirname, `cache/${event.senderID}_video.mp4`);

        await new Promise(resolve => {
          request(fileURL).pipe(fs.createWriteStream(filePath)).on("close", resolve);
        });

        api.sendMessage(
          {
            body: `📹 ${data.title}\n⏱️ ${data.duration}s\n👤 ${data.info}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );

      } catch (e) {
        api.sendMessage("❌ Erreur lors du téléchargement de la vidéo", event.threadID, event.messageID);
      }
    }
  }
};