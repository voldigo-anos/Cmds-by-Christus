module.exports.config = {
  name: "autopost",
  version: "2.1.0",
  description: "Autopost garden tracker with multiple user scores, names, gear, seeds, eggs, cosmetics, honey, weather, earning points to balance, and on/off",
  usage: "autopost on/off/score",
  role: 0,
  author: 'Christus x Aesther'
};

let autoPostInterval = null;
let activeUsers = new Set(); // Set of active user IDs
let userScores = {}; // Simple in-memory storage for user scores
let userNames = {}; // Cache for user names

module.exports.onStart = async function({ api, event, usersData }) { // Added usersData
  const args = event.body.slice(9).trim().split(' ');
  const action = args[0];
  const replyToId = event.messageID;
  const userId = event.senderID;

  if (action === 'on') {
    if (activeUsers.has(userId)) {
      api.sendMessage('You are already in the autopost!', event.threadID, replyToId);
      return;
    }
    // Get user name
    if (!userNames[userId]) {
      try {
        const userInfo = await api.getUserInfo(userId);
        userNames[userId] = userInfo[userId].name;
      } catch (error) {
        userNames[userId] = 'Unknown';
      }
    }
    activeUsers.add(userId);
    if (!userScores[userId]) userScores[userId] = 0;

    if (!autoPostInterval) {
      // Start the interval if not already running
      autoPostInterval = setInterval(async () => {
        // Sample gear (added Ticket 2)
        const gear = [
          '- Trading Ticket: x1',
          '- 🧴 Cleaning Spray: x1',
          '- 🛠 Trowel: x3',
          '- 🔧 Recall Wrench: x3',
          '- 🚿 Watering Can: x3',
          '- ❤ Favorite Tool: x2',
          '- 💧 Basic Sprinkler: x3',
          '- 🌾 Harvest Tool: x1',
          '- 🎫 Ticket 2: x1' // Added Ticket 2
        ];

        // Base seeds (added corn and apple)
        const baseSeeds = [
          '- 🥕 Carrot: x14',
          '- 🍇 Grape: x1',
          '- 🍓 Strawberry: x5',
          '- 🌷 Orange Tulip: x24',
          '- 🍅 Tomato: x3',
          '- 🫐 Blueberry: x5',
          '- 🍎 Apple: x10',
          '- 🍌 Banana: x20',
          '- 🌽 Corn: x8', // Added
          '- 🍎 Red Apple: x15' // Added
        ];

        // Shuffle seeds for randomness
        const shuffledSeeds = baseSeeds.sort(() => 0.5 - Math.random());
        const selectedSeeds = shuffledSeeds.slice(0, 6);

        // Eggs
        const eggs = [
          '- 🥚 Common Egg: x1',
          '- 🥚 Common Egg: x1',
          '- 🥚 Common Egg: x1'
        ];

        // Cosmetics
        const cosmetics = [
          '- Beach Crate: x2',
          '- Cabana: x1',
          '- Compost Bin: x1',
          '- Torch: x1',
          '- Long Stone Table: x1',
          '- Rock Pile: x1',
          '- Small Circle Tile: x5',
          '- Large Wood Table: x1',
          '- Bookshelf: x1'
        ];

        // Honey (added more)
        const honey = [
          '- Corrupt Radar: x1',
          '- Zen Seed Pack: x1',
          '- Sakura Bush: x1',
          '- Zenflare: x2',
          '- Tranquil Radar: x2',
          '- Honeycomb: x5', // Added
          '- Beehive: x3', // Added
          '- Royal Jelly: x2' // Added
        ];

        // Weather
        const weather = '⚡ Thunderstorm\n📋 Thunderstorm - Ends: 14:42 - Duration: 3 minutes\n+50% Grow Speed! Higher SHOCKED Fruit Chance!\n🎯 +50% growth; same Wet chance';

        const gearMessage = gear.join('\n');
        const seedsMessage = selectedSeeds.join('\n');
        const eggsMessage = eggs.join('\n');
        const cosmeticsMessage = cosmetics.join('\n');
        const honeyMessage = honey.join('\n');

        // Build active users list
        const activeUsersList = Array.from(activeUsers).map(id => {
          const name = userNames[id] || 'Unknown';
          const score = userScores[id] || 0;
          return `👤 ${name}: 🏆 ${score}`;
        }).join('\n');

        const fullMessage = `𝗚𝗮𝗿𝗱𝗲𝗻 — 𝗧𝗿𝗮𝗰𝗸𝗲𝗿\n\n🛠 𝗚𝗲𝗮𝗿:\n${gearMessage}\n⏳ Restock In: 00h 04m 55s\n\n🌱 𝗦𝗲𝗲𝗱𝘀:\n${seedsMessage}\n⏳ Restock In: 00h 04m 55s\n\n🥚 𝗘𝗴𝗴𝘀:\n${eggsMessage}\n⏳ Restock In: 00h 19m 55s\n\n🎨 𝗖𝗼𝘀𝗺𝗲𝘁𝗶𝗰𝘀:\n${cosmeticsMessage}\n⏳ Restock In: 06h 19m 55s\n\n🍯 𝗛𝗼𝗻𝗲𝘆:\n${honeyMessage}\n⏳ Restock In: 00h 19m 55s\n\n🌤 𝗪𝗲𝗮𝘁𝗵𝗲𝗿:\n${weather}\n\n🏅 𝗔𝗰𝘁𝗶𝘃𝗲 𝗨𝘀𝗲𝗿𝘀:\n${activeUsersList}\n\n📅 Updated at (PH): ${new Date().toLocaleString('en-PH')}\n\n🌟 Beautiful Garden Tracker! 🌟`;

        try {
          api.createPost(fullMessage);
          // Increase score and update money for all active users (now 86000)
          for (const id of activeUsers) {
            if (!userScores[id]) userScores[id] = 0;
            userScores[id] += 86000; // Updated earning
            // Update money in usersData
            const userData = await usersData.get(id) || { money: 0 };
            const newMoney = (userData.money || 0) + 86000; // 86K money unit
            await usersData.set(id, { ...userData, money: newMoney });
          }
        } catch (error) {
          // Optional: log error
        }
      }, 120000); // 2 minutes
    }
    api.sendMessage('Autopost turned on! You are now active and will earn 86K scores and money per post. Posting every 2 minutes.', event.threadID, replyToId);
  } else if (action === 'off') {
    if (activeUsers.has(userId)) {
      activeUsers.delete(userId);
      if (activeUsers.size === 0) {
        clearInterval(autoPostInterval);
        autoPostInterval = null;
      }
      api.sendMessage('Autopost turned off for you!', event.threadID, replyToId);
    } else {
      api.sendMessage('You are not in the autopost!', event.threadID, replyToId);
    }
  } else if (action === 'score') {
    const score = userScores[userId] || 0;
    api.sendMessage(`Your score: ${score}`, event.threadID, replyToId);
  } else {
    api.sendMessage('Usage: autopost on/off/score', event.threadID, replyToId);
  }
};