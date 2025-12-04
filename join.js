const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "join",
    version: "0.0.1",
    author: "Christus x Aesther",
    countDown: 10,
    role: 2,
    shortDescription: {
      en: "List groups with pagination & add author+runner when selected"
    },
    longDescription: {
      en: "Shows all groups where bot is a member (8 per page). Use 'next'/'prev' to navigate. Reply with number to add author+runner."
    },
    category: "owner",
    guide: {
      en: "{p}join → list groups (8 per page)\nReply number → add author+runner\nReply 'next'/'prev' → navigate"
    }
  },

  onStart: async function ({ api, message, threadsData, event }) {
    const allThreads = await threadsData.getAll();
    const groups = allThreads.filter(t => t.isGroup);

    if (groups.length === 0) return message.reply("❌ No groups found.");

    const page = 1;
    const perPage = 8;
    const totalPages = Math.ceil(groups.length / perPage);

    const msg = await this.renderPage(api, groups, page, perPage, totalPages);

    return message.reply(msg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        groups,
        page,
        perPage,
        totalPages
      });
    });
  },

  onReply: async function ({ api, message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const body = event.body.trim().toLowerCase();

    if (body === "next" || body === "prev") {
      let newPage = Reply.page;
      if (body === "next" && Reply.page < Reply.totalPages) newPage++;
      else if (body === "prev" && Reply.page > 1) newPage--;

      const msg = await this.renderPage(api, Reply.groups, newPage, Reply.perPage, Reply.totalPages);
      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          ...Reply,
          page: newPage
        });
      });
    }

    const choice = parseInt(body);
    if (isNaN(choice)) return message.reply("❌ Invalid input. Reply with number, 'next', or 'prev'.");

    const index = (Reply.page - 1) * Reply.perPage + (choice - 1);
    if (index < 0 || index >= Reply.groups.length) return message.reply("❌ Invalid choice.");

    const selectedGroup = Reply.groups[index];
    const threadID = selectedGroup.threadID;
    const authorUID = "61575494292207";
    const runnerUID = event.senderID;
    const allToAdd = Array.from(new Set([authorUID, runnerUID]));

    let added = 0, skipped = 0, failed = 0;

    try {
      const { participantIDs, adminIDs, approvalMode } = await api.getThreadInfo(threadID);
      const botID = api.getCurrentUserID();

      for (const uid of allToAdd) {
        if (participantIDs.includes(uid)) {
          skipped++;
          continue;
        }
        try {
          await api.addUserToGroup(uid, threadID);
          await sleep(500);
          if (approvalMode && !adminIDs.includes(botID)) {
            console.log(`🟡 Approval needed for UID ${uid} in ${threadID}`);
          }
          added++;
        } catch (err) {
          console.log(`❌ Failed to add UID ${uid} in ${threadID}: ${err.message}`);
          failed++;
        }
      }

      const info = await api.getThreadInfo(threadID);
      const approval = info.approvalMode ? "✅ Approved On" : "❌ Approved Off";
      const memberCount = info.participantIDs.length;

      const box = `┌───────────┐\n` +
        `│ 📦 𝗔𝗱𝗱 𝗔𝗱𝗺𝗶𝗻\n` +
        `├───────────┤\n` +
        `│ 🟢 Added   : ${added}\n` +
        `│ 🟡 Skipped : ${skipped}\n` +
        `│ 🔴 Failed  : ${failed}\n` +
        `│👑 Synced author + runner (${runnerUID})\n` +
        `│📌 Group: ${info.threadName || "Unnamed"}\n` +
        `│🆔 ${threadID}\n` +
        `│👥 Members: ${memberCount}\n` +
        `│🔐 ${approval}\n`+
        `└───────────┘`;

      return message.reply(box);

    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  },

  renderPage: async function (api, groups, page, perPage, totalPages) {
    let msg = `📦 Groups where bot is a member (Page ${page}/${totalPages}):\n\n`;
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, groups.length);

    for (let i = start; i < end; i++) {
      const g = groups[i];
      try {
        const info = await api.getThreadInfo(g.threadID);
        const approval = info.approvalMode ? "✅ Approved On" : "❌ Approved Off";
        const memberCount = info.participantIDs.length;

        msg += `${i - start + 1}. ${g.threadName || "Unnamed"}\n🆔 ${g.threadID}\n👥 Members: ${memberCount}\n🔐 ${approval}\n\n`;
      } catch (err) {
        msg += `${i - start + 1}. ${g.threadName || "Unnamed"}\n🆔 ${g.threadID}\n⚠ Failed to fetch info\n\n`;
      }
    }

    msg += `👉 Reply with number to add author+runner.\n`;
    if (page < totalPages) msg += `➡ Reply "next" for next page.\n`;
    if (page > 1) msg += `⬅ Reply "prev" for previous page.\n`;

    return msg;
  }
};