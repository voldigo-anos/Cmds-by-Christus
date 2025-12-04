const fs = require('fs'); // Module pour la manipulation de fichiers
const path = require('path'); // Module pour la manipulation de chemins de fichiers
const axios = require('axios'); // Module pour les requêtes HTTP

const baseApiUrl = async () => {
  const base = await axios.get('https://raw.githubusercontent.com/Saim12678/Saim/main/baseApiUrl.json');
  return base.data.api; // Récupère l'URL de l'API de base depuis un fichier JSON en ligne
};

module.exports = {
  config: {
    name: "gist", // Nom de la commande
    version: "2.1", // Version de la commande
    role: 4, // Seul le développeur (role 4) peut utiliser la commande
    author: "Christus", // Auteur de la commande
    usePrefix: true, // La commande utilise un préfixe
    description: "Génère un lien Gist à partir du code en réponse ou de fichiers locaux du bot", // Description de la commande
    category: "convert", // Catégorie de la commande
    guide: { // Guide d'utilisation de la commande
      en: "{pn} → Répondre à un extrait de code pour créer un Gist\n{pn} [nom_fichier] → Créer un Gist à partir du dossier cmds\n{pn} -e [nom_fichier] → Créer un Gist à partir du dossier events"
    },
    countDown: 1 // Temps d'attente après l'utilisation de la commande
  },

  onStart: async function ({ api, event, args }) { // Fonction exécutée lorsque la commande est appelée
    let fileName = args[0]; // Récupère le nom de fichier passé en argument
    let code = ""; // Variable pour stocker le code

    try {

      // Si l'utilisateur répond à un message et que ce message contient du code
      if (event.type === "message_reply" && event.messageReply?.body) {
        code = event.messageReply.body; // Récupère le code du message en réponse

        if (!fileName) { // Si aucun nom de fichier n'est spécifié
          const time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // Génère un timestamp
          fileName = `gist_${time}.js`; // Crée un nom de fichier par défaut avec le timestamp
        } else if (!fileName.endsWith(".js")) { // Si le nom de fichier ne se termine pas par ".js"
          fileName = `${fileName}.js`; // Ajoute l'extension ".js"
        }
      }

      // Si un nom de fichier est spécifié en argument
      else if (fileName) {
        let filePath; // Variable pour stocker le chemin du fichier

        // Si l'argument est "-e" (pour le dossier "events")
        if (args[0] === "-e") {
          const evFile = args[1]; // Récupère le nom de fichier après "-e"
          if (!evFile) {
            return api.sendMessage("⚠ | Veuillez fournir un nom de fichier après -e.", event.threadID, event.messageID); // Renvoie un message d'erreur si aucun nom de fichier n'est fourni
          }
          fileName = evFile.endsWith(".js") ? evFile : `${evFile}.js`; // Ajoute l'extension ".js" si nécessaire
          filePath = path.resolve(__dirname, '../../scripts/events', fileName); // Construit le chemin complet du fichier dans le dossier "events"
        } else {
          const commandsPath = path.resolve(__dirname, '../../scripts/cmds'); // Construit le chemin vers le dossier "cmds"
          filePath = fileName.endsWith(".js")
            ? path.join(commandsPath, fileName) // Si le nom de fichier se termine par ".js", utilise le nom tel quel
            : path.join(commandsPath, `${fileName}.js`); // Sinon, ajoute l'extension ".js"
        }

        // Si le fichier n'existe pas
        if (!fs.existsSync(filePath)) {
          const dirToSearch = args[0] === "-e"
            ? path.resolve(__dirname, '../../scripts/events') // Définit le dossier à rechercher (events ou cmds)
            : path.resolve(__dirname, '../../scripts/cmds');

          const files = fs.readdirSync(dirToSearch); // Lit tous les fichiers du dossier
          const similar = files.filter(f => // Recherche des fichiers similaires au nom donné
            f.toLowerCase().includes(fileName.replace(".js", "").toLowerCase())
          );

          if (similar.length > 0) { // Si des fichiers similaires sont trouvés
            return api.sendMessage(
              `❌ Fichier non trouvé. Vouliez-vous dire :\n${similar.join('\n')}`,
              event.threadID,
              event.messageID
            ); // Affiche une liste de fichiers similaires
          }

          return api.sendMessage(
            `❌ Fichier "${fileName}" non trouvé dans le dossier ${args[0] === "-e" ? "events" : "cmds"}.`,
            event.threadID,
            event.messageID
          ); // Affiche un message d'erreur si le fichier n'est pas trouvé
        }

        code = await fs.promises.readFile(filePath, "utf-8"); // Lit le contenu du fichier
        if (!fileName.endsWith(".js")) fileName = `${fileName}.js`; // Ajoute l'extension ".js" si nécessaire
      }
      else {
        return api.sendMessage("⚠ | Veuillez répondre avec du code OU fournir un nom de fichier.", event.threadID, event.messageID); // Message d'erreur si rien n'est fourni
      }

      const encoded = encodeURIComponent(code); // Encode le code pour l'URL
      const apiUrl = await baseApiUrl(); // Récupère l'URL de l'API

      const response = await axios.post(`${apiUrl}/gist`, { // Envoie le code à l'API pour créer le gist
        code: encoded,
        nam: fileName
      });

      const link = response.data?.data; // Récupère le lien du gist de la réponse de l'API
      if (!link) throw new Error("Invalid API response"); // Lance une erreur si la réponse de l'API est invalide

      const gistMsg = `
━━━━━━━━━━━━━━
𝐆𝐢𝐬𝐭 𝐂𝐫éé ✅
╭─╼━━━━━━━━╾─╮
│ Fichier : ${fileName}
│ Statut : Succès
│ Lien : ${link}
╰─━━━━━━━━━╾─╯
━━━━━━━━━━━━━━
`;

      return api.sendMessage(gistMsg, event.threadID, event.messageID); // Envoie le message avec le lien du gist
    } catch (err) {
      console.error("❌ Gist Error:", err.message || err); // Affiche l'erreur dans la console
      return api.sendMessage(
        "⚠️ Échec de la création du gist. Problème possible du serveur.\n💬 Contactez l'auteur pour de l'aide: https://m.me/ye.bi.nobi.tai.244493",
        event.threadID,
        event.messageID
      ); // Envoie un message d'erreur à l'utilisateur en cas d'échec
    }
  }
};