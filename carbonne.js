module.exports = {
  config: {
    name: "carbonne",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🖤 Génère une image Carbonne à partir d'un texte",
    longDescription: "Envoie directement une image avec le texte transformé en style 'Carbonne'.",
    category: "maker",
    guide: "{pn} <texte>"
  },

  onStart: async function({ message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un texte pour générer l'image Carbonne.");
    
    const text = args.join("+");
    const imageUrl = `https://archive.lick.eu.org/api/maker/carbonify?text=${text}`;

    return message.reply({
      body: `🖤 Voici ton image Carbonne pour : "${args.join(" ")}"`,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    });
  }
};