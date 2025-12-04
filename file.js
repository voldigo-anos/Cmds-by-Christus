const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "filecmd",
    aliases: ["file"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 2,
    shortDescription: "Voir le code d'une commande",
    longDescription: "Permet de visualiser le code source brut de n'importe quelle commande dans le dossier des commandes",
    category: "owner",
    guide: "{pn} <nomDeLaCommande>"
  },

  onStart: async function ({ args, message }) {
    const cmdName = args[0];
    if (!cmdName) return message.reply("❌ | Veuillez fournir le nom de la commande.\nExemple : filecmd fluxsnell");

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return message.reply(`❌ | La commande "${cmdName}" est introuvable dans ce dossier.`);

    try {
      const code = fs.readFileSync(cmdPath, "utf8");

      if (code.length > 19000) {
        return message.reply("⚠️ | Ce fichier est trop volumineux pour être affiché.");
      }

      return message.reply({
        body: `📄 | Code source de "${cmdName}.js":\n\n${code}`
      });
    } catch (err) {
      console.error(err);
      return message.reply("❌ | Erreur lors de la lecture du fichier.");
    }
  }
};