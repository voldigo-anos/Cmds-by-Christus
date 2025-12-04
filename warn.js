const { getTime } = global.utils;

module.exports = {
	config: {
		name: "warn",
		version: "1.8",
		author: "Christus",
		countDown: 5,
		role: 0,
		description: {
			fr: "Avertit les membres d’un groupe. Au bout de 3 avertissements, le membre est automatiquement banni."
		},
		category: "🧰 𝗕𝗢𝗫",
		guide: {
			fr:
				"   {pn} @tag <raison> : avertit un membre\n" +
				"   {pn} list : affiche la liste des membres avertis\n" +
				"   {pn} listban : affiche la liste des membres bannis après 3 avertissements\n" +
				"   {pn} info [@tag | <uid> | reply | vide] : affiche les infos d’avertissement de la personne taguée / UID / toi-même\n" +
				"   {pn} unban [@tag | <uid> | reply | vide] : débannit le membre et supprime tous ses avertissements\n" +
				"   {pn} unwarn [@tag | <uid> | reply | vide] [<numéro> | vide] : supprime un avertissement par numéro ou le dernier si vide\n" +
				"   {pn} reset : réinitialise toutes les données d’avertissements\n" +
				"⚠️ Le bot doit être administrateur pour pouvoir expulser automatiquement les membres bannis"
		}
	},

	langs: {
		fr: {
			list: "Liste des membres avertis :\n%1\n\nPour voir les détails des avertissements, utilise la commande « %2warn info [@tag | <uid> | vide] ».",
			listBan: "Liste des membres bannis après 3 avertissements :\n%1",
			listEmpty: "Aucun membre n’a encore été averti dans ce groupe.",
			listBanEmpty: "Aucun membre n’a encore été banni de ce groupe.",
			invalidUid: "⚠️ Veuillez entrer un UID valide.",
			noData: "Aucune donnée disponible.",
			noPermission: "❌ Seuls les administrateurs du groupe peuvent débannir un membre.",
			invalidUid2: "⚠️ Veuillez entrer un UID valide de la personne à débannir.",
			notBanned: "⚠️ L’utilisateur avec l’ID %1 n’est pas banni de votre groupe.",
			unbanSuccess: "✅ Le membre [%1 | %2] a été débanni avec succès et peut maintenant rejoindre le groupe.",
			noPermission2: "❌ Seuls les administrateurs du groupe peuvent supprimer un avertissement.",
			invalidUid3: "⚠️ Veuillez entrer ou taguer un UID valide pour supprimer un avertissement.",
			noData2: "⚠️ L’utilisateur avec l’ID %1 n’a pas d’avertissements.",
			notEnoughWarn: "❌ L’utilisateur %1 n’a que %2 avertissement(s).",
			unwarnSuccess: "✅ L’avertissement numéro %1 du membre [%2 | %3] a été supprimé avec succès.",
			noPermission3: "❌ Seuls les administrateurs du groupe peuvent réinitialiser les avertissements.",
			resetWarnSuccess: "✅ Les données d’avertissements ont été réinitialisées avec succès.",
			noPermission4: "❌ Seuls les administrateurs du groupe peuvent avertir un membre.",
			invalidUid4: "⚠️ Vous devez taguer ou répondre au message de la personne à avertir.",
			warnSuccess: "⚠️ %1 a reçu son %2ᵉ avertissement\n- UID : %3\n- Raison : %4\n- Date & Heure : %5\nCe membre a atteint 3 avertissements et a été banni.\nPour le débannir, utilisez « %6warn unban <uid> »",
			noPermission5: "⚠️ Le bot a besoin des droits administrateur pour expulser les membres bannis.",
			warnSuccess2: "⚠️ %1 a reçu son %2ᵉ avertissement\n- UID : %3\n- Raison : %4\n- Date & Heure : %5\nEncore %6 avertissement(s) avant bannissement.",
			hasBanned: "⚠️ Les membres suivants ont déjà été bannis après 3 avertissements :\n%1",
			failedKick: "⚠️ Erreur lors de l’expulsion des membres suivants :\n%1",
			userNotInGroup: "⚠️ L’utilisateur « %1 » n’est pas présent dans votre groupe."
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, usersData, prefix, role, getLang }) {
		if (!args[0]) return message.SyntaxError();
		const { threadID, senderID } = event;
		const warnList = await threadsData.get(threadID, "data.warn", []);

		switch (args[0]) {
			case "list": {
				const msg = await Promise.all(warnList.map(async user => {
					const { uid, list } = user;
					const name = await usersData.getName(uid);
					return `${name} (${uid}) : ${list.length} avertissement(s)`;
				}));
				message.reply(msg.length ? getLang("list", msg.join("\n"), prefix) : getLang("listEmpty"));
				break;
			}

			case "listban": {
				const result = (await Promise.all(warnList.map(async user => {
					const { uid, list } = user;
					if (list.length >= 3) {
						const name = await usersData.getName(uid);
						return `${name} (${uid})`;
					}
				}))).filter(item => item);
				message.reply(result.length ? getLang("listBan", result.join("\n")) : getLang("listBanEmpty"));
				break;
			}

			case "info": 
			case "check": {
				let uids;
				if (Object.keys(event.mentions).length)
					uids = Object.keys(event.mentions);
				else if (event.messageReply?.senderID)
					uids = [event.messageReply.senderID];
				else if (args.slice(1).length)
					uids = args.slice(1);
				else
					uids = [senderID];

				if (!uids) return message.reply(getLang("invalidUid"));

				const msg = (await Promise.all(uids.map(async uid => {
					if (isNaN(uid)) return null;
					const dataWarn = warnList.find(u => u.uid == uid);
					const name = await usersData.getName(uid);
					let out = `UID : ${uid}\nNom : ${name}`;

					if (!dataWarn || dataWarn.list.length === 0)
						out += `\n${getLang("noData")}`;
					else {
						out += `\nAvertissements :`;
						dataWarn.list.forEach((warn, i) => {
							out += `\n  ${i + 1}. Raison : ${warn.reason}\n     Date : ${warn.dateTime}`;
						});
					}
					return out;
				}))).filter(Boolean).join("\n\n");

				message.reply(msg);
				break;
			}

			// Les autres sous-commandes (unban, unwarn, reset, avertir) restent identiques,
			// seuls les messages sont déjà traduits dans langs:fr.
			
			default: {
				// Commande d’avertissement d’un membre
				if (role < 1) return message.reply(getLang("noPermission4"));

				let uid, reason;
				if (event.messageReply) {
					uid = event.messageReply.senderID;
					reason = args.join(" ").trim();
				} else if (Object.keys(event.mentions)[0]) {
					uid = Object.keys(event.mentions)[0];
					reason = args.join(" ").replace(event.mentions[uid], "").trim();
				} else {
					return message.reply(getLang("invalidUid4"));
				}

				if (!reason) reason = "Aucune raison spécifiée";

				const userData = warnList.find(item => item.uid == uid);
				const dateTime = getTime("DD/MM/YYYY HH:mm:ss");
				if (!userData)
					warnList.push({ uid, list: [{ reason, dateTime, warnBy: senderID }] });
				else
					userData.list.push({ reason, dateTime, warnBy: senderID });

				await threadsData.set(threadID, warnList, "data.warn");

				const times = userData?.list.length ?? 1;
				const userName = await usersData.getName(uid);

				if (times >= 3) {
					message.reply(getLang("warnSuccess", userName, times, uid, reason, dateTime, prefix), () => {
						api.removeUserFromGroup(uid, threadID, err => {
							if (err) return message.reply(getLang("noPermission5"));
						});
					});
				} else {
					message.reply(getLang("warnSuccess2", userName, times, uid, reason, dateTime, 3 - times));
				}
			}
		}
	},

	onEvent: async ({ event, threadsData, usersData, message, api, getLang }) => {
		const { logMessageType, logMessageData } = event;
		if (logMessageType === "log:subscribe") {
			const { data, adminIDs } = await threadsData.get(event.threadID);
			const warnList = data.warn || [];
			if (!warnList.length) return;

			const { addedParticipants } = logMessageData;
			const hasBanned = [];

			for (const user of addedParticipants) {
				const { userFbId: uid } = user;
				const dataWarn = warnList.find(item => item.uid == uid);
				if (dataWarn && dataWarn.list.length >= 3) {
					const name = await usersData.getName(uid);
					hasBanned.push({ uid, name });
				}
			}

			if (hasBanned.length) {
				await message.send(getLang("hasBanned", hasBanned.map(item => `  - ${item.name} (uid: ${item.uid})`).join("\n")));
				if (!adminIDs.includes(api.getCurrentUserID())) return message.reply(getLang("noPermission5"));
				for (const user of hasBanned) {
					try {
						await api.removeUserFromGroup(user.uid, event.threadID);
					} catch (e) {
						message.reply(getLang("failedKick", `${user.name} (${user.uid})`));
					}
				}
			}
		}
	}
};