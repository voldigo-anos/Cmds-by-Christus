const axios = require('axios');

module.exports = {
	config: {
		name: "waifu",
		aliases: ["waifu", "neko"],
		version: "1.0",
		author: "Christus x Aesther",
		countDown: 5,
		role: 0,
		shortDescription: "Obtiens une image waifu aléatoire",
		longDescription: "Envoie une image d'animé waifu ou neko aléatoire (ou d'une catégorie spécifique).",
		category: "anime",
		guide: "{pn} [catégorie]\n\nCatégories disponibles : waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe"
	},

	onStart: async function ({ message, args }) {
		const categorie = args.join(" ");
		if (!categorie) {
			// Si aucune catégorie n'est donnée → waifu par défaut
			try {
				let res = await axios.get(`https://api.waifu.pics/sfw/waifu`);
				let data = res.data;
				let image = data.url;

				const form = {
					body: `💠 Image Waifu Aléatoire 💠`
				};
				if (image)
					form.attachment = await global.utils.getStreamFromURL(image);
				message.reply(form);
			} catch (e) {
				message.reply(`🥺 Aucune image trouvée... réessaie plus tard.`);
			}
		} else {
			// Si une catégorie est donnée
			try {
				let res = await axios.get(`https://api.waifu.pics/sfw/${categorie}`);
				let data = res.data;
				let image = data.url;

				const form = {
					body: `🎴 Catégorie : ${categorie}`
				};
				if (image)
					form.attachment = await global.utils.getStreamFromURL(image);
				message.reply(form);
			} catch (e) {
				message.reply(`🥺 Catégorie introuvable 🥲\n\nCatégories disponibles : waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe`);
			}
		}
	}
};