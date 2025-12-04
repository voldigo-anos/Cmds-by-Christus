import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "webpilot",
  meta: {
    otherNames: ["wp", "webp", "pilot"],
    author: "Christus",
    description: "AI conversational system powered by NekoLabs WebPilot-AI API.",
    icon: "🌐",
    version: "1.0.1",
    noPrefix: "both",
  },
  title: {
    content: "🤖 WebPilot AI",
    text_font: "bold",
    line_bottom: "fancy",
  },
  content: {
    content: null,
    text_font: "italic",
    line_bottom: "default",
  },
  style: {
    title: { color: "#00FFAA", text_font: "bold" },
    body: { color: "#E0E0FF", text_font: "regular" },
    line: { color: "#8888FF" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface WebPilotAPIResponse {
  success: boolean;
  result?: {
    chat?: string;
    source?: { link: string; title: string }[];
  };
}

async function main({ output, args, input, commandName, prefix, cancelCooldown }: CommandContext) {
  const ask = args.join(" ");
  await output.reaction("🌐"); // Début

  if (!ask) {
    cancelCooldown();
    await output.reaction("⚠️");
    return output.reply(
      `❓ Please provide a message.\n\nExample: ${prefix}${commandName} What's WebPilot AI?`
    );
  }

  try {
    const apiURL = `https://api.nekolabs.web.id/ai/webpilot-ai?text=${encodeURIComponent(ask)}`;
    const headers: AxiosRequestConfig["headers"] = { "Content-Type": "application/json" };

    const res: AxiosResponse<WebPilotAPIResponse> = await axios.get(apiURL, { headers, timeout: 30_000 });

    const chatText = res.data?.result?.chat || "⚠️ No response received from WebPilot-AI API.";
    const sources = res.data?.result?.source?.map((s) => `🔗 [${s.title}](${s.link})`).join("\n") || "";

    const form: StrictOutputForm = {
      body:
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 **WebPilot AI Says:**\n\n` +
        `📨 ${chatText}\n\n` +
        (sources ? `📚 **Sources:**\n${sources}\n\n` : "") +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 ****Reply to continue the conversation!****`,
    };

    await output.reaction("✨"); // Succès stylé
    const msg = await output.reply(form);

    // 📌 Conversation continue
    msg.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });

  } catch (err: any) {
    console.error("WebPilot-AI API error:", err?.message || err);
    await output.reaction("❌"); // Erreur stylée
    cancelCooldown();
    return output.reply(
      `❗ **API Error**\n\nMessage: ${err?.message || "Unknown error"}`
    );
  }
}

export default cmd;