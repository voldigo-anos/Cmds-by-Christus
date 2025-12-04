const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "maxpic",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🖼️ Améliore une image en ultra HD",
    longDescription: "Transforme une image en version MaxStudio ultra nette et réaliste.",
    category: "image",
    guide: "{pn} (en reply à une photo)"
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Vérifie si on reply à une photo
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Répond à une image pour la rendre ultra HD !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Tu dois répondre à une *photo* uniquement !");
      }

      const imageUrl = encodeURIComponent(attachment.url);
      const apiUrl = `https://aryanapi.up.railway.app/api/maxstudio?url=${imageUrl}`;

      const waitMsg = await message.reply("🪄╭──────────────╮\n   🌌 Amélioration en cours...\n   Patiente un instant 💫\n╰──────────────╯");

      // Appel de l’API (pas de JSON, renvoie direct l’image)
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Enregistre dans le cache
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outputPath = path.join(cacheDir, `maxpic_${Date.now()}.jpg`);
      fs.writeFileSync(outputPath, res.data);

      // Envoie du résultat
      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " 🌟 𝗠𝗮𝘅𝗣𝗶𝗰 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ✅",
          "   🖼️ Image améliorée en qualité maximale",
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      await api.unsendMessage(waitMsg.messageID);

      // 🧹 Nettoyage auto du cache (10 minutes)
      const now = Date.now();
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(filePath).catch(() => {});
        }
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Erreur : impossible de traiter cette image avec MaxStudio.");
    }
  }
};