const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "steal",
    aliases: [],
    version: "3.0",
    author: "Christus x Aesther",
    countDown: 5,
    role: 2,
    longDescription: {
      en: "Copy members from one group to another (ThreadID-based stealing)"
    },
    category: "tools",
    guide: {
      en: `{p}steal [threadID] - Steal members from another group\n\nNote: The bot must be in both groups.`
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const currentThreadID = threadID;
    const targetThreadID = args[0];

    if (!targetThreadID || isNaN(targetThreadID)) {
      return api.sendMessage("❌ Please provide a valid target group Thread ID!\n\nUsage: steal [threadID]", threadID, messageID);
    }

    try {
      const threadInfo = await api.getThreadInfo(targetThreadID);
      const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

      if (!members || members.length === 0) {
        return api.sendMessage("⚠️ No members found to steal from the target group.", threadID, messageID);
      }

      let added = 0;
      let failed = 0;

      api.sendMessage(`⏳ Starting member steal process...\nTarget Group: ${targetThreadID}\nTotal Members: ${members.length}`, threadID);

      for (const userID of members) {
        try {
          await api.addUserToGroup(userID, currentThreadID);
          added++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          failed++;
        }
      }

      const msg =
        `🎯 Steal Process Completed!\n\n` +
        `👥 Members Scanned: ${members.length}\n✅ Added: ${added}\n❌ Failed: ${failed}\n\n` +
        `💡 Tip: Some users may have settings preventing being added or already in the group.`;

      return api.sendMessage(msg, currentThreadID);
    } catch (error) {
      console.error("Steal Error:", error.message);
      return api.sendMessage(
        "❌ Failed to fetch target group info. Please ensure the Thread ID is correct and the bot is present in that group.",
        threadID
      );
    }
  }
};