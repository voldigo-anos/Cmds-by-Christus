const axios = require("axios"); // Importe la librairie axios pour effectuer des requêtes HTTP.
const fs = require("fs-extra"); // Importe la librairie fs-extra pour des opérations de système de fichiers améliorées (création de dossiers, etc.).
const path = require("path"); // Importe la librairie path pour manipuler les chemins de fichiers.

// Définition des modèles de voix disponibles.
const models = {
  "1": { name: "Joey", desc: "🧑 Voix masculine (anglais américain)" },
  "2": { name: "Amy", desc: "👩 Voix féminine (anglais britannique)" },
  "3": { name: "Brian", desc: "🧔‍♂️ Voix masculine (anglais britannique)" },
  "4": { name: "Mizuki", desc: "👧 Voix féminine (japonais)" }
};

// Exporte un objet contenant la configuration et la fonction principale du module.
module.exports = {
  config: {
    name: "speak", // Nom de la commande.
    version: "1.0", // Version du module.
    author: "Christus x Aesther", // Auteur du module.
    countDown: 5, // Délai d'attente avant de pouvoir utiliser à nouveau la commande (en secondes).
    role: 0, // Niveau de rôle requis pour utiliser la commande (0 = tout le monde).
    shortDescription: { en: "Texte en parole utilisant des modèles vocaux" }, // Description courte en anglais.
    longDescription: { en: "Génère de la parole à partir de texte en utilisant des modèles vocaux sélectionnés (pas de clé API nécessaire)" }, // Description longue en anglais.
    category: "media", // Catégorie de la commande.
    guide: {
      en: `+speak Hello world\n+speak Hello there -m2\n+speak -m (liste des modèles vocaux)` // Guide d'utilisation en anglais.
    }
  },

  onStart: async function ({ message, args, event }) {
    const input = args.join(" "); // Récupère le texte entré par l'utilisateur (après la commande).
    if (!input) return message.reply("❗ Veuillez fournir du texte. Exemple : `+speak Hello world`"); // Si aucun texte n'est fourni, répond avec une instruction.

    if (input.toLowerCase() === "-m") {
      // Si l'utilisateur tape "-m", affiche la liste des modèles de voix.
      const listMsg = `
🎤 𝗠𝗼𝗱𝗲̀𝗹𝗲𝘀 𝗧𝗧𝗦 𝗗𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:

🔢 -m1: Joey 
🧑 Voix masculine (anglais américain)

🔢 -m2: Amy 
👩 Voix féminine (anglais britannique)

🔢 -m3: Brian 
🧔‍♂️ Voix masculine (anglais britannique)

🔢 -m4: Mizuki 
👧 Voix féminine (japonais)

📝 Utilisation: +speak Bonjour -m2
 `.trim();
      return message.reply(listMsg); // Envoie la liste des modèles.
    }

    // Extrait le numéro du modèle de voix de l'entrée.
    const modelMatch = input.match(/-m(\d+)/);
    const modelNum = modelMatch ? modelMatch[1] : "1"; // Définit le modèle par défaut sur "1" si non spécifié.
    const voice = models[modelNum]?.name; // Récupère le nom de la voix correspondant au numéro du modèle.
    if (!voice) return message.reply("❌ Numéro de modèle invalide. Utilisez `+speak -m` pour voir la liste."); // Si le numéro du modèle est invalide, renvoie une erreur.

    // Supprime l'indicateur "-m" et le numéro du modèle du texte.
    const content = input.replace(`-m${modelNum}`, "").trim();
    if (!content) return message.reply("❗ Le texte est vide après avoir supprimé l'indicateur de modèle."); // Si le texte est vide après la suppression, renvoie une erreur.

    try {
      // Effectue une requête POST vers l'API de génération de texte en parole.
      const res = await axios.post("https://ttsmp3.com/makemp3_new.php", new URLSearchParams({
        msg: content,
        lang: voice,
        source: "ttsmp3"
      }).toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      if (!res.data || !res.data.URL) return message.reply("⚠️ Échec de la génération audio."); // Si la réponse de l'API est invalide, renvoie une erreur.

      const fileName = `tts_${Date.now()}.mp3`; // Crée un nom de fichier unique.
      const filePath = path.join(__dirname, "cache", fileName); // Crée le chemin complet du fichier audio.

      // Télécharge le fichier audio depuis l'URL fournie par l'API.
      const audioRes = await axios.get(res.data.URL, { responseType: "stream" });
      await fs.ensureDir(path.dirname(filePath)); // S'assure que le dossier "cache" existe.
      const writer = fs.createWriteStream(filePath); // Crée un flux d'écriture pour le fichier audio.

      audioRes.data.pipe(writer); // Envoie le flux de données audio dans le flux d'écriture.
      writer.on("finish", () => {
        // Une fois l'écriture terminée, envoie le fichier audio à l'utilisateur.
        message.reply({
          body: `🗣️ *${content}*\n🎤 Voix: ${voice}`,
          attachment: fs.createReadStream(filePath)
        });
      });

    } catch (err) {
      console.error(err); // Affiche l'erreur dans la console.
      return message.reply("❌ Une erreur s'est produite lors de la génération de la parole."); // Si une erreur se produit, renvoie un message d'erreur.
    }
  }
};