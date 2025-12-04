const axios = require("axios");

module.exports = {
  config: {
    name: "youai",
    aliases: ["you", "youchat"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: "Discuter avec You AI",
    longDescription: "Envoyez un message et recevez une réponse amicale de l'IA avec des questions liées",
    category: "ai",
    guide: {
      fr: "{pn} <votre message>"
    }
  },

  langs: {
    fr: {
      noInput: "⚠️ Veuillez taper quelque chose à demander.",
      loading: "🧠 Je réfléchis...",
      error: "❌ Impossible d'obtenir une réponse de You AI."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("noInput"));

    message.reply(getLang("loading"));

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/you?chat=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);

      const data = res.data;
      if (!data || !data.response) return message.reply(getLang("error"));

      const related = data.relatedSearch?.length
        ? "\n\n💡 Liens connexes :\n" + data.relatedSearch.map((r, i) => `• ${r}`).join("\n")
        : "";

      return message.reply(`🧠 ${data.response}${related}`);
    } catch (err) {
      console.error("Erreur YouAI :", err.message || err);
      return message.reply(getLang("error"));
    }
  }
};