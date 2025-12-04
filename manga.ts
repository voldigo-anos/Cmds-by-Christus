import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "manga1",
  meta: {
    otherNames: ["mangaai", "mangagen", "animeart"],
    author: "Christus Dev AI",
    description: "Generate manga-style images with AI.",
    icon: "🖌️",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Manga AI 🎨",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface MangaResponse {
  status: string;
  operator: string;
  url?: string;
}

async function main({
  output,
  args,
  commandName,
  prefix,
  input,
  cancelCooldown,
}: CommandContext) {
  const prompt = args.join(" ");
  await output.reaction("🕐");

  if (!prompt) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply(
      `💬 Please provide a prompt for **Manga AI**.\n\nExample: ${prefix}${commandName} A cute cat in manga style`
    );
  }

  try {
    const apiURL = `https://arychauhann.onrender.com/api/manga?prompt=${encodeURIComponent(
      prompt
    )}`;

    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const res: AxiosResponse<MangaResponse> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    if (res.data.status !== "success" || !res.data.url) {
      await output.reaction("⚠️");
      cancelCooldown();
      return output.reply("⚠️ Failed to generate the manga image. Try again.");
    }

    const form: StrictOutputForm = {
      body: `🖌️ **Manga AI Result**\nPrompt: ${prompt}\n`,
      image: res.data.url,
    };

    await output.reaction("✅");
    await output.reply(form);
  } catch (err: any) {
    console.error("Error calling Manga AI API:", err?.message || err);
    await output.reaction("⚠️");
    cancelCooldown();
    return output.reply(
      `❗ **API connection error**\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;