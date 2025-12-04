const fast = require('fast-speedtest-api');

module.exports = {
  config: {
    name: "speed",
    aliases: ["speed", "speedtest"],
    version: "1.0",
    author: "Christus",
    countDown: 30,
    role: 2, // réservé au propriétaire/admin
    shortDescription: "Tester la vitesse du système",
    longDescription: "Permet de tester la vitesse de connexion Internet du système où est hébergé le bot.",
    category: "propriétaire",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      // ⚡ Initialisation du test de vitesse
      const testVitesse = new fast({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // Jeton par défaut de fast.com
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: fast.UNITS.Mbps
      });

      console.log('🚀 Lancement du test de vitesse...');

      const resultat = await testVitesse.getSpeed();

      console.log('✅ Test de vitesse terminé :', resultat, "Mbps");

      // 📡 Message final envoyé à l'utilisateur
      const message = `📶 Résultat du test de vitesse :
💾 Vitesse de téléchargement : ${resultat} Mbps`;

      console.log('✉️ Envoi du message :', message);

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (erreur) {
      console.error('❌ Une erreur est survenue :', erreur);
      return api.sendMessage("⚠️ Une erreur est survenue pendant le test de vitesse.", event.threadID, event.messageID);
    }
  }
};