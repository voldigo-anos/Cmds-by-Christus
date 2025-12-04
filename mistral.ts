import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "heurist",
  meta: {
    otherNames: ["mixtral", "mistral", "askheurist"],
    author: "Christus Dev AI",
    description:
      "A conversational AI powered by Heurist Mistral Mixtral-8x7b Instruct.",
    icon: "📝",
    version: "1.1.0",
    noPrefix: "both",
  },
  title: {
    content: "📝 Heurist Mixtral-8x7b",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  style: {
    title: { color: "#FFDD00", text_font: "bold" },
    body: { color: "#FFFFFF", text_font: "regular" },
    line: { color: "#555555" },
  },
  run(ctx) {
    return main(ctx);
  },
});

export interface HeuristResponseType {
  status: boolean;
  result?: string;
}

async function main({
  output,
  args,
  commandName,
  prefix,
  input,
  cancelCooldown,
}: CommandContext) {
  let ask = args.join(" ");
  await output.reaction("🟡");

  if (!ask) {
    cancelCooldown();
    await output.reaction("🔴");
    return output.reply(
      `❓ Please provide a question for **Heurist Bot**.\n\nExample: ${prefix}${commandName} Tell me about AI.`
    );
  }

  try {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const apiURL = `https://arychauhann.onrender.com/api/heurist?prompt=${encodeURIComponent(
      ask
    )}&model=mistralai%2Fmixtral-8x7b-instruct`;

    const res: AxiosResponse<HeuristResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    const answer = res.data?.result || "⚠️ No response from Heurist Bot.";

    const form: StrictOutputForm = {
      body: `━━━━━━━━━━━━━━━\n` +
            `🌌 **Heurist Bot**\n\n` +
            `${answer}\n\n` +
            `―――――――――――――――\n` +
            `💬 *You can reply to continue the conversation.*\n` +
            `━━━━━━━━━━━━━━━`,
    };

    await output.reaction("🟢");
    const info = await output.reply(form);

    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("Error calling Heurist API:", err?.message || err);
    await output.reaction("🔴");
    cancelCooldown();
    return output.reply(
      `❗ An error occurred while connecting to the API.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;