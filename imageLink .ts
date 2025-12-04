import axios from "axios";

const config = {
  name: "generateImage",
  version: "1.0.0",
  permissions: [0],
  noPrefix: "both",
  credits: "Voldigo",
  description: "Generate an AI image from your text prompt.",
  category: "AI",
  usages: "[prompt text]",
  cooldown: 5,
};

const style = {
  titleFont: "bold",
  title: "🖼️ AI Imagelink Generator",
  contentFont: "fancy",
};

async function onCall({ message, args }) {
  const prompt = args.join(" ");
  if (!prompt) return message.reply("❌ Please provide a prompt to generate an image.");

  await message.reply("🎨 Generating imagelink...");

  try {
    const api = `https://api.nekolabs.web.id/ai/ai4chat/image?prompt=${encodeURIComponent(prompt)}&ratio=1:1`;
    const res = await axios.get(api);

    if (res.data.success && res.data.result) {
      await message.reply(`🖼️ Here is your image link for prompt: "${prompt}"\n${res.data.result}`);
    } else {
      await message.reply("❌ Failed to generate image. Please try again.");
    }
  } catch (err: any) {
    console.error(err);
    await message.reply(`❌ Error: ${err?.message || "Unknown error"}`);
  }
}

export default {
  config,
  onCall,
  style,
};