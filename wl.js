const { config } = global.GoatBot;

module.exports = {
	config: {
		name: "wl",
		version: "1.0",
		author: "Christus x Aesther",
		countDown: 5,
		role: 2,
		longDescription: {
			fr: "Ajouter, supprimer ou modifier les whiteListIds"
		},
		category: "𝗔𝗗𝗠𝗜𝗡",
		guide: {
			fr: '   {pn} [add | -a] <uid | @tag> : Ajouter le rôle d\'administrateur à un utilisateur'
				+ '\n   {pn} [remove | -r] <uid | @tag> : Retirer le rôle d\'administrateur d\'un utilisateur'
				+ '\n   {pn} [list | -l] : Lister tous les administrateurs'
        + '\n   {pn} [on | off] : Activer ou désactiver le mode whiteList'
		}
	},

	langs: {
		fr: {
			added: "✅ | Rôle whiteList ajouté pour %1 utilisateurs :\n%2",
			alreadyAdmin: "\n⚠ | %1 utilisateurs avaient déjà le rôle whiteList :\n%2",
			missingIdAdd: "⚠ | Veuillez entrer l'ID ou taguer l'utilisateur à ajouter dans whiteListIds",
			removed: "✅ | Rôle whiteList retiré pour %1 utilisateurs :\n%2",
			notAdmin: "⚠ | %1 utilisateurs n'avaient pas le rôle whiteListIds :\n%2",
			missingIdRemove: "⚠ | Veuillez entrer l'ID ou taguer l'utilisateur à retirer de whiteListIds",
			listAdmin: "👑 | Liste des whiteListIds :\n%1",
      enable: "✅ Mode whiteList activé",
      disable: "✅ Mode whiteList désactivé"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const { writeFileSync } = require("fs-extra");
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.whiteListMode.whiteListIds.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions)[0];
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
      case "on": {              
        config.whiteListMode.enable = true;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("enable"))
      }
      case "off": {
        config.whiteListMode.enable = false;
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("disable"))
      }
      default:
        return message.SyntaxError();
    }
  }
};