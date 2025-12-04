const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "📈 Améliore la résolution d'une image",
    longDescription: "Upscale ton image pour une qualité supérieure (2x, 4x...)",
    category: "image",
    guide: "{pn} (en reply à une photo)"
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // Vérifie si on reply à une image
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Répond à une image pour l’agrandir !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Tu dois répondre à une *photo* uniquement !");
      }

      // Par défaut scale=2, ou celui que l’utilisateur précise (ex: upscale 4)
      const scale = args[0] || 2;

      const imageUrl = encodeURIComponent(attachment.url);
      const apiUrl = `https://aryanapi.up.railway.app/api/imagewith?url=${imageUrl}&scale=${scale}`;

      const waitMsg = await message.reply("🪄╭──────────────╮\n   🔍 Amélioration de la résolution...\n   Patiente un peu 💫\n╰──────────────╯");

      // Requête API
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.url) {
        return message.reply("❌ Impossible d’obtenir l’image upscalée.");
      }

      // Télécharge et envoie
      const imgRes = await axios.get(data.url, { responseType: "arraybuffer" });
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const outputPath = path.join(cacheDir, `upscaled_${Date.now()}.jpg`);
      fs.writeFileSync(outputPath, imgRes.data);

      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " 🚀 𝗨𝗽𝘀𝗰𝗮𝗹𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ✅",
          `   ✨ Résolution augmentée x${scale}`,
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      // Supprime le message d’attente
      await api.unsendMessage(waitMsg.messageID);

      // 🔁 Clear cache automatique (10 min)
      const now = Date.now();
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        const fPath = path.join(cacheDir, file);
        const stat = await fs.stat(fPath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(fPath).catch(() => {});
        }
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Erreur : impossible d’upscaler cette image.");
    }
  }
};