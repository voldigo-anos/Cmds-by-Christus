
// Importe la bibliothèque axios pour faire des requêtes HTTP
const axios = require('axios');

// Définit l'URL de base pour l'API (ici, un endpoint spécifique)
const nix = 'http://65.109.80.126:20409';

// Définit la configuration du module pour le bot
module.exports.config = {
  name: "meta", // Nom de la commande (ex : !meta)
  version: "0.0.1", // Version de la commande
  role: 0, // Niveau de rôle requis pour utiliser la commande (0 = tout le monde)
  author: "Christus x Aesther", // Auteur de la commande
  description: "Meta AI", // Description de la commande
  category: "général", // Catégorie de la commande
  cooldowns: 2, // Temps d'attente en secondes avant que la commande puisse être réutilisée
  hasPrefix: false, // Indique si la commande nécessite un préfixe (comme !)
};

// Fonction exécutée lorsque la commande est appelée
module.exports.onStart = async function({ api, event, args }) {
  // Extrait l'ID du fil de discussion et l'ID du message de l'événement
  const { threadID, messageID } = event;
  // Récupère la question posée par l'utilisateur, en joignant tous les arguments et en supprimant les espaces en début et fin
  const question = args.join(' ').trim();

  // Vérifie si une question a été posée
  if (!question) {
    // Si aucune question n'a été fournie, envoie un message demandant à l'utilisateur de poser sa question
    return api.sendMessage("Pose ta question.", threadID, messageID);
  }

  // Tentative d'interaction avec l'API Meta AI
  try {
    // Envoie une requête GET à l'API en utilisant axios, en incluant la question encodée dans l'URL
    const response = await axios.get(`${nix}/aryan/meta-ai?query=${encodeURIComponent(question)}`);

    // Extrait la réponse de l'API (la partie "data" de la réponse, puis la propriété "data" de cette réponse)
    const metaAnswer = response.data?.data;

    // Vérifie si une réponse a été obtenue de l'API
    if (metaAnswer) {
      // Si une réponse a été obtenue, envoie la réponse de l'API au fil de discussion
      return api.sendMessage(metaAnswer, threadID, messageID);
    }
    else {
      // Si aucune réponse n'a été obtenue, envoie un message d'erreur
      return api.sendMessage("[⚜]➜ Quelque chose s'est mal passé.", threadID, messageID);
    }
  } catch (error) {
    // En cas d'erreur lors de l'appel à l'API
    console.error('Erreur API Meta:', error.response ? error.response.data : error.message); // Affiche l'erreur dans la console
    // Envoie un message d'erreur à l'utilisateur, indiquant un problème et l'encourageant à ne pas réessayer immédiatement
    return api.sendMessage("[⚜️]➜ erreur orrr ne reesai pas même", threadID, messageID);
  }
};