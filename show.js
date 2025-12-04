const fs = require("fs-extra"); // Importe la bibliothèque fs-extra pour des opérations de système de fichiers améliorées.
const axios = require("axios"); // Importe la bibliothèque axios pour faire des requêtes HTTP.

const cachePath = __dirname + "/cache/show_cache.json"; // Définit le chemin du fichier de cache. __dirname est le répertoire actuel.

async function saveToCache(key, content) { // Fonction asynchrone pour sauvegarder des données dans le cache.
  let cache = {}; // Initialise un objet vide pour le cache.
  if (fs.existsSync(cachePath)) { // Vérifie si le fichier de cache existe.
    cache = JSON.parse(fs.readFileSync(cachePath, "utf8")); // Si oui, lit le contenu du fichier et le parse en JSON.
  }
  cache[key] = content; // Ajoute ou met à jour l'entrée du cache avec la clé et le contenu fournis.
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2)); // Écrit le cache mis à jour dans le fichier, formaté pour une meilleure lisibilité.
}

async function getFromCache(key) { // Fonction asynchrone pour récupérer des données du cache.
  if (!fs.existsSync(cachePath)) return null; // Si le fichier de cache n'existe pas, retourne null.
  const cache = JSON.parse(fs.readFileSync(cachePath, "utf8")); // Lit et parse le fichier de cache.
  return cache[key] || null; // Retourne la valeur associée à la clé, ou null si la clé n'existe pas.
}

module.exports = { // Exporte un objet contenant la configuration et la fonction principale.
  config: { // Configuration de la commande.
    name: "show", // Nom de la commande.
    version: "0.0.2", // Version de la commande.
    author: "Christus", // Auteur de la commande.
    role: 0, // Rôle requis pour utiliser la commande (0 généralement signifie public).
    shortDescription: "Affiche le contenu de n'importe quelle URL", // Description courte de la commande.
    longDescription: "Répond à un message avec une URL une fois et récupère le contenu par parties avec show 2, show 3, etc.", // Description détaillée.
    category: "utility", // Catégorie de la commande.
    guide: { // Guide d'utilisation.
      en: "Répondez à un message contenant une URL avec 'show'. Ensuite, utilisez 'show 2', 'show 3' pour obtenir les parties suivantes."
    }
  },

  onStart: async function ({ api, event, args }) { // Fonction principale exécutée lorsque la commande est appelée.
    const { threadID, senderID, messageReply } = event; // Extrait les informations de l'événement.
    const part = parseInt(args[0]) || 1; // Détermine la partie à afficher, par défaut la première (1).
    const cacheKey = `${threadID}_${senderID}`; // Crée une clé unique pour le cache basée sur l'ID du fil de discussion et l'ID de l'expéditeur.
    const limit = 1900; // Définit la limite de caractères par partie.

    if (part === 1) { // Si la première partie est demandée (show sans argument).
      if (!messageReply || !messageReply.body) { // Vérifie s'il y a une réponse et si elle contient un corps (texte).
        return api.sendMessage("❌ Veuillez répondre à un message contenant une URL pour utiliser 'show'.", threadID); // Envoie un message d'erreur si ce n'est pas le cas.
      }

      const urlMatch = messageReply.body.match(/https?:\/\/[^\s]+/); // Recherche une URL dans le corps du message répondu.
      if (!urlMatch) return api.sendMessage("❌ Aucune URL valide trouvée dans le message répondu.", threadID); // Envoie un message d'erreur si aucune URL n'est trouvée.

      const url = urlMatch[0]; // Extrait l'URL.

      try {
        const res = await axios.get(url); // Fait une requête GET à l'URL.
        let content = res.data; // Récupère les données de la réponse.
        if (typeof content !== "string") content = JSON.stringify(content, null, 2); // Si les données ne sont pas une chaîne, les convertit en JSON formaté.

        await saveToCache(cacheKey, content); // Sauvegarde le contenu dans le cache.

        const sliced = content.slice(0, limit); // Coupe le contenu pour la première partie.
        const msg = `${sliced}`; // Crée le message à envoyer.
        return api.sendMessage(msg, threadID); // Envoie la première partie du contenu.
      } catch (err) {
        console.error(err); // Affiche l'erreur dans la console.
        return api.sendMessage("❌ Échec de la récupération du contenu de l'URL.", threadID); // Envoie un message d'erreur en cas d'échec.
      }
    } else { // Si une partie autre que la première est demandée (show 2, show 3, etc.).
      const cached = await getFromCache(cacheKey); // Récupère le contenu du cache.
      if (!cached) { // Si aucun contenu n'est trouvé dans le cache.
        return api.sendMessage("❌ Aucune donnée précédente trouvée. Veuillez d'abord utiliser 'show' en répondant à un message URL.", threadID); // Envoie un message d'erreur.
      }

      const start = (part - 1) * limit; // Calcule le point de départ de la tranche.
      const end = part * limit; // Calcule le point de fin de la tranche.
      const slice = cached.slice(start, end); // Extrait la tranche de contenu.

      if (!slice) { // Si la tranche est vide (plus de contenu).
        return api.sendMessage("❌ Plus de contenu à afficher.", threadID); // Envoie un message indiquant qu'il n'y a plus de contenu.
      }

      let reply = `${slice}`; // Crée le message à envoyer.
      if (end < cached.length) reply += `\n\nTapez "show ${part + 1}" pour afficher la partie suivante.`; // Ajoute un message pour la partie suivante s'il y a plus de contenu.
      return api.sendMessage(reply, threadID); // Envoie la partie du contenu.
    }
  }
};