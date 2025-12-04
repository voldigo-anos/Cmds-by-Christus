const a = require("axios"); // Importe la librairie axios pour faire des requêtes HTTP.
const b = require("fs");   // Importe la librairie fs (filesystem) pour interagir avec le système de fichiers.
const c = require("path");  // Importe la librairie path pour manipuler les chemins de fichiers.
const d = require("yt-search"); // Importe la librairie yt-search pour rechercher des vidéos YouTube.

module.exports = {
  config: {
    name: "play",                // Nom de la commande.
    aliases: [],                // Alias de la commande (noms alternatifs).
    version: "0.0.1",             // Version de la commande.
    author: "Christus x Aesther",    // Auteur de la commande.
    countDown: 5,               // Délai d'attente en secondes avant de pouvoir réutiliser la commande.
    role: 0,                    // Rôle requis pour utiliser la commande (0 pour tous les utilisateurs).
    shortDescription: "Joue de la musique",    // Description courte de la commande.
    longDescription: "Recherche et télécharge de la musique depuis YouTube", // Description longue de la commande.
    category: "MUSIQUE",          // Catégorie de la commande.
    guide: "/play <nom de la chanson ou URL YouTube>" // Instructions d'utilisation de la commande.
  },

  onStart: async function ({ api: e, event: f, args: g }) {
    // Fonction qui s'exécute lorsque la commande est appelée.

    if (!g.length) return e.sendMessage("❌ Veuillez fournir un nom de chanson ou une URL YouTube.", f.threadID, f.messageID);
    // Si aucun argument n'est fourni, envoie un message d'erreur.

    let h = g.join(" "); // Concatène tous les arguments en une seule chaîne (nom de la chanson ou URL).
    const i = await e.sendMessage("🎵 Veuillez patienter...", f.threadID, null, f.messageID);
    // Envoie un message pour informer l'utilisateur de l'attente.

    try {
      let j;
      if (h.startsWith("http")) {
        j = h; // Si l'argument commence par "http", on considère que c'est une URL YouTube.
      } else {
        const k = await d(h); // Recherche la chanson sur YouTube en utilisant yt-search.
        if (!k || !k.videos.length) throw new Error("Aucun résultat trouvé."); // S'il n'y a pas de résultats, lève une erreur.
        j = k.videos[0].url; // Récupère l'URL de la première vidéo trouvée.
      }

      const l = `http://65.109.80.126:20409/aryan/ytbv3?url=${encodeURIComponent(j)}&format=mp3`;
      // Crée l'URL pour contacter l'API de téléchargement de musique (remplacer l'URL si nécessaire).
      const m = await a.get(l); // Fait une requête GET à l'API pour obtenir les informations et le lien de téléchargement.
      const n = m.data; // Récupère les données de la réponse de l'API.

      if (!n.status || !n.download) throw new Error("L'API n'a pas renvoyé d'URL de téléchargement."); // Si l'API renvoie une erreur, lève une erreur.

      const o = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, ""); // Crée le nom du fichier en retirant les caractères invalides.
      const p = c.join(__dirname, o); // Crée le chemin complet du fichier.

      const q = await a.get(n.download, { responseType: "arraybuffer" }); // Télécharge le fichier audio depuis le lien fourni par l'API.
      b.writeFileSync(p, q.data); // Écrit les données téléchargées dans le fichier.

      await e.sendMessage(
        { attachment: b.createReadStream(p), body: `🦆 ${n.title}` }, // Envoie le fichier audio à l'utilisateur.
        f.threadID,
        () => {
          b.unlinkSync(p); // Supprime le fichier temporaire après l'envoi.
          e.unsendMessage(i.messageID); // Supprime le message d'attente.
        },
        f.messageID
      );

    } catch (r) {
      console.error(r); // Affiche l'erreur dans la console.
      e.sendMessage(`❌ Échec du téléchargement de la chanson: ${r.message}`, f.threadID, f.messageID); // Envoie un message d'erreur à l'utilisateur.
      e.unsendMessage(i.messageID); // Supprime le message d'attente.
    }
  }
};