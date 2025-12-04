const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rbg",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🖼️ Supprime l'arrière-plan d'une image",
    longDescription: "Enlève le fond d'une photo en un seul clic avec Barbie API.",
    category: "image",
    guide: "{pn} (en reply à une photo)"
  },

  onStart: async function ({ message, event }) {
    try {
      // Vérifie si on reply à une photo
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Répond à une image pour supprimer l'arrière-plan !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Tu dois répondre à une *photo* uniquement !");
      }

      const imageUrl = encodeURIComponent(attachment.url);
      const apiUrl = `https://aryanapi.up.railway.app/api/barbie?url=${imageUrl}`;

      const waitMsg = await message.reply("🪄╭──────────────╮\n   ✨ Suppression du fond en cours...\n   Patiente un instant 💫\n╰──────────────╯");

      // Appel API
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Téléchargement et cache
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outputPath = path.join(cacheDir, `rbg_${Date.now()}.png`);
      fs.writeFileSync(outputPath, res.data);

      // Envoie du résultat
      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " 🌟 𝗥𝗠𝗕 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ✅",
          "   🖼️ Fond supprimé avec succès",
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      await message.unsendMessage(waitMsg.messageID);

      // 🧹 Nettoyage du cache après 10 minutes
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
      message.reply("❌ Erreur : impossible de supprimer le fond de cette image.");
    }
  }
};