const axios = require('axios');

const typesFR = {
  action: "1", aventure: "2", comédie: "4", drame: "8", fantastique: "10", horreur: "14",
  romance: "22", science: "24", sports: "30", "tranche de vie": "36", surnaturel: "37", thriller: "41"
};

module.exports = {
  config: {
    name: "anime",
    version: "1.0",
    author: "Christus x Aesther",
    role: 0,
    shortDescription: "Suggère un anime par type",
    longDescription: "Donne un anime selon le type demandé, avec fiche complète.",
    category: "fun",
    guide: "{p}anime [type]"
  },

  onStart: async function({ api, event, args }) {
    if (!args[0]) return api.sendMessage(
      "Donne un type d’animé. Ex : /anime action\nTypes : " + Object.keys(typesFR).join(", "),
      event.threadID, event.messageID
    );
    const typeInput = args.join(' ').toLowerCase();
    const genreID = typesFR[typeInput];
    if (!genreID) return api.sendMessage("Type inconnu. Choisis : " + Object.keys(typesFR).join(", "), event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genreID}&order_by=popularity&limit=24`);
      const list = res.data.data;
      if (!list || list.length === 0) return api.sendMessage("Aucun animé trouvé.", event.threadID, event.messageID);
      const anime = list[Math.floor(Math.random() * list.length)];
      const detailsRes = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}/full`);
      const a = detailsRes.data.data;
      let saisons = a.season || 1;
      let duree = a.duration || "Non précisée";
      let vf = "VF : vérifie sur la plateforme";
      let vostfr = "VOSTFR : dispo (fansub/plateformes FR)";
      const msg =
        `Titre : ${a.title}\n` +
        `Synopsis : ${a.synopsis ? a.synopsis.substring(0, 450) + (a.synopsis.length > 450 ? "..." : "") : "Non disponible"}\n` +
        `Episodes : ${a.episodes || "?"}\n` +
        `Durée par épisode : ${duree}\n` +
        `Saisons : ${saisons}\n` +
        `${vf}\n${vostfr}\n` +
        `Lien : ${a.url}`;
      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      api.sendMessage("Erreur ou API saturée. Essaie plus tard.", event.threadID, event.messageID);
    }
  }
};