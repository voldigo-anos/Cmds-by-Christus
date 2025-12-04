const axios = require("axios"); // Importe la bibliothèque axios pour effectuer des requêtes HTTP

module.exports = {
  config: {
    name: "imgbb", // Nom de la commande (pour l'appel)
    version: "1.0.0", // Version de la commande
    author: "Christus x Merdi", // Auteur de la commande
    countDown: 0, // Temps d'attente avant de pouvoir réutiliser la commande (en secondes)
    role: 0, // Niveau de permission requis (0 pour tous)
    shortDescription: "Téléverse une image/vidéo sur ImgBB", // Brève description de la commande
    longDescription: "Réponds à une image ou fournis une URL pour la téléverser sur ImgBB.", // Description plus détaillée de la commande
    category: "utilitaire", // Catégorie de la commande
    guide: "{pn} Répond à une image ou fournis une URL" // Guide d'utilisation de la commande
  },

  onStart: async function ({ api, event, args }) {
    // Fonction exécutée lorsque la commande est appelée
    const { threadID, messageID, messageReply } = event; // Déstructure les données de l'événement
    let mediaUrl = ""; // Initialise une variable pour stocker l'URL de l'image/vidéo

    if (messageReply && messageReply.attachments.length > 0) {
      // Si la commande est une réponse à un message avec une pièce jointe
      mediaUrl = messageReply.attachments[0].url; // Récupère l'URL de la première pièce jointe
    } else if (args.length > 0) {
      // Si des arguments sont fournis avec la commande
      mediaUrl = args.join(" "); // Joigne les arguments en une seule URL (en séparant les mots par un espace)
    }

    if (!mediaUrl) {
      // Si aucune URL n'est trouvée
      return api.sendMessage("❌ Veuillez répondre à une image ou fournir une URL !", threadID, messageID); // Envoie un message d'erreur à l'utilisateur
    }

    try {
      // Commence un bloc try-catch pour gérer les erreurs
      api.setMessageReaction("⏳", messageID, () => {}, true); // Ajoute une réaction "En attente" au message de l'utilisateur

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgbb?url=${encodeURIComponent(mediaUrl)}`); // Effectue une requête GET à l'API ImgBB (via une API intermédiaire) en utilisant l'URL fournie. `encodeURIComponent` permet de gérer correctement les caractères spéciaux dans l'URL.
      const imgbbLink = res.data.link; // Récupère le lien de l'image téléversée depuis la réponse de l'API

      if (!imgbbLink) {
        // Si le lien n'a pas été récupéré correctement
        api.setMessageReaction("", messageID, () => {}, true); // Retire la réaction "En attente"
        return api.sendMessage("❌ Échec du téléversement sur ImgBB.", threadID, messageID); // Envoie un message d'erreur
      }

      api.setMessageReaction("✅", messageID, () => {}, true); // Remplace la réaction par "Succès"
      return api.sendMessage(`${imgbbLink}`, threadID, messageID); // Envoie le lien de l'image téléversée à l'utilisateur
    } catch (err) {
      // Si une erreur se produit dans le bloc try
      console.error("Erreur de téléversement ImgBB:", err); // Affiche l'erreur dans la console pour le débogage
      api.setMessageReaction("", messageID, () => {}, true); // Retire la réaction "En attente"
      return api.sendMessage("⚠ Une erreur s'est produite lors du téléversement.", threadID, messageID); // Envoie un message d'erreur à l'utilisateur
    }
  }
};