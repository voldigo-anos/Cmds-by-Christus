const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "stea", // traduit "steal" en "voler"
    aliases: [],
    version: "3.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    longDescription: {
      fr: "Copie les membres d’un groupe vers un autre (basé sur l’ID de discussion)"
    },
    category: "outils",
    guide: {
      fr: `{p}voler [threadID] - Copier les membres d’un autre groupe\n\n📌 Remarque : Le bot doit être présent dans les deux groupes.`
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const currentThreadID = threadID;
    const targetThreadID = args[0];

    if (!targetThreadID || isNaN(targetThreadID)) {
      return api.sendMessage(
        "❌ Veuillez fournir un ID de groupe valide !\n\nUtilisation : voler [threadID]",
        threadID,
        messageID
      );
    }

    try {
      const threadInfo = await api.getThreadInfo(targetThreadID);
      const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

      if (!members || members.length === 0) {
        return api.sendMessage(
          "⚠️ Aucun membre trouvé dans le groupe cible.",
          threadID,
          messageID
        );
      }

      let ajoutés = 0;
      let échoués = 0;

      api.sendMessage(
        `⏳ Début du processus de copie des membres...\nGroupe cible : ${targetThreadID}\nNombre total de membres : ${members.length}`,
        threadID
      );

      for (const userID of members) {
        try {
          await api.addUserToGroup(userID, currentThreadID);
          ajoutés++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Pause pour éviter les blocages
        } catch (err) {
          échoués++;
        }
      }

      const msg =
        `🎯 Processus terminé !\n\n` +
        `👥 Membres scannés : ${members.length}\n✅ Ajoutés : ${ajoutés}\n❌ Échecs : ${échoués}\n\n` +
        `💡 Astuce : Certains utilisateurs peuvent avoir des paramètres qui empêchent leur ajout ou sont déjà dans le groupe.`;

      return api.sendMessage(msg, currentThreadID);
    } catch (error) {
      console.error("Erreur de vol :", error.message);
      return api.sendMessage(
        "❌ Échec de la récupération des informations du groupe cible. Vérifiez que l'ID est correct et que le bot est bien présent dans ce groupe.",
        threadID
      );
    }
  }
};