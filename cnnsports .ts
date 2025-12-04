import axios from "axios";

const config = {
  name: "cnnSports",
  version: "1.0.0",
  permissions: [0],
  noPrefix: "both",
  credits: "ChriTus",
  description: "Get the latest sports news from CNN Indonesia.",
  category: "News",
  usages: "[optional: number of articles]",
  cooldown: 5,
};

const style = {
  titleFont: "bold",
  title: "🏆 CNN Sports News",
  contentFont: "regular",
};

async function onCall({ message, args, getLang }) {
  const count = Math.min(parseInt(args[0]) || 5, 10); // max 10 articles
  await message.reply("📰 Fetching latest sports news...");

  try {
    const res = await axios.get("https://api.nekolabs.web.id/news/cnn/sports");
    const articles = res.data.result.slice(0, count);

    if (!articles || articles.length === 0)
      return message.reply("⚠️ No news articles found.");

    let newsMsg = `🏆 **Latest CNN Sports News** 🏆\n\n`;
    articles.forEach((a: any, i: number) => {
      newsMsg += `**${i + 1}. ${a.title}**\n${a.description}\n[Read more](${a.url})\n🗓 ${new Date(a.date).toLocaleString()}\n\n`;
    });

    await message.reply(newsMsg);
  } catch (err: any) {
    console.error(err);
    await message.reply(`⚠️ Error fetching news: ${err?.message || "Unknown error"}`);
  }
}

export default {
  config,
  onCall,
  style,
};