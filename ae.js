const axios = require("axios");

const Prefixes = ["ai"];

const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

const stickers = [
  "254599662670071", "254599149336789", "254597316003639",
  "254597059336998", "254593389337365", "114314462496495", "371179350301268", "371180450301158", 
  "371178086968061", "371177726968097", "254595959337108" 
];

const RP = "Ajoute des ascii Emojis et répond à la question";

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

function splitMessage(text, maxLength = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["ae"],
    version: "1.5",
    author: "Aesther",
    countDown: 2,
    role: 0,
    shortDescription: "🤖 Pose une question à l'IA",
    longDescription: "Obtiens une réponse stylisée de l'IA avec un design lisible et décoratif.",
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    const threadID = event.threadID;
    const messageID = event.messageID;

    if (!prompt) {
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      return message.send({ sticker: randomSticker });
    }

    try {
      const apiUrl = `https://aryanapi.up.railway.app/api/conciseai?prompt=${encodeURIComponent(RP + prompt)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = data?.result || data?.message || data?.answer?.llm_response || "🤖 Aucune réponse reçue.";

      // 🔹 Ajout du préfixe "Assistante :"
      const formattedResponse = `♻️ 𝗟𝗢𝗩𝗘𝗟𝗬 📖 :\n${response} 🟡`;
      const styled = applyFont(formattedResponse.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? "" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 60 * 1000);
      }

      await api.setMessageReaction("✅", messageID, () => {}, true);

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur met trop de temps à répondre. Réessaie plus tard."
        : "❌ Une erreur est survenue lors de la connexion à l'API.";
      return message.reply(applyFont(errMsg));
    }
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const args = event.body.slice(prefix.length).trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  },

  onReply: async function ({ args, event, api, message, Reply }) {
    if (event.senderID !== Reply.author) return;

    const newPrompt = event.body.trim();
    const prompt = `${RP} : ${newPrompt}`;
    try {
      const apiUrl =`https://delirius-apiofc.vercel.app/ia/chatgpt?=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = data?.data || data?.message || data?.result || "🤖 Aucune réponse obtenue.";

      // 🔹 Ajout du préfixe "Assistante :"
      const formattedResponse = `Assistante :\n${response}`;
      const styled = applyFont(formattedResponse.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? "🪐" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 60 * 1000);
      }

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur est trop lent à répondre."
        : "❌ Une erreur s’est produite avec l'API.";
      return message.reply(applyFont(errMsg));
    }
  }
};