const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "💞 Envoie une photo de couple (PDP)",
    longDescription: "Génère aléatoirement un couple (garçon + fille) pour photo de profil 💑",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const waitMsg = await message.reply("💫╭────── ✦ Chargement du couple ✦ ──────╮\n     Patiente un instant, Cupidon cherche ton duo 💘\n╰────────────────────────────────────────╯");

    try {
      const res = await axios.get("https://sandipbaruwal.onrender.com/dp");
      if (!res.data || !res.data.male || !res.data.female) {
        await message.reply("❌ Erreur : API invalide ou réponse incomplète.");
        return;
      }

      const maleUrl = res.data.male;
      const femaleUrl = res.data.female;

      const malePath = path.join(cacheDir, `male_${Date.now()}.jpg`);
      const femalePath = path.join(cacheDir, `female_${Date.now()}.jpg`);

      const [maleImg, femaleImg] = await Promise.all([
        axios.get(maleUrl, { responseType: "arraybuffer" }),
        axios.get(femaleUrl, { responseType: "arraybuffer" })
      ]);

      fs.writeFileSync(malePath, maleImg.data);
      fs.writeFileSync(femalePath, femaleImg.data);

      const body = [
        "╭─━─━─━─━─━─━─╮",
        " 💞 𝗖𝗼𝘂𝗽𝗹𝗲 𝗣𝗗𝗣 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿 💞",
        "   💫 Ton couple du jour 💫",
        "╰─━─━─━─━─━─━─╯"
      ].join("\n");

      await message.reply({
        body,
        attachment: [
          fs.createReadStream(malePath),
          fs.createReadStream(femalePath)
        ]
      });

      // Nettoyage immédiat
      try {
        fs.unlinkSync(malePath);
        fs.unlinkSync(femalePath);
      } catch (e) {}

      // Clear cache (supprimer vieux fichiers > 10 min)
      const files = await fs.readdir(cacheDir);
      const now = Date.now();
      for (const file of files) {
        const fPath = path.join(cacheDir, file);
        const stat = await fs.stat(fPath);
        if (now - stat.mtimeMs > 10 * 60 * 1000) {
          await fs.unlink(fPath).catch(() => {});
        }
      }

      await message.unsend(waitMsg.messageID);
    } catch (err) {
      console.error(err);
      await message.unsend(waitMsg.messageID);
      message.reply("❌ Une erreur est survenue lors de la récupération du couple.");
    }
  }
};