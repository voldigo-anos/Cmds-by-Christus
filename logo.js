const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "logo",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🎨 Crée un logo personnalisé",
    longDescription: "Génère un logo avec un titre, un slogan et une idée grâce à une API AI",
    category: "image",
    guide: "{pn} <titre> | <slogan> | <idée>\nEx : {pn} Naruto | Yes | OO"
  },

  onStart: async function({ args, message, event }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return message.reply(`❌ Utilisation :\n${this.config.guide}`);
    }

    // Parse arguments : titre | slogan | idée
    const input = args.join(" ").split("|").map(e => e.trim());
    const title = input[0] || "Titre";
    const slogan = input[1] || "Slogan";
    const idea = input[2] || "Idea";

    const apiUrl = `https://archive.lick.eu.org/api/ai/logo-gen?title=${encodeURIComponent(title)}&slogan=${encodeURIComponent(slogan)}&idea=${encodeURIComponent(idea)}`;

    const tempPath = path.join(__dirname, `logo_${Date.now()}.png`);

    try {
      message.reply("🎨 Génération du logo en cours...");

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempPath, response.data);

      await message.reply({
        body: `🖌️ Logo généré pour :\nTitre : ${title}\nSlogan : ${slogan}\nIdée : ${idea}`,
        attachment: fs.createReadStream(tempPath)
      });

      fs.unlinkSync(tempPath);

    } catch (err) {
      console.error("Erreur logo maker :", err);
      return message.reply("❌ Une erreur est survenue lors de la génération du logo.", threadID, messageID);
    }
  }
};