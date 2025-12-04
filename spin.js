module.exports = {
  config: {
    name: "spin",
    version: "4.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    description: "Tourne la roue pour tenter de gagner ou perdre de l'argent. Utilise '/spin <montant>' ou '/spi' top'.",
    category: "jeu",
    guide: {
      fr: "{p}spin <montant>\n{p}tourne top"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const utilisateurID = event.senderID;
    const sousCommande = args[0];

    // 🏆 /spin top → classement des meilleurs gains
    if (sousCommande === "top") {
      const tousUtilisateurs = await usersData.getAll();

      const top = tousUtilisateurs
        .filter(u => typeof u.data?.totalSpinWin === "number" && u.data.totalSpinWin > 0)
        .sort((a, b) => b.data.totalSpinWin - a.data.totalSpinWin)
        .slice(0, 10);

      if (top.length === 0) {
        return message.reply("❌ Aucun gagnant pour le moment.");
      }

      const resultat = top.map((user, i) => {
        const nom = user.name || `Utilisateur ${user.userID?.slice(-4) || "??"}`;
        return `${i + 1}. ${nom} – 💸 ${user.data.totalSpinWin} pièces`;
      }).join("\n");

      return message.reply(`🏆 𝗧𝗼𝗽 𝗴𝗮𝗴𝗻𝗮𝗻𝘁𝘀 𝗱𝗲 𝗹𝗮 𝗿𝗼𝘂𝗲 🎰 :\n\n${resultat}`);
    }

    // 🎲 /tourne <montant>
    const mise = parseInt(sousCommande);
    if (isNaN(mise) || mise <= 0) {
      return message.reply("❌ Utilisation correcte :\n/tourne <montant>\n/spin top");
    }

    const donneesUtilisateur = await usersData.get(utilisateurID) || {};
    donneesUtilisateur.money = donneesUtilisateur.money || 0;
    donneesUtilisateur.data = donneesUtilisateur.data || {};
    donneesUtilisateur.data.totalSpinWin = donneesUtilisateur.data.totalSpinWin || 0;

    if (donneesUtilisateur.money < mise) {
      return message.reply(`❌ Solde insuffisant.\n💰 Ton solde actuel : ${donneesUtilisateur.money}$`);
    }

    // 💸 Déduire la mise
    donneesUtilisateur.money -= mise;

    const issues = [
      { texte: "💥 Tu as tout perdu !", multiplicateur: 0 },
      { texte: "😞 Tu récupères la moitié.", multiplicateur: 0.5 },
      { texte: "🟡 Égalité, tu ne gagnes ni perds.", multiplicateur: 1 },
      { texte: "🟢 Tu doubles ta mise !", multiplicateur: 2 },
      { texte: "🔥 Tu triples ta mise !", multiplicateur: 3 },
      { texte: "🎉 JACKPOT ! 10× ta mise !!!", multiplicateur: 10 }
    ];

    const resultat = issues[Math.floor(Math.random() * issues.length)];
    const gain = Math.floor(mise * resultat.multiplicateur);
    donneesUtilisateur.money += gain;

    if (gain > mise) {
      const profit = gain - mise;
      donneesUtilisateur.data.totalSpinWin += profit;
    }

    await usersData.set(utilisateurID, donneesUtilisateur);

    return message.reply(
      `${resultat.texte}\n🎰 Mise : ${mise}$\n💸 Gain : ${gain}$\n💰 Nouveau solde : ${donneesUtilisateur.money}$`
    );
  }
};