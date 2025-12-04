const axios = require("axios");

const Prefixes = ["ai", "anjara", "Ae"];

const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

const RP = "Ajoute des Emojis et répond de manière naturelle avec un ton amical.";

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
    aliases: ["ae", "anjara"],
    version: "3.0",
    author: "Aesther x Christus",
    countDown: 2,
    role: 0,
    shortDescription: "IA avec mode texte et image 🎨",
    longDescription: "Pose une question à l'IA ou génère une image réaliste à partir d’un prompt.",
    category: "AI",
    guide: "{pn} <question>\n{pn} create <description d’image>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    const threadID = event.threadID;
    const messageID = event.messageID;

    // Aucun argument
    if (!args.length) return message.reply("💡 Utilise :\n- ai <question>\n- ai create <description d’image>");

    // Mode image
    if (args[0].toLowerCase() === "create") {
      const desc = args.slice(1).join(" ");
      if (!desc) return message.reply("🖼️ Donne une description d’image à générer.");
      return generateImage(api, message, desc);
    }

    // Si reply à une image : analyse
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      const imageUrl = event.messageReply.attachments[0].url;
      return analyzeImage(api, message, imageUrl, prompt || "Analyse cette image.");
    }

    // Mode texte normal
    await handleGemini(api, message, prompt);
  },

  // Activation du mode réponse automatique
  onReply: async function ({ args, event, api, message, Reply }) {
    const newPrompt = event.body?.trim();
    if (!newPrompt) return;
    await handleGemini(api, message, newPrompt);
  },

  // Répond automatiquement quand on répond à ses messages
  onChat: async function ({ api, event, message }) {
    if (!event.body) return;

    // Réponse à l’un de ses messages → mode conversation
    if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
      const replyText = event.body.trim();
      if (!replyText) return;
      await handleGemini(api, message, replyText);
      return;
    }

    // Commande directe avec préfixe
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (prefix) {
      const args = event.body.slice(prefix.length).trim().split(/\s+/);
      this.onStart({ message, args, event, api });
    }
  }
};

// --- FONCTIONS SECONDAIRES ---

// 💬 Réponses texte
async function handleGemini(api, message, prompt) {
  try {
    const apiUrl = `https://api-library-kohi.onrender.com/api/gemini?prompt=${encodeURIComponent(`${RP}: ${prompt}`)}&imageUrl=&user=22`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    const response = data?.data || data?.message || data?.result || "🤖 Aucune réponse reçue.";
    const styled = applyFont(response.toString());
    const chunks = splitMessage(styled);

    for (const chunk of chunks) {
      const msg = await message.reply("💬 " + chunk + " 🌸");
      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "ai",
        author: message.senderID
      });
    }
  } catch (err) {
    console.error(err);
    const errMsg = err.code === "ECONNABORTED"
      ? "⚠️ Le serveur met trop de temps à répondre."
      : "❌ Erreur avec l’API Gemini.";
    message.reply(applyFont(errMsg));
  }
}

// 🖼️ Génération d’image (ai create)
async function generateImage(api, message, desc) {
  try {
    const url = `https://aryanapi.up.railway.app/api/deepimage?prompt=${encodeURIComponent(desc)}&version=1`;
    const { data } = await axios.get(url, { timeout: 20000 });

    if (!data?.data?.output_url)
      return message.reply("❌ Impossible de générer l’image.");

    await message.reply({
      body: `🎨 Image générée pour : ${desc}`,
      attachment: await global.utils.getStreamFromURL(data.data.output_url)
    });
  } catch (err) {
    console.error(err);
    message.reply("⚠️ Erreur lors de la génération de l’image.");
  }
}

// 🧩 Analyse d’image (reply à une image)
async function analyzeImage(api, message, imageUrl, prompt) {
  try {
    const apiUrl = `https://api-library-kohi.onrender.com/api/gemini?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}&user=77888`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    const response = data?.data || "Aucune réponse reçue.";
    const styled = applyFont(response.toString());
    await message.reply("📸 " + styled + " ✨");
  } catch (err) {
    console.error(err);
    message.reply("❌ Erreur lors de l’analyse d’image.");
  }
}