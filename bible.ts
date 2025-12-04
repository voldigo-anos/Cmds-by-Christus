import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const cmd = easyCMD({
  name: "biblegpt",
  meta: {
    otherNames: ["bible", "bgpt", "scripture"],
    author: "Christus Dev AI",
    description:
      "Ask questions and get answers from BibleGPT.",
    icon: "📖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "BibleGPT 🕊️",
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

export interface ResponseType {
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
  usersDB,
}: CommandContext) {
  let question = args.join(" ");
  await output.reaction("🟡");

  if (!question) {
    cancelCooldown();
    await output.reaction("🔴");
    return output.reply(
      `❓ Please provide a question for **BibleGPT**.\n\nExample: ${prefix}${commandName} Who was David?`
    );
  }

  try {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };

    const apiURL = `https://arychauhann.onrender.com/api/biblegpt?prompt=${encodeURIComponent(
      question
    )}`;

    const res: AxiosResponse<ResponseType> = await axios.get(apiURL, {
      headers,
      timeout: 25_000,
    });

    const answer = res.data?.result || "⚠️ No response from BibleGPT.";

    const form: StrictOutputForm = {
      body: `📖 **BibleGPT**\n\n${answer}\n\n***You can reply to continue the conversation.***`,
    };

    await output.reaction("🟢");
    const info = await output.reply(form);

    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({ ...rep, args: rep.input.words });
    });
  } catch (err: any) {
    console.error("Error calling BibleGPT API:", err?.message || err);
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