const axios = require("axios"); // Importe la bibliothèque axios pour effectuer des requêtes HTTP.
const fs = require("fs"); // Importe la bibliothèque fs pour manipuler le système de fichiers.
const path = require("path"); // Importe la bibliothèque path pour gérer les chemins de fichiers.

module.exports = {
  config: {
    name: "shoti", // Nom de la commande.
    version: "1.2", // Version de la commande.
    author: "Christus x Aesther", // Auteur de la commande.
    countDown: 5, // Délai de refroidissement (en secondes) avant de pouvoir utiliser la commande à nouveau.
    role: 0, // Niveau de rôle requis pour utiliser la commande (0 = tout le monde).
    shortDescription: {
      en: "Récupérer une vidéo Shoti aléatoire.",
    },
    longDescription: {
      en: "Récupère une courte vidéo aléatoire à partir d'une nouvelle API et l'envoie dans le chat.",
    },
    category: "media", // Catégorie de la commande (ex: media, fun, utilitaire...).
    guide: {
      en: "Utilisez cette commande pour récupérer et partager une courte vidéo aléatoire.",
    },
  },

  onStart: async function ({ api, event }) {
    // Fonction qui s'exécute lorsque la commande est appelée.

    const videoDir = path.join(__dirname, "cache"); // Crée un chemin vers le dossier "cache" dans le même dossier que le fichier de commande.
    const videoPath = path.join(videoDir, `shoti_${Date.now()}.mp4`); // Crée un chemin vers un fichier vidéo temporaire avec un nom unique.
    const apiUrl = "https://apis-top.vercel.app/aryan/shoti"; // URL de l'API pour récupérer les vidéos.

    try {
      if (!fs.existsSync(videoDir)) { // Vérifie si le dossier "cache" existe.
        fs.mkdirSync(videoDir); // Si le dossier n'existe pas, il est créé.
      }

      const res = await axios.get(apiUrl); // Effectue une requête GET à l'API.
      const data = res.data; // Récupère les données de la réponse.

      if (!data || !data.videoUrl) { // Vérifie si les données ou l'URL de la vidéo sont valides.
        return api.sendMessage("❌ Échec de la récupération de la vidéo Shoti. L'API est peut-être en panne ou a renvoyé une réponse invalide.", event.threadID, event.messageID); // Envoie un message d'erreur si l'API ne retourne pas une vidéo.
      }

      const { videoUrl, title, username, nickname, region } = data; // Extrait les informations de la vidéo.

      const videoRes = await axios({ // Effectue une autre requête pour télécharger la vidéo.
        method: "GET",
        url: videoUrl,
        responseType: "stream", // Spécifie que la réponse doit être traitée comme un flux de données.
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }, // Ajoute un "User-Agent" pour simuler une requête de navigateur.
      });

      const writer = fs.createWriteStream(videoPath); // Crée un flux d'écriture pour sauvegarder la vidéo dans le fichier.

      videoRes.data.pipe(writer); // Transfère le flux de données de la réponse de l'API vers le flux d'écriture du fichier.

      writer.on("finish", () => {
        // Fonction qui s'exécute lorsque l'écriture du fichier est terminée.
        const caption = `🎀 𝗦𝗵𝗼𝘁𝗶\n━━━━━━━━━━\n📝 Titre: ${title || "Pas de titre"}\n👤 Nom d'utilisateur: ${username || "N/A"}\n💬 Pseudo: ${nickname || "N/A"}\n🌍 Région: ${region || "Inconnu"}`;
         // Crée la légende pour la vidéo.

        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(videoPath) }, // Envoie un message avec la légende et la vidéo en pièce jointe.
          event.threadID,
          () => fs.unlinkSync(videoPath), // Supprime le fichier vidéo après l'envoi.
          event.messageID
        );
      });

      writer.on("error", (err) => {
        // Fonction qui s'exécute en cas d'erreur lors de l'écriture du fichier.
        console.error("❌ Erreur lors de l'écriture du fichier vidéo:", err); // Affiche l'erreur dans la console.
        api.sendMessage("❌ Erreur lors de l'enregistrement du fichier vidéo.", event.threadID, event.messageID); // Envoie un message d'erreur à l'utilisateur.
        if (fs.existsSync(videoPath)) { // Vérifie si le fichier existe.
          fs.unlinkSync(videoPath); // Supprime le fichier si il existe.
        }
      });

    } catch (err) {
      // Gère les erreurs globales (ex: problèmes de connexion).
      console.error("❌ Erreur:", err.message); // Affiche l'erreur dans la console.
      api.sendMessage("❌ Une erreur inattendue s'est produite lors de la récupération de la vidéo Shoti. Veuillez réessayer plus tard.", event.threadID, event.messageID); // Envoie un message d'erreur à l'utilisateur.
    }
  },
};