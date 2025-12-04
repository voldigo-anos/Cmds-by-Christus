module.exports = {
	config: {
		name: "count",
		version: "69",
		author: "Christus",
		countDown: 2,
		role: 0,
		description: {
			en: "View the message count leaderboard as an image (since the bot joined the group)."
		},
		category: "box chat",
		guide: {
			en: "   {pn}: View your activity card."
				+ "\n   {pn} @tag: View the activity card of tagged users."
				+ "\n   {pn} all: View the leaderboard of all members."
				+ "\n   {pn} reply: View activity card of replied user."
				+ "\n   {pn} setwall: Set personal background from replied image."
				+ "\n   {pn} theme <theme name>: Change personal theme"
				+ "\n   {pn} themes: View all available themes"
				+ "\n   {pn} createtheme <name> <primary> <secondary> <bg1> <bg2>: Create new theme"
				+ "\n   {pn} reset: Reset to default theme"
		},
		envConfig: {
			"ACCESS_TOKEN": "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
		}
	},

	langs: {
		en: {
			invalidPage: "Invalid page number.",
			leaderboardTitle: "GROUP ACTIVITY LEADERBOARD",
			userCardTitle: "ACTIVITY CARD",
			page: "Page %1/%2",
			reply: "Reply to this message with a page number to see more.",
			totalMessages: "Total Messages",
			serverRank: "Server Rank",
			dailyActivity: "Last 7 Days Activity",
			messageBreakdown: "Message Breakdown",
			busiestDay: "BUSIEST DAY",
			text: "Text",
			sticker: "Sticker",
			media: "Media",
			fallbackName: "Facebook User",
			replyGuide: "Reply to someone's message with this command to view their activity card",
			wallSet: "✅ Personal background wall set successfully!",
			wallError: "❌ Please reply to an image to set as background.",
			themeChanged: "✅ Personal theme changed to: %1",
			availableThemes: "🎨 Available themes: classic, love, tie_dye, space, forest, sunset",
			invalidTheme: "❌ Invalid theme. Use '{pn} themes' to see all available themes.",
			resetSuccess: "✅ Theme reset to default!",
			personalTheme: "🎨 Your personal theme: %1",
			themeList: "🌈 AVAILABLE THEMES (%1 themes):\n%2",
			themeCreated: "✅ New theme created: %1",
			themeCreateError: "❌ Error creating theme. Please check syntax: {pn} createtheme <name> <primary> <secondary> <bg1> <bg2>",
			customThemeHelp: "💡 Create new theme: {pn} createtheme name #FFFFFF #FFB6C1 #D81B60 #AD1457"
		}
	},

	onLoad: function () {
		const { resolve } = require("path");
		const { existsSync, mkdirSync } = require("fs-extra");
		const { execSync } = require("child_process");

		console.log("COMMAND: COUNT | Checking for required packages...");
		const packages = ["canvas", "axios", "fs-extra", "moment-timezone"];
		for (const pkg of packages) {
			try {
				require.resolve(pkg);
			} catch (err) {
				console.error(`COMMAND: COUNT | Dependency '${pkg}' not found. Installing...`);
				try {
					execSync(`npm install ${pkg}`, { stdio: "inherit" });
				} catch (installErr) {
					console.error(`COMMAND: COUNT | Failed to install '${pkg}'. Please run 'npm install ${pkg}' manually and restart the bot.`);
					throw new Error(`Dependency installation failed for ${pkg}`);
				}
			}
		}

		try {
			const { registerFont } = require("canvas");
			const assetsPath = resolve(__dirname, "assets", "count");
			if (!existsSync(assetsPath)) mkdirSync(assetsPath, { recursive: true });
			const fontPath = resolve(assetsPath, "font.ttf");
			if (existsSync(fontPath)) {
				registerFont(fontPath, { family: "BeVietnamPro" });
			} else {
				console.log("COMMAND: COUNT | Custom font not found, using system fonts.");
			}
		} catch (e) {
			console.error("COMMAND: COUNT | Canvas is not installed correctly, cannot load fonts.", e);
		}
	},
	// GoatBot Database Helpers
	dbHelpers: {
		// Activity Data Functions
		getActivityData: async function(globalData, threadID, userID) {
			try {
				if (!globalData.countActivity) globalData.countActivity = {};
				if (!globalData.countActivity[threadID]) globalData.countActivity[threadID] = {};
				
				if (!globalData.countActivity[threadID][userID]) {
					globalData.countActivity[threadID][userID] = {
						total: 0,
						types: { text: 0, sticker: 0, media: 0 },
						daily: {},
						lastUpdated: new Date()
					};
				}
				return globalData.countActivity[threadID][userID];
			} catch (error) {
				console.error("Error getting activity data:", error);
				return {
					total: 0,
					types: { text: 0, sticker: 0, media: 0 },
					daily: {},
					lastUpdated: new Date()
				};
			}
		},

		updateActivityData: async function(globalData, threadID, userID, updateData) {
			try {
				if (!globalData.countActivity) globalData.countActivity = {};
				if (!globalData.countActivity[threadID]) globalData.countActivity[threadID] = {};
				
				globalData.countActivity[threadID][userID] = {
					...globalData.countActivity[threadID][userID],
					...updateData,
					lastUpdated: new Date()
				};
				return true;
			} catch (error) {
				console.error("Error updating activity data:", error);
				return false;
			}
		},

		getThreadActivities: async function(globalData, threadID) {
			try {
				if (!globalData.countActivity) return {};
				return globalData.countActivity[threadID] || {};
			} catch (error) {
				console.error("Error getting thread activities:", error);
				return {};
			}
		},

		// User Theme Functions
		getUserTheme: async function(globalData, userID) {
			try {
				if (!globalData.countThemes) globalData.countThemes = {};
				
				if (!globalData.countThemes[userID]) {
					globalData.countThemes[userID] = {
						currentTheme: 'classic',
						customWallpaper: null,
						lastUpdated: new Date()
					};
				}
				return globalData.countThemes[userID];
			} catch (error) {
				console.error("Error getting user theme:", error);
				return {
					currentTheme: 'classic',
					customWallpaper: null,
					lastUpdated: new Date()
				};
			}
		},

		updateUserTheme: async function(globalData, userID, updateData) {
			try {
				if (!globalData.countThemes) globalData.countThemes = {};
				
				globalData.countThemes[userID] = {
					...globalData.countThemes[userID],
					...updateData,
					lastUpdated: new Date()
				};
				return true;
			} catch (error) {
				console.error("Error updating user theme:", error);
				return false;
			}
		},

		// Custom Themes Functions
		getCustomThemes: async function(globalData) {
			try {
				if (!globalData.countCustomThemes) globalData.countCustomThemes = {};
				return globalData.countCustomThemes;
			} catch (error) {
				console.error("Error getting custom themes:", error);
				return {};
			}
		},

		addCustomTheme: async function(globalData, themeName, themeData) {
			try {
				if (!globalData.countCustomThemes) globalData.countCustomThemes = {};
				globalData.countCustomThemes[themeName] = themeData;
				return true;
			} catch (error) {
				console.error("Error adding custom theme:", error);
				return false;
			}
		}
	},
	onChat: async function ({ event, threadsData, usersData, globalData }) {
		const { threadID, senderID } = event;
		const moment = require("moment-timezone");

		try {
			// Update thread members count (GoatBot's built-in system)
			const members = await threadsData.get(threadID, "members");
			const findMember = members.find(function (user) { return user.userID == senderID; });
			if (!findMember) {
				members.push({
					userID: senderID,
					name: await usersData.getName(senderID),
					count: 1
				});
			} else {
				findMember.count = (findMember.count || 0) + 1;
			}
			await threadsData.set(threadID, members, "members");
		} catch (err) {
			console.error("COMMAND: COUNT | Failed to update count data:", err);
		}

		// Update custom activity data in globalData
		try {
			const { getActivityData, updateActivityData } = this.dbHelpers;
			const activity = await getActivityData(globalData, threadID, senderID);
			
			const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
			
			// Update activity data
			const updateData = {
				total: activity.total + 1,
				daily: { ...activity.daily }
			};

			// Update daily count
			updateData.daily[today] = (updateData.daily[today] || 0) + 1;

			// Update message types
			updateData.types = { ...activity.types };
			if (event.attachments.some(function (att) { return att.type === 'sticker'; })) {
				updateData.types.sticker = (updateData.types.sticker || 0) + 1;
			} else if (event.attachments.length > 0) {
				updateData.types.media = (updateData.types.media || 0) + 1;
			} else {
				updateData.types.text = (updateData.types.text || 0) + 1;
			}

			// Keep only last 7 days
			const sortedDays = Object.keys(updateData.daily).sort(function (a, b) { return new Date(b) - new Date(a); });
			if (sortedDays.length > 7) {
				for (let i = 7; i < sortedDays.length; i++) {
					delete updateData.daily[sortedDays[i]];
				}
			}

			await updateActivityData(globalData, threadID, senderID, updateData);
		} catch (error) {
			console.error("COMMAND: COUNT | Activity data update error:", error);
		}
	},

	onStart: async function ({ args, threadsData, message, event, api, getLang, envCommands, usersData, globalData }) {
		const { Canvas, loadImage } = require("canvas");
		const { resolve } = require("path");
		const { createWriteStream, existsSync } = require("fs-extra");
		const axios = require("axios");
		const moment = require("moment-timezone");
		const { threadID, senderID, mentions, messageReply } = event;

		const ACCESS_TOKEN = envCommands.count.ACCESS_TOKEN;

		const { getUserTheme, updateUserTheme, getThreadActivities, getCustomThemes, addCustomTheme } = this.dbHelpers;

		// --- Authentic Facebook Messenger Theme Definitions --- //
		const themes = {
			// Default Messenger Theme (Classic Blue)
			classic: {
				primary: '#FFFFFF',
				secondary: '#0084FF',
				bg: ['#1877F2', '#0A5BC4'],
				butterflyColor: '#0084FF',
				chartColors: ['#FFFFFF', '#0084FF', '#1877F2']
			},
			// Official Messenger Gradient Themes
			love: {
				primary: '#FFFFFF',
				secondary: '#FF6B9D',
				bg: ['#FF2E63', '#FF6B9D'],
				butterflyColor: '#FF6B9D',
				chartColors: ['#FFFFFF', '#FF6B9D', '#FF2E63']
			},
			tie_dye: {
				primary: '#FFFFFF',
				secondary: '#FF6B9D',
				bg: ['#FF6B9D', '#4CD964'],
				butterflyColor: '#FF6B9D',
				chartColors: ['#FFFFFF', '#FF6B9D', '#4CD964']
			},
			space: {
				primary: '#FFFFFF',
				secondary: '#6B5B95',
				bg: ['#2C3E50', '#6B5B95'],
				butterflyColor: '#6B5B95',
				chartColors: ['#FFFFFF', '#6B5B95', '#2C3E50']
			},
			forest: {
				primary: '#FFFFFF',
				secondary: '#27AE60',
				bg: ['#2ECC71', '#27AE60'],
				butterflyColor: '#27AE60',
				chartColors: ['#FFFFFF', '#27AE60', '#2ECC71']
			},
			sunset: {
				primary: '#FFFFFF',
				secondary: '#FF7F50',
				bg: ['#FF6B6B', '#FFA726'],
				butterflyColor: '#FF7F50',
				chartColors: ['#FFFFFF', '#FF7F50', '#FF6B6B']
			},
			berry: {
				primary: '#FFFFFF',
				secondary: '#9B59B6',
				bg: ['#8E44AD', '#9B59B6'],
				butterflyColor: '#9B59B6',
				chartColors: ['#FFFFFF', '#9B59B6', '#8E44AD']
			},
			ocean: {
				primary: '#FFFFFF',
				secondary: '#3498DB',
				bg: ['#2980B9', '#3498DB'],
				butterflyColor: '#3498DB',
				chartColors: ['#FFFFFF', '#3498DB', '#2980B9']
			},
			sunflower: {
				primary: '#000000',
				secondary: '#F1C40F',
				bg: ['#F39C12', '#F1C40F'],
				butterflyColor: '#F1C40F',
				chartColors: ['#000000', '#F1C40F', '#F39C12']
			},
			lavender: {
				primary: '#FFFFFF',
				secondary: '#9B59B6',
				bg: ['#8E44AD', '#9B59B6'],
				butterflyColor: '#9B59B6',
				chartColors: ['#FFFFFF', '#9B59B6', '#8E44AD']
			},
			rose: {
				primary: '#FFFFFF',
				secondary: '#E74C3C',
				bg: ['#E74C3C', '#C0392B'],
				butterflyColor: '#E74C3C',
				chartColors: ['#FFFFFF', '#E74C3C', '#C0392B']
			},
			peach: {
				primary: '#000000',
				secondary: '#FFB6C1',
				bg: ['#FFA07A', '#FFB6C1'],
				butterflyColor: '#FFB6C1',
				chartColors: ['#000000', '#FFB6C1', '#FFA07A']
			},
			mint: {
				primary: '#000000',
				secondary: '#A3E4D7',
				bg: ['#76D7C4', '#A3E4D7'],
				butterflyColor: '#A3E4D7',
				chartColors: ['#000000', '#A3E4D7', '#76D7C4']
			},
			grape: {
				primary: '#FFFFFF',
				secondary: '#8E44AD',
				bg: ['#6C3483', '#8E44AD'],
				butterflyColor: '#8E44AD',
				chartColors: ['#FFFFFF', '#8E44AD', '#6C3483']
			},
			lemon: {
				primary: '#000000',
				secondary: '#F4D03F',
				bg: ['#F4D03F', '#F7DC6F'],
				butterflyColor: '#F4D03F',
				chartColors: ['#000000', '#F4D03F', '#F7DC6F']
			},
			sky: {
				primary: '#FFFFFF',
				secondary: '#5DADE2',
				bg: ['#3498DB', '#5DADE2'],
				butterflyColor: '#5DADE2',
				chartColors: ['#FFFFFF', '#5DADE2', '#3498DB']
			},
			cotton_candy: {
				primary: '#000000',
				secondary: '#F8C8DC',
				bg: ['#F8C8DC', '#FFAFBD'],
				butterflyColor: '#F8C8DC',
				chartColors: ['#000000', '#F8C8DC', '#FFAFBD']
			},
			neon: {
				primary: '#000000',
				secondary: '#00FF00',
				bg: ['#FF00FF', '#00FF00'],
				butterflyColor: '#00FF00',
				chartColors: ['#000000', '#00FF00', '#FF00FF']
			},			rainbow: {
				primary: '#FFFFFF',
				secondary: '#FF6B6B',
				bg: ['#FF6B6B', '#4ECDC4'],
				butterflyColor: '#FF6B6B',
				chartColors: ['#FFFFFF', '#FF6B6B', '#4ECDC4']
			},
			gold: {
				primary: '#000000',
				secondary: '#FFD700',
				bg: ['#FFD700', '#FFA500'],
				butterflyColor: '#FFD700',
				chartColors: ['#000000', '#FFD700', '#FFA500']
			},
			silver: {
				primary: '#000000',
				secondary: '#C0C0C0',
				bg: ['#A9A9A9', '#C0C0C0'],
				butterflyColor: '#C0C0C0',
				chartColors: ['#000000', '#C0C0C0', '#A9A9A9']
			},
			coffee: {
				primary: '#FFFFFF',
				secondary: '#8B4513',
				bg: ['#A0522D', '#8B4513'],
				butterflyColor: '#8B4513',
				chartColors: ['#FFFFFF', '#8B4513', '#A0522D']
			},
			midnight: {
				primary: '#FFFFFF',
				secondary: '#2C3E50',
				bg: ['#34495E', '#2C3E50'],
				butterflyColor: '#2C3E50',
				chartColors: ['#FFFFFF', '#2C3E50', '#34495E']
			},
			aurora: {
				primary: '#FFFFFF',
				secondary: '#00CED1',
				bg: ['#00CED1', '#20B2AA'],
				butterflyColor: '#00CED1',
				chartColors: ['#FFFFFF', '#00CED1', '#20B2AA']
			},
			coral: {
				primary: '#FFFFFF',
				secondary: '#FF7F50',
				bg: ['#FF6347', '#FF7F50'],
				butterflyColor: '#FF7F50',
				chartColors: ['#FFFFFF', '#FF7F50', '#FF6347']
			},
			emerald: {
				primary: '#FFFFFF',
				secondary: '#2ECC71',
				bg: ['#27AE60', '#2ECC71'],
				butterflyColor: '#2ECC71',
				chartColors: ['#FFFFFF', '#2ECC71', '#27AE60']
			},
			sapphire: {
				primary: '#FFFFFF',
				secondary: '#3498DB',
				bg: ['#2980B9', '#3498DB'],
				butterflyColor: '#3498DB',
				chartColors: ['#FFFFFF', '#3498DB', '#2980B9']
			},
			amethyst: {
				primary: '#FFFFFF',
				secondary: '#9B59B6',
				bg: ['#8E44AD', '#9B59B6'],
				butterflyColor: '#9B59B6',
				chartColors: ['#FFFFFF', '#9B59B6', '#8E44AD']
			},
			ruby: {
				primary: '#FFFFFF',
				secondary: '#E74C3C',
				bg: ['#C0392B', '#E74C3C'],
				butterflyColor: '#E74C3C',
				chartColors: ['#FFFFFF', '#E74C3C', '#C0392B']
			},
			tropical: {
				primary: '#000000',
				secondary: '#FF6B6B',
				bg: ['#4ECDC4', '#FF6B6B'],
				butterflyColor: '#FF6B6B',
				chartColors: ['#000000', '#FF6B6B', '#4ECDC4']
			},
			galaxy: {
				primary: '#FFFFFF',
				secondary: '#6C5CE7',
				bg: ['#2D3436', '#6C5CE7'],
				butterflyColor: '#6C5CE7',
				chartColors: ['#FFFFFF', '#6C5CE7', '#2D3436']
			},
			ocean_wave: {
				primary: '#FFFFFF',
				secondary: '#00B4D8',
				bg: ['#0077B6', '#00B4D8'],
				butterflyColor: '#00B4D8',
				chartColors: ['#FFFFFF', '#00B4D8', '#0077B6']
			},
			sunrise: {
				primary: '#000000',
				secondary: '#FF9E80',
				bg: ['#FF6B6B', '#FF9E80'],
				butterflyColor: '#FF9E80',
				chartColors: ['#000000', '#FF9E80', '#FF6B6B']
			},
			lavender_dream: {
				primary: '#FFFFFF',
				secondary: '#BB86FC',
				bg: ['#9C27B0', '#BB86FC'],
				butterflyColor: '#BB86FC',
				chartColors: ['#FFFFFF', '#BB86FC', '#9C27B0']
			},
			custom: {
				primary: '#FFFFFF',
				secondary: '#0084FF',
				bg: ['#1877F2', '#0A5BC4'],
				butterflyColor: '#0084FF',
				chartColors: ['#FFFFFF', '#0084FF', '#1877F2']
			}
		};
		// --- Handle setwall command --- //
		if (args[0] && args[0].toLowerCase() === 'setwall') {
			if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
				return message.reply(getLang("wallError"));
			}

			const imageUrl = messageReply.attachments[0].url;
			try {
				const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
				const wallPath = resolve(__dirname, "cache", `wallpaper_${senderID}.jpg`);
				require('fs').writeFileSync(wallPath, response.data);
				
				const success = await updateUserTheme(globalData, senderID, {
					customWallpaper: wallPath,
					currentTheme: 'custom'
				});
				
				if (success) {
					return message.reply(getLang("wallSet"));
				} else {
					return message.reply("❌ Error updating theme.");
				}
			} catch (error) {
				console.error("Error setting wallpaper:", error);
				return message.reply("❌ Error setting wallpaper.");
			}
		}

		// --- Handle themes command --- //
		if (args[0] && args[0].toLowerCase() === 'themes') {
			const customThemes = await getCustomThemes(globalData);
			const allThemes = { ...themes, ...customThemes };
			
			let themeList = "";
			let count = 0;
			const themeNames = Object.keys(allThemes).sort();
			
			// Group themes for better display
			const popularThemes = ['classic', 'love', 'tie_dye', 'space', 'forest', 'sunset'];
			const gradientThemes = ['ocean', 'berry', 'sunflower', 'lavender', 'rose', 'peach'];
			const colorThemes = ['mint', 'grape', 'lemon', 'sky', 'cotton_candy', 'neon'];
			const specialThemes = ['rainbow', 'gold', 'silver', 'coffee', 'midnight', 'aurora'];
			const gemThemes = ['emerald', 'sapphire', 'amethyst', 'ruby', 'tropical', 'galaxy'];
			
			themeList += "🌟 POPULAR THEMES:\n";
			popularThemes.forEach(theme => {
				if (allThemes[theme]) {
					themeList += `• ${theme}\n`;
					count++;
				}
			});
			
			themeList += "\n🎨 GRADIENT THEMES:\n";
			gradientThemes.forEach(theme => {
				if (allThemes[theme]) {
					themeList += `• ${theme}\n`;
					count++;
				}
			});
			
			themeList += "\n🌈 COLOR THEMES:\n";
			colorThemes.forEach(theme => {
				if (allThemes[theme]) {
					themeList += `• ${theme}\n`;
					count++;
				}
			});
			
			themeList += "\n💎 SPECIAL THEMES:\n";
			specialThemes.forEach(theme => {
				if (allThemes[theme]) {
					themeList += `• ${theme}\n`;
					count++;
				}
			});
			
			themeList += "\n✨ GEM THEMES:\n";
			gemThemes.forEach(theme => {
				if (allThemes[theme]) {
					themeList += `• ${theme}\n`;
					count++;
				}
			});
			
			// Add custom themes if any
			const customThemeNames = Object.keys(customThemes);
			if (customThemeNames.length > 0) {
				themeList += "\n🎯 CUSTOM THEMES:\n";
				customThemeNames.forEach(theme => {
					themeList += `• ${theme}\n`;
					count++;
				});
			}
			
			return message.reply(getLang("themeList", count, themeList) + "\n" + getLang("customThemeHelp"));
		}

		// --- Handle createtheme command --- //
		if (args[0] && args[0].toLowerCase() === 'createtheme') {
			if (args.length < 6) {
				return message.reply(getLang("themeCreateError"));
			}
			
			const themeName = args[1].toLowerCase();
			const primaryColor = args[2];
			const secondaryColor = args[3];
			const bgColor1 = args[4];
			const bgColor2 = args[5];
			
			// Validate hex colors
			const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
			if (!hexColorRegex.test(primaryColor) || !hexColorRegex.test(secondaryColor) || 
				!hexColorRegex.test(bgColor1) || !hexColorRegex.test(bgColor2)) {
				return message.reply("❌ Invalid color format. Please use hex colors like #FFFFFF");
			}
			
			// Check if theme name already exists
			const customThemes = await getCustomThemes(globalData);
			if (themes[themeName] || customThemes[themeName]) {
				return message.reply("❌ Theme name already exists. Please choose a different name.");
			}
			// Create new theme
			const newTheme = {
				primary: primaryColor,
				secondary: secondaryColor,
				bg: [bgColor1, bgColor2],
				butterflyColor: secondaryColor,
				chartColors: [primaryColor, secondaryColor, bgColor1]
			};
			
			const success = await addCustomTheme(globalData, themeName, newTheme);
			if (success) {
				return message.reply(getLang("themeCreated", themeName));
			} else {
				return message.reply("❌ Error creating theme.");
			}
		}

		// --- Handle theme command --- //
		if (args[0] && args[0].toLowerCase() === 'theme') {
			const customThemes = await getCustomThemes(globalData);
			const allThemes = { ...themes, ...customThemes };
			
			// Show current theme if no theme specified
			if (!args[1]) {
				const userTheme = await getUserTheme(globalData, senderID);
				return message.reply(getLang("personalTheme", userTheme.currentTheme) + "\n" + 
					"💡 Use '" + (this.config.guide.en.split(' ')[0] || '/count') + " themes' to see all available themes");
			}
			
			const newTheme = args[1].toLowerCase();
			
			if (!allThemes[newTheme]) {
				return message.reply(getLang("invalidTheme"));
			}
			
			const success = await updateUserTheme(globalData, senderID, {
				currentTheme: newTheme,
				...(newTheme !== 'custom' && { customWallpaper: null })
			});
			
			if (success) {
				return message.reply(getLang("themeChanged", newTheme));
			} else {
				return message.reply("❌ Error updating theme.");
			}
		}

		// --- Handle reset command --- //
		if (args[0] && args[0].toLowerCase() === 'reset') {
			const success = await updateUserTheme(globalData, senderID, {
				currentTheme: 'classic',
				customWallpaper: null
			});
			
			if (success) {
				return message.reply(getLang("resetSuccess"));
			} else {
				return message.reply("❌ Error resetting theme.");
			}
		}

		// --- Handle reply functionality --- //
		if (messageReply && (!args[0] || args[0].toLowerCase() === 'reply')) {
			const repliedUserID = messageReply.senderID;
			args[0] = repliedUserID;
		}

		// --- Data Preparation --- //
		const threadData = await threadsData.get(threadID);
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
		let combinedData = [];

		// Get activity data from globalData
		const threadActivities = await getThreadActivities(globalData, threadID);
		
		for (const user of threadData.members) {
			if (!usersInGroup.includes(user.userID)) continue;
			
			// Find activity data from globalData
			const activity = threadActivities[user.userID] || {
				total: user.count || 0,
				types: { text: 0, sticker: 0, media: 0 },
				daily: {}
			};

			combinedData.push({
				uid: user.userID,
				name: user.name || getLang("fallbackName"),
				count: user.count || 0,
				activity: activity
			});
		}
		
		// Sort by count (highest first) - NO SPECIAL USER HANDLING
		combinedData.sort(function(a, b) { return b.count - a.count; });
		
		// Assign ranks based on actual position
		combinedData.forEach(function(user, index) { 
			user.rank = index + 1; 
		});
		const getAvatar = async function (uid, name) {
			try {
				const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
				const response = await axios.get(url, { responseType: 'arraybuffer' });
				return await loadImage(response.data);
			} catch (error) {
				const canvas = new Canvas(512, 512);
				const ctx = canvas.getContext('2d');
				const colors = ['#0084FF', '#1877F2', '#0A5BC4'];
				const bgColor = colors[parseInt(uid) % colors.length];
				ctx.fillStyle = bgColor;
				ctx.fillRect(0, 0, 512, 512);
				ctx.fillStyle = '#FFFFFF';
				ctx.font = '256px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(name.charAt(0).toUpperCase(), 256, 256);
				return await loadImage(canvas.toBuffer());
			}
		};

		const drawGlowingText = function (ctx, text, x, y, color, size, blur = 8) {
			ctx.font = `bold ${size}px "BeVietnamPro", "sans-serif"`;
			ctx.shadowColor = color;
			ctx.shadowBlur = blur;
			ctx.fillStyle = color;
			ctx.fillText(text, x, y);
			ctx.shadowBlur = 0;
		};

		const fitText = function (ctx, text, maxWidth) {
			let currentText = text;
			if (ctx.measureText(currentText).width > maxWidth) {
				while (ctx.measureText(currentText + '...').width > maxWidth) {
					currentText = currentText.slice(0, -1);
				}
				return currentText + '...';
			}
			return currentText;
		};

		const drawCircularAvatar = function (ctx, avatar, x, y, radius) {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
			ctx.restore();
		};

		const drawButterflies = function(ctx, time, theme) {
			const butterflyPositions = [
				{ x: 150, y: 180, size: 1.2 },
				{ x: 650, y: 120, size: 1.5 },
				{ x: 250, y: 1100, size: 1.0 },
				{ x: 550, y: 1050, size: 1.3 },
				{ x: 350, y: 350, size: 0.9 }
			];

			butterflyPositions.forEach(function(butterfly, index) {
				const floatOffset = Math.sin(time * 0.002 + index) * 10;
				const wingFlap = Math.sin(time * 0.005 + index) * 0.3;
				
				ctx.save();
				ctx.translate(butterfly.x, butterfly.y + floatOffset);
				ctx.scale(butterfly.size, butterfly.size);
				
				// Butterfly body
				ctx.fillStyle = '#8B4513';
				ctx.fillRect(-3, -6, 6, 12);
				
				// Butterfly wings with theme color
				const wingGradient = ctx.createLinearGradient(-25, 0, 25, 0);
				wingGradient.addColorStop(0, theme.butterflyColor);
				wingGradient.addColorStop(0.3, theme.secondary);
				wingGradient.addColorStop(0.7, theme.secondary);
				wingGradient.addColorStop(1, theme.butterflyColor);
				
				ctx.fillStyle = wingGradient;
				ctx.globalAlpha = 0.9;
				
				// Left wing
				ctx.save();
				ctx.scale(1.2 + wingFlap, 1.2);
				ctx.beginPath();
				ctx.ellipse(-15, 0, 20, 12, Math.PI/4, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
				
				// Right wing
				ctx.save();
				ctx.scale(1.2 - wingFlap, 1.2);
				ctx.beginPath();
				ctx.ellipse(15, 0, 20, 12, -Math.PI/4, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();

				// Wing details
				ctx.strokeStyle = '#FFFFFF';
				ctx.lineWidth = 1;
				ctx.globalAlpha = 0.6;
				
				// Left wing details
				ctx.beginPath();
				ctx.ellipse(-15, 0, 15, 8, Math.PI/4, 0, Math.PI * 2);
				ctx.stroke();
				
				// Right wing details
				ctx.beginPath();
				ctx.ellipse(15, 0, 15, 8, -Math.PI/4, 0, Math.PI * 2);
				ctx.stroke();
				
				ctx.globalAlpha = 1;
				ctx.restore();
			});
		};
		const drawBackground = async function(ctx, width, height, userID) {
			const userTheme = await getUserTheme(globalData, userID);
			const customThemes = await getCustomThemes(globalData);
			const allThemes = { ...themes, ...customThemes };
			
			// For custom theme with wallpaper
			if (userTheme.currentTheme === 'custom' && userTheme.customWallpaper && existsSync(userTheme.customWallpaper)) {
				try {
					const wallpaper = await loadImage(userTheme.customWallpaper);
					ctx.drawImage(wallpaper, 0, 0, width, height);
					ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
					ctx.fillRect(0, 0, width, height);
				} catch (error) {
					console.error("Error loading custom wallpaper:", error);
					// Fallback to classic theme
					const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
					bgGradient.addColorStop(0, themes.classic.bg[0]);
					bgGradient.addColorStop(1, themes.classic.bg[1]);
					ctx.fillStyle = bgGradient;
					ctx.fillRect(0, 0, width, height);
				}
			} else {
				// Regular gradient background
				const themeData = allThemes[userTheme.currentTheme] || themes.classic;
				const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
				bgGradient.addColorStop(0, themeData.bg[0]);
				bgGradient.addColorStop(1, themeData.bg[1]);
				ctx.fillStyle = bgGradient;
				ctx.fillRect(0, 0, width, height);
			}
		};

		const getCurrentTheme = async function(userID) {
			const userTheme = await getUserTheme(globalData, userID);
			const customThemes = await getCustomThemes(globalData);
			const allThemes = { ...themes, ...customThemes };
			return allThemes[userTheme.currentTheme] || themes.classic;
		};
		
		if (args[0] && args[0].toLowerCase() === 'all') {
			const usersPerPage = 10;
			const leaderboardUsers = combinedData.filter(function (u) { return u.rank > 3; });
			const totalPages = Math.ceil(leaderboardUsers.length / usersPerPage) || 1;
			let page = parseInt(args[1]) || 1;
			if (page < 1 || page > totalPages) page = 1;
			const startIndex = (page - 1) * usersPerPage;
			const pageUsers = leaderboardUsers.slice(startIndex, startIndex + usersPerPage);
			const canvas = new Canvas(1200, 1700);
			const ctx = canvas.getContext('2d');
			
			// For leaderboard, use the command user's theme
			const currentTheme = await getCurrentTheme(senderID);
			
			// Draw background with user's personal theme
			await drawBackground(ctx, 1200, 1700, senderID);
			
			// Add butterflies
			drawButterflies(ctx, Date.now(), currentTheme);
			
			// Very subtle pattern
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
			ctx.lineWidth = 1;
			for (let i = 0; i < 1200; i += 80) {
				ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, 1700);
				ctx.stroke();
			}
			for (let i = 0; i < 1700; i += 80) {
				ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(1200, i);
				ctx.stroke();
			}
			
			ctx.textAlign = 'center';
			drawGlowingText(ctx, getLang("leaderboardTitle"), 600, 100, currentTheme.primary, 60, 10);
			
			const top3 = combinedData.slice(0, 3);
			const podColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
			const podPositions = [ { x: 600, y: 300, r: 100 }, { x: 250, y: 320, r: 80 }, { x: 950, y: 320, r: 80 } ];
			const rankOrder = [1, 0, 2];
			
			for(const i of rankOrder) {
				const user = top3[i];
				if (!user) continue;
				const pos = podPositions[i];
				
				// Avatar glow
				ctx.strokeStyle = podColors[i];
				ctx.lineWidth = 5;
				ctx.shadowColor = podColors[i];
				ctx.shadowBlur = 15;
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, pos.r + 5, 0, Math.PI * 2);
				ctx.stroke();
				ctx.shadowBlur = 0;
				
				const avatar = await getAvatar(user.uid, user.name);
				drawCircularAvatar(ctx, avatar, pos.x, pos.y, pos.r);
				
				ctx.textAlign = 'center';
				ctx.font = `bold ${pos.r * 0.3}px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = currentTheme.primary;
				ctx.fillText(fitText(ctx, user.name, pos.r * 2.2), pos.x, pos.y + pos.r + 40);
				
				ctx.font = `normal ${pos.r * 0.25}px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = currentTheme.secondary;
				ctx.fillText(`${user.count} msgs`, pos.x, pos.y + pos.r + 75);
				
				// Rank badge
				ctx.fillStyle = podColors[i];
				ctx.beginPath();
				ctx.arc(pos.x, pos.y - pos.r + 10, 25, 0, Math.PI * 2);
				ctx.fill();
				
				ctx.fillStyle = '#000000';
				ctx.font = `bold 30px "BeVietnamPro", "sans-serif"`;
				ctx.fillText(`#${user.rank}`, pos.x, pos.y - pos.r + 20);
			}
			
			let currentY = 550;
			for (const user of pageUsers) {
				ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
				ctx.fillRect(50, currentY, 1100, 90);
				
				ctx.textAlign = 'center';
				ctx.font = `bold 30px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = currentTheme.secondary;
				ctx.fillText(`#${user.rank}`, 100, currentY + 58);
				
				const avatar = await getAvatar(user.uid, user.name);
				drawCircularAvatar(ctx, avatar, 190, currentY + 45, 30);
				
				ctx.textAlign = 'left';
				ctx.fillStyle = currentTheme.primary;
				ctx.font = `bold 30px "BeVietnamPro", "sans-serif"`;
				ctx.fillText(fitText(ctx, user.name, 350), 240, currentY + 58);
				
				ctx.textAlign = 'right';
				ctx.font = `bold 30px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = currentTheme.primary;
				ctx.fillText(user.count, 1130, currentY + 58);
				
				const barMaxWidth = 350;
				const barStartX = 750;
				const progress = (user.count / (top3[0] ? top3[0].count : user.count)) * barMaxWidth;
				
				ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
				ctx.fillRect(barStartX, currentY + 35, barMaxWidth, 20);
				
				ctx.fillStyle = currentTheme.primary;
				ctx.fillRect(barStartX, currentY + 35, progress, 20);
				
				currentY += 105;
			}
			ctx.textAlign = 'center';
			ctx.fillStyle = currentTheme.secondary;
			ctx.font = `normal 24px "BeVietnamPro", "sans-serif"`;
			ctx.fillText(getLang("page", page, totalPages), 600, 1630);
			ctx.fillText(getLang("reply"), 600, 1660);
			
			const path = resolve(__dirname, 'cache', `leaderboard_${threadID}.png`);
			const out = createWriteStream(path);
			const stream = canvas.createPNGStream();
			stream.pipe(out);
			out.on('finish', function() {
				message.reply({ attachment: require('fs').createReadStream(path) }, function (err, info) {
					if (err) return console.error(err);
					global.GoatBot.onReply.set(info.messageID, { commandName: "count", messageID: info.messageID, author: senderID, threadID: threadID, type: 'leaderboard' });
				});
			});
		} else {
			let targetUsers = Object.keys(mentions).length > 0 ? Object.keys(mentions) : [senderID];
			
			// Handle user ID directly (for reply functionality)
			if (args[0] && !isNaN(args[0])) {
				targetUsers = [args[0]];
			}
			
			for(const uid of targetUsers) {
				const user = combinedData.find(function(u) { return u.uid == uid; });
				if (!user) continue;
				
				const canvas = new Canvas(800, 1200);
				const ctx = canvas.getContext('2d');
				
				// For user cards, use the target user's personal theme
				const targetUserTheme = await getCurrentTheme(uid);
				
				// Draw background with target user's personal theme
				await drawBackground(ctx, 800, 1200, uid);
				
				// Add butterflies
				drawButterflies(ctx, Date.now(), targetUserTheme);
				
				ctx.textAlign = 'center';
				drawGlowingText(ctx, getLang("userCardTitle"), 400, 80, targetUserTheme.primary, 50, 10);
				
				const avatar = await getAvatar(user.uid, user.name);
				drawCircularAvatar(ctx, avatar, 400, 220, 100);
				
				ctx.font = `bold 40px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = targetUserTheme.primary;
				ctx.fillText(fitText(ctx, user.name, 600), 400, 360);
				
				const statsY = 450;
				ctx.beginPath();
				ctx.moveTo(400, statsY - 25);
				ctx.lineTo(400, statsY + 70);
				ctx.strokeStyle = targetUserTheme.secondary;
				ctx.lineWidth = 1;
				ctx.stroke();
				
				ctx.font = `bold 24px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = targetUserTheme.secondary;
				ctx.fillText(getLang("serverRank"), 250, statsY);
				ctx.fillText(getLang("totalMessages"), 550, statsY);
				
				ctx.font = `bold 55px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = targetUserTheme.primary;
				ctx.fillText(`#${user.rank}`, 250, statsY + 55);
				ctx.fillText(user.count, 550, statsY + 55);
				
				const dailyData = user.activity.daily || {};
				const days = [];
				for(let i=6; i>=0; i--) {
					const day = moment().tz("Asia/Ho_Chi_Minh").subtract(i, 'days');
					days.push({ 
						label: day.format('dddd'), 
						shortLabel: day.format('ddd'), 
						count: dailyData[day.format('YYYY-MM-DD')] || 0 
					});
				}
				
				const busiestDay = days.reduce(function (p, c) { 
					return p.count > c.count ? p : c; 
				}, {count: -1});
				
				const busiestY = 620;
				ctx.font = `bold 24px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = targetUserTheme.secondary;
				ctx.fillText(getLang("busiestDay").toUpperCase(), 400, busiestY);
				
				ctx.font = `bold 32px "BeVietnamPro", "sans-serif"`;
				ctx.fillStyle = targetUserTheme.primary;
				if (busiestDay.count > 0) {
					ctx.fillText(`${busiestDay.label} - ${busiestDay.count} msgs`, 400, busiestY + 45);
				} else {
					ctx.fillText(`N/A`, 400, busiestY + 45);
				}
				
				const graphY_start = 740;
				ctx.textAlign = 'left';
				ctx.fillStyle = targetUserTheme.secondary;
				ctx.font = `bold 24px "BeVietnamPro", "sans-serif"`;
				ctx.fillText(getLang("dailyActivity"), 80, graphY_start);
				
				const graphX = 80, graphBaseY = 950, graphW = 640, graphH = 150;
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
				ctx.lineWidth = 1;
				ctx.strokeRect(graphX, graphBaseY - graphH, graphW, graphH);
				
				const maxCount = Math.max.apply(null, days.map(function(d) { return d.count; })) || 1;
				
				ctx.beginPath();
				ctx.moveTo(graphX, graphBaseY - (days[0].count / maxCount * graphH));
				ctx.strokeStyle = targetUserTheme.primary;
				ctx.lineWidth = 3;
				
				days.forEach(function(day, i) {
					const x = graphX + (i / 6) * graphW;
					const y = graphBaseY - (day.count / maxCount * graphH);
					ctx.lineTo(x, y);
					
					ctx.textAlign = 'center';
					ctx.fillStyle = targetUserTheme.secondary;
					ctx.font = '18px "BeVietnamPro", "sans-serif"';
					ctx.fillText(day.shortLabel, x, graphBaseY + 25);
				});
				ctx.stroke();
				
				const breakdownY_start = 1020;
				ctx.textAlign = 'left';
				ctx.fillStyle = targetUserTheme.secondary;
				ctx.font = `bold 24px "BeVietnamPro", "sans-serif"`;
				ctx.fillText(getLang("messageBreakdown"), 80, breakdownY_start);
				
				// FIXED: Ensure message breakdown data is properly handled
				const types = user.activity.types || { text: 0, sticker: 0, media: 0 };
				
				// If no message type data exists, create default data based on total count
				if (types.text === 0 && types.sticker === 0 && types.media === 0 && user.count > 0) {
					// Distribute total count among types (70% text, 20% media, 10% stickers as default)
					types.text = Math.floor(user.count * 0.7);
					types.media = Math.floor(user.count * 0.2);
					types.sticker = user.count - types.text - types.media;
				}
				const totalTypes = types.text + types.sticker + types.media;
				const breakdownData = [
					{ label: getLang("text"), value: types.text, color: targetUserTheme.chartColors[0] },
					{ label: getLang("sticker"), value: types.sticker, color: targetUserTheme.chartColors[1] },
					{ label: getLang("media"), value: types.media, color: targetUserTheme.chartColors[2] }
				];
				
				const donutX = 180, donutY = breakdownY_start + 80, donutR = 60;
				let startAngle = -0.5 * Math.PI;
				
				if (totalTypes > 0) {
					breakdownData.forEach(function(item) {
						const sliceAngle = (item.value / totalTypes) * 2 * Math.PI;
						if (sliceAngle > 0) {
							ctx.beginPath();
							ctx.moveTo(donutX, donutY);
							ctx.arc(donutX, donutY, donutR, startAngle, startAngle + sliceAngle);
							ctx.closePath();
							ctx.fillStyle = item.color;
							ctx.fill();
						}
						startAngle += sliceAngle;
					});
				} else {
					ctx.beginPath();
					ctx.arc(donutX, donutY, donutR, 0, 2 * Math.PI);
					ctx.fillStyle = targetUserTheme.secondary;
					ctx.fill();
				}
				
				let legendY = breakdownY_start + 45;
				breakdownData.forEach(function(item) {
					const percentage = totalTypes > 0 ? (item.value / totalTypes * 100).toFixed(1) : "0.0";
					
					ctx.fillStyle = item.color;
					ctx.fillRect(350, legendY - 15, 20, 20);
					
					ctx.fillStyle = targetUserTheme.primary;
					ctx.textAlign = 'left';
					ctx.font = `bold 22px "BeVietnamPro", "sans-serif"`;
					ctx.fillText(item.label, 380, legendY);
					
					ctx.fillStyle = targetUserTheme.secondary;
					ctx.textAlign = 'right';
					ctx.fillText(`${percentage}% (${item.value})`, 720, legendY);
					
					legendY += 40;
				});
				
				const path = resolve(__dirname, 'cache', `usercard_${uid}.png`);
				const out = createWriteStream(path);
				const stream = canvas.createPNGStream();
				stream.pipe(out);
				out.on('finish', function() {
					message.reply({ attachment: require('fs').createReadStream(path) });
				});
			}
		}
	},
	
	onReply: async function ({ event, Reply, message, getLang }) {
		if (event.senderID !== Reply.author || Reply.type !== 'leaderboard') return;
		const page = parseInt(event.body);
		if (isNaN(page)) return;
		try {
			message.unsend(Reply.messageID);
			const newArgs = ['all', page.toString()];
			await this.onStart({ 
				...arguments[0], 
				args: newArgs, 
				event: { ...arguments[0].event, body: `/count ${newArgs.join(' ')}` }
			});
		} catch (e) {
			console.error("Error during pagination reply:", e);
			message.reply(getLang("invalidPage"));
		}
	}
};