const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "winw",
    version: "1.0",
    author: "Christus x Aesther",
    countDown: 10,
    role: 0,
    shortDescription: {
      fr: "Génère un meme 'Qui Gagnerait' en comparant les photos de profil de deux utilisateurs"
    },
    description: {
      fr: "Utilise deux mentions ou réponds à deux messages pour créer un meme 'Qui Gagnerait'"
    },
    category: "𝗙𝗨𝗡 & 𝗝𝗘𝗨",
    guide: {
      fr: "{p}winw @utilisateur1 vs @utilisateur2\nExemple : {p}winw @alice vs @bob"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { mentions, senderID, body, type, messageReply } = event;

    // Parse les mentions au format : +winw @utilisateur1 vs @utilisateur2
    // On attend exactement deux mentions à comparer

    // Récupère les IDs des utilisateurs mentionnés
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length < 2) {
      return message.reply("❌ | Veuillez mentionner deux utilisateurs à comparer. Exemple :\n+winw @utilisateur1 vs @utilisateur2");
    }

    // Récupère les deux premiers utilisateurs mentionnés
    const uid1 = mentionIDs[0];
    const uid2 = mentionIDs[1];

    // Récupère les URLs des photos de profil avec taille fixe
    const avatar1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
    const avatar2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      // Appelle l'API PopCat avec les deux images
      const res = await axios.get(`https://api.popcat.xyz/v2/whowouldwin?image1=${encodeURIComponent(avatar1)}&image2=${encodeURIComponent(avatar2)}`, {
        responseType: "arraybuffer"
      });

      // Sauvegarde l'image localement
      const filePath = path.join(__dirname, "cache", `winw_${uid1}_${uid2}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);

      message.reply({
        body: "🤼 Qui Gagnerait ? 🤼",
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ | Impossible de générer le meme 'Qui Gagnerait'. Veuillez réessayer plus tard.");
    }
  }
};