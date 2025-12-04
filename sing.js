const a = require("axios"); // Importe la bibliothèque pour effectuer des requêtes HTTP.
const b = require("fs"); // Importe la bibliothèque pour interagir avec le système de fichiers (lecture/écriture de fichiers).
const c = require("path"); // Importe la bibliothèque pour manipuler les chemins de fichiers et de dossiers.
const d = require("yt-search"); // Importe la bibliothèque pour rechercher des vidéos YouTube.

module.exports = {
  config: {
    name: "sing", // Nom de la commande (à utiliser pour l'appeler).
    aliases: ["music", "song"], // Autres noms possibles pour la commande (synonymes).
    version: "0.0.1", // Version de la commande.
    author: "Christus x Aesther", // Auteur de la commande.
    countDown: 5, // Délai d'attente en secondes entre les utilisations de la commande.
    role: 0, // Niveau de rôle requis pour utiliser la commande (0 = tout le monde).
    shortDescription: "Chante pour faire du thé", // Brève description de la commande.
    longDescription: "Recherche et télécharge de la musique depuis YouTube", // Description détaillée de la commande.
    category: "MUSIC", // Catégorie de la commande (pour l'organisation).
    guide: "/music <nom de la chanson ou URL YouTube>" // Instructions d'utilisation de la commande.
  },

  onStart: async function ({ api: e, event: f, args: g }) {
    // Fonction qui s'exécute lorsque la commande est appelée.

    if (!g.length) return e.sendMessage("❌ Veuillez fournir le nom d'une chanson ou une URL YouTube.", f.threadID, f.messageID);
    // Si aucun argument n'est fourni, envoie un message d'erreur.

    let h = g.join(" "); // Combine les arguments en une chaîne de caractères (nom de la chanson ou URL).
    const i = await e.sendMessage("🎵 Patience, je recherche...", f.threadID, null, f.messageID);
    // Envoie un message pour informer l'utilisateur de la recherche en cours.

    try {
      let j; // Variable pour stocker l'URL de la vidéo YouTube.
      if (h.startsWith("http")) {
        // Si l'entrée commence par "http", on suppose que c'est une URL.
        j = h; // Utilise l'URL fournie directement.
      } else {
        // Sinon, on effectue une recherche sur YouTube.
        const k = await d(h); // Recherche la chanson avec la bibliothèque yt-search.
        if (!k || !k.videos.length) throw new Error("Aucun résultat trouvé."); // Si aucun résultat n'est trouvé, lève une erreur.
        j = k.videos[0].url; // Prend l'URL de la première vidéo trouvée.
      }

      const l = `http://65.109.80.126:20409/aryan/play?url=${encodeURIComponent(j)}`;
      // Construit l'URL d'une API externe pour récupérer le lien de téléchargement.
      const m = await a.get(l); // Effectue une requête HTTP vers l'API.
      const n = m.data; // Récupère les données de la réponse de l'API.

      if (!n.status || !n.downloadUrl) throw new Error("L'API n'a pas renvoyé l'URL de téléchargement."); // Vérifie si l'API a réussi.

      const o = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, ""); // Crée le nom du fichier MP3 en utilisant le titre de la chanson.  Nettoie le titre des caractères invalides.
      const p = c.join(__dirname, o); // Crée le chemin complet du fichier MP3 sur le serveur.

      const q = await a.get(n.downloadUrl, { responseType: "arraybuffer" }); // Effectue une requête pour télécharger le fichier MP3.
      b.writeFileSync(p, q.data); // Écrit les données du fichier MP3 dans le fichier local.

      await e.sendMessage(
        { attachment: b.createReadStream(p), body: `🎵 𝗠𝗨𝗦𝗜𝗤𝗨𝗘\n━━━━━━━━━━━━━━━\n\n${n.title}` }, // Envoie le fichier MP3 en tant qu'attachement.
        f.threadID,
        () => {
          b.unlinkSync(p); // Supprime le fichier MP3 local après l'envoi.
          e.unsendMessage(i.messageID); // Supprime le message de recherche.
        },
        f.messageID
      );

    } catch (r) {
      // Gère les erreurs éventuelles.
      console.error(r); // Affiche l'erreur dans la console.
      e.sendMessage(`❌ Échec du téléchargement de la chanson: ${r.message}`, f.threadID, f.messageID); // Envoie un message d'erreur à l'utilisateur.
      e.unsendMessage(i.messageID); // Supprime le message de recherche.
    }
  }
};