const header = `👑 𝐕𝐎𝐋𝐃𝐘 𝗩𝗜𝗣 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗘𝗨𝗥𝗦 👑`;

const fs = require("fs");

const vipFilePath = "vip.json";
const changelogFilePath = "changelog.json"; // Chemin vers le fichier changelog

function loadVIPData() {
  try {
    const data = fs.readFileSync(vipFilePath);
    return JSON.parse(data);
  } catch (err) {
    console.error("Erreur lors du chargement des données VIP :", err);
    return {};
  }
}

function saveVIPData(data) {
  try {
    fs.writeFileSync(vipFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Erreur lors de l'enregistrement des données VIP :", err);
  }
}

function loadChangelog() {
  try {
    const data = fs.readFileSync(changelogFilePath);
    return JSON.parse(data);
  } catch (err) {
    console.error("Erreur lors du chargement du changelog :", err);
    return {};
  }
}

module.exports = {
  config: {
    name: "vip",
    version: "1.0",
    author: "Christus x Aesther",
    role: 2,
    category: "Configuration",
    guide: {
      fr: `!vip add <uid> - Ajouter un utilisateur à la liste VIP
!vip rm <uid> - Retirer un utilisateur de la liste VIP
!vip list - Afficher la liste des utilisateurs VIP
!vip changelog - Voir l'historique des mises à jour`
    },
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const subcommand = args[0];

    if (!subcommand) {
      return;
    }

    // Charger les données VIP depuis le fichier JSON
    let vipData = loadVIPData();

    // ➕ Ajouter un utilisateur à la liste VIP
    if (subcommand === "add") {
      const uidToAdd = args[1];
      if (uidToAdd) {
        const userData = await usersData.get(uidToAdd);
        if (userData) {
          const userName = userData.name || "Utilisateur inconnu";

          message.reply(`${header}
${userName} (${uidToAdd}) a été ajouté avec succès à la liste VIP.`);

          api.sendMessage(`${header}
Félicitations ${userName} (${uidToAdd}) 🎉
Vous avez été ajouté à la liste VIP. Profitez des fonctionnalités exclusives !`, uidToAdd);

          // Notification aux autres VIP
          Object.keys(vipData).forEach(async (uid) => {
            if (uid !== uidToAdd) {
              const vipUserData = await usersData.get(uid);
              if (vipUserData) {
                const vipUserName = vipUserData.name || "Utilisateur inconnu";
                api.sendMessage(`${header}
Bonjour à tous les VIP 👑
Accueillons notre nouveau VIP :
Nom : ${userName} (${uidToAdd})
Utilisez la commande 'vipnoti' si vous souhaitez lui envoyer un message !`, uid);
              }
            }
          });

          vipData[uidToAdd] = true;
          saveVIPData(vipData);
        } else {
          message.reply(`${header}
Utilisateur avec l'UID ${uidToAdd} introuvable.`);
        }
      } else {
        message.reply(`${header}
Veuillez fournir un UID à ajouter à la liste VIP.`);
      }

    // ❌ Supprimer un utilisateur de la liste VIP
    } else if (subcommand === "rm") {
      const uidToRemove = args[1];
      if (uidToRemove && vipData[uidToRemove]) {
        delete vipData[uidToRemove];
        saveVIPData(vipData);
        const userData = await usersData.get(uidToRemove);
        if (userData) {
          const userName = userData.name || "Utilisateur inconnu";
          message.reply(`${header}
${userName} (${uidToRemove}) a été retiré de la liste VIP.`);

          api.sendMessage(`${header}
Désolé ${userName} (${uidToRemove}), vous avez été retiré de la liste VIP.`, uidToRemove);

          // Informer les autres VIP
          Object.keys(vipData).forEach(async (uid) => {
            if (uid !== uidToRemove) {
              const vipUserData = await usersData.get(uid);
              if (vipUserData) {
                const vipUserName = vipUserData.name || "Utilisateur inconnu";
                api.sendMessage(`${header}
Info VIP 📢
${userName} (${uidToRemove}) a été retiré de la liste VIP.`, uid);
              }
            }
          });
        } else {
          message.reply(`${header}
Utilisateur avec l'UID ${uidToRemove} introuvable.`);
        }
      } else {
        message.reply(`${header}
Veuillez fournir un UID valide à retirer de la liste VIP.`);
      }

    // 📜 Afficher la liste des utilisateurs VIP
    } else if (subcommand === "list") {
      const vipList = await Promise.all(Object.keys(vipData).map(async (uid) => {
        const userData = await usersData.get(uid);
        if (userData) {
          const userName = userData.name || "Utilisateur inconnu";
          return `• ${userName} (${uid})`;
        } else {
          return `• Utilisateur inconnu (${uid})`;
        }
      }));

      if (vipList.length > 0) {
        message.reply(`${header}

» Nos utilisateurs VIP respectés :

${vipList.join("\n")}

Utilisez !vip add/rm <uid> pour ajouter ou retirer des participants.`);
      } else {
        message.reply(`${header}
La liste VIP est actuellement vide.`);
      }

    // 📝 Afficher le changelog
    } else if (subcommand === "changelog") {
      const changelogData = loadChangelog();

      if (changelogData) {
        const changelogEntries = Object.keys(changelogData).filter((version) => parseFloat(version) >= 1.0);

        if (changelogEntries.length > 0) {
          const changelogText = changelogEntries.map((version) => `Version ${version} : ${changelogData[version]}`).join('\n');
          message.reply(`${header}
Version actuelle : ${module.exports.config.version}
📝 Journal des modifications :
${changelogText}`);
        } else {
          message.reply(`${header}
Version actuelle : ${module.exports.config.version}
📝 Aucun changelog trouvé à partir de la version 1.0.`);
        }
      } else {
        message.reply("⚠️ Les données du changelog ne sont pas disponibles.");
      }
    }
  }
};