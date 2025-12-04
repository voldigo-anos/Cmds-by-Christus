import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "heckai",
  meta: {
    otherNames: ["heck","hk"],
    author: "Voldigo",
    description: "AI conversational system powered by HeckAI API.",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "🤖 HeckAI",
    text_font: "bold",
    line_bottom: "fancy",
  },
  content: {
    content: null,
    text_font: "regular",
    line_bottom: "default",
  },
  style: {
    title: { color: "#FFAA00", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#FF8800" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface HeckAIResponse {
  status: boolean;
  operator: string;
  result?: {
    answer?: string;
    related?: string;
    source?: { link?: string; title?: string }[];
  };
}

async function main({ output, args, input, commandName, prefix, cancelCooldown }: CommandContext) {
  const prompt = args.join(" ");
  await output.reaction("🌀"); // Début

  if (!prompt) {
    cancelCooldown();
    await output.reaction("⚠️");
    return output.reply(
      `❓ Please provide a prompt.\n\nExample: ${prefix}${commandName} Hello HeckAI!`
    );
  }

  try {
    const apiURL = `https://shizuapi.onrender.com/api/heckai?prompt=${encodeURIComponent(prompt)}&model=1`;
    const headers: AxiosRequestConfig["headers"] = { "Content-Type": "application/json" };

    const res: AxiosResponse<HeckAIResponse> = await axios.get(apiURL, { headers, timeout: 30_000 });

    const answerText = res.data?.result?.answer?.trim() || "⚠️ No response received from HeckAI API.";
    const relatedText = res.data?.result?.related?.trim() || "";
    
    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 **HeckAI Says:**\n\n` +
        `${answerText}\n` +
        (relatedText ? `\n✨ **Related Questions:**\n${relatedText}` : "") +
        `\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 ***Reply to continue the conversation!***`,
    };

    await output.reaction("✨"); // Succès stylé
    const msg = await output.reply(form);

    // 📌 Conversation continue
    msg.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });

  } catch (err: any) {
    console.error("HeckAI API error:", err?.message || err);
    await output.reaction("❌"); // Erreur stylée
    cancelCooldown();
    return output.reply(
      `❗ **API Error**\n\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;