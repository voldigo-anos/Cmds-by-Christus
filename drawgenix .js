const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "drawgenix",
    version: "1.0",
    author: "Christus",.
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI image from text",
    longDescription: "Generate an image using a given prompt and optional model flag (e.g., --fluxpro)",
    category: "image generator",
    guide: "{pn} your prompt --modelname\nExample: {pn} cat samurai --pixart"
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const globalPrefix = global.GoatBot.config.prefix || "!";
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;
    const fullText = args.join(" ").toLowerCase();

    // 🆘 Help command
    if (fullText === "help" || fullText === "--help") {
      const helpMessage = `
╭─🎨 𝗗𝗥𝗔𝗪𝗚𝗘𝗡𝗜𝗫 𝗛𝗘𝗟𝗣
│ 🧠 AI diye image toiri korte prompt dao.
│ 
│ ✏️ Use:
│   ${threadPrefix}drawgenix tomar prompt
│   ${threadPrefix}drawgenix tomar prompt --model
│
│ 🖼️ Example:
│   ${threadPrefix}drawgenix cat samurai --pixart
│   ${threadPrefix}drawgenix anime girl with sword
│
│ 🧩 Model Support:
│   --pixart | --realistic | --anime | --fluxpro
╰────────────────────────
`;
      return message.reply(helpMessage.trim());
    }

    // ⚠️ Prompt check
    if (!args[0]) {
      return message.reply(
        `⚠️ | Prompt koi bhai?\n\n🔍 AI diye chobi toiri korte text prompt dite hobe.\n\n📌 Example:\n${threadPrefix}drawgenix robot with wings --anime\n${threadPrefix}drawgenix help`
      );
    }

    let prompt = "";
    let model = "";

    if (event.type === "message_reply" && event.messageReply?.body) {
      prompt = event.messageReply.body;
    } else {
      prompt = args.join(" ");
    }

    const modelMatch = prompt.match(/--(\w+)/);
    if (modelMatch) {
      model = modelMatch[1];
      prompt = prompt.replace(`--${model}`, "").trim();
    }

    const apiUrl = `https://mj-s6wm.onrender.com/draw?prompt=${encodeURIComponent(prompt)}${model ? `&model=${model}` : ""}`;

    try {
      const waitMsg = `
🎨 Chobi toiri hocche...
📌 Prompt: ${prompt}
${model ? `🧠 Model: ${model}` : "🤖 Model: Default"}
      `.trim();

      message.reply(waitMsg);

      const res = await axios.get(apiUrl);
      const images = res.data?.images;

      if (!images || images.length === 0) {
        return message.reply("⚠️ | mdr ton prompt.");
      }

      const imageStream = await getStreamFromURL(images[0]);

      return message.reply({
        body: `✅ voici votre image👇`,
        attachment: imageStream
      });

    } catch (err) {
      console.error("❌ Drawgenix error:", err.message);
      return message.reply("❌ | Image generate korte somossa hocche. Server down thakte pare.");
    }
  }
};