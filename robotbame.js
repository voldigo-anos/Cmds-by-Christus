module.exports = {
  config: {
    name: "robotname",
    version: "1.0",
    author: "Aesther x Christus",
    countDown: 5,
    role: 0,
    shortDescription: "🤖 Génère ton nom en style robot",
    longDescription: "Envoie une image de robot basée sur ton nom ou celui que tu choisis.",
    category: "maker",
    guide: "{pn} <nom>"
  },

  onStart: async function({ message, args }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer un nom pour générer votre robot !");
    
    const username = args.join("+");
    const imageUrl = `https://archive.lick.eu.org/api/maker/robohash?username=${username}`;

    return message.reply({
      body: `🤖 Voici ton robot personnalisé pour : "${args.join(" ")}"`,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    });
  }
};