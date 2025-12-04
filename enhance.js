const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "enhance",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "✨ Améliore la qualité d'une image (HD)",
    longDescription: "Transforme ton image en version HD en utilisant l’API iHancer",
    category: "image",
    guide: "{pn} (en reply à une photo)"
  },

  onStart: async function ({ message, event, api }) {
    try {
      // Vérifie si on reply à une image
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Répond à une image pour l’améliorer en HD !");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("❌ Réponds uniquement à une *photo*, pas à un autre type de fichier.");
      }

      const imageUrl = encodeURIComponent(attachment.url);
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const waitMsg = await message.reply("🌸╭──────────────╮\n     🔧 Amélioration en cours...\n     Patiente un instant 💫\n╰──────────────╯");

      // Appel API
      const apiUrl = `https://aryanapi.up.railway.app/api/ihancer?url=${imageUrl}&type=&level=`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      // Sauvegarde du fichier
      const outputPath = path.join(cacheDir, `enhanced_${Date.now()}.jpg`);
      fs.writeFileSync(outputPath, response.data);

      await message.reply({
        body: [
          "╭─━─━─━─━─━─━─╮",
          " ✨ 𝗜𝗺𝗮𝗴𝗲 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 ✨",
          "   🌸 Version HD générée avec succès 🌸",
          "╰─━─━─━─━─━─━─╯"
        ].join("\n"),
        attachment: fs.createReadStream(outputPath)
      });

      // Supprime message d’attente
      await api.unsendMessage(waitMsg.messageID);

      // Clear cache automatique (10 min)
      const files = await fs.readdir(cacheDir);
      const now = Date.now();
      for (const file of files) {
        const fPath = path.join(cacheDir, file);
        const stat = await fs.stat(fPath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(fPath).catch(() => {});
        }
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Une erreur est survenue pendant l’amélioration de l’image.");
    }
  }
};