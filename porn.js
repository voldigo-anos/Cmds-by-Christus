const axios = require("axios");

// Fonction utilitaire pour convertir du texte en caractères gras mathématiques
function toBold(text) {
 const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 const boldChars = '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
 
 let result = '';
 for (const char of text) {
 const index = normalChars.indexOf(char);
 result += index !== -1 ? boldChars[index] : char;
 }
 return result;
}

module.exports = {
 config: {
 name: "porn", // Nom de la commande
 version: "1.0", // Version de la commande
 author: "Christus x Aesther", // Auteur de la commande
 countDown: 5, // Délai d'attente en secondes avant de pouvoir réutiliser la commande
 role: 0, // Niveau de rôle requis pour utiliser la commande (0 = tout le monde)
 shortDescription: {
 en: "Rechercher des vidéos porno"
 },
 longDescription: {
 en: "Rechercher et afficher des vidéos de porn.com en utilisant un mot-clé de recherche"
 },
 category: "media", // Catégorie de la commande (ex: media, fun, utilitaire)
 guide: {
 en: "+porn [terme de recherche]\nExemple: +porn ado"
 }
 },

 onStart: async function ({ message, args, event, commandName }) {
 const query = args.join(" "); // Récupère le terme de recherche
 if (!query) return message.reply("❌ | Veuillez fournir un terme de recherche.\nExemple: +porn ado");

 const apiUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&format=json`; // Crée l'URL de l'API avec le terme de recherche

 try {
 const res = await axios.get(apiUrl); // Effectue la requête à l'API
 const data = res.data; // Récupère les données de la réponse

 if (!data?.videos?.length) {
 return message.reply(`❌ | Aucune vidéo trouvée pour: ${toBold(query)}`); // Si aucune vidéo n'est trouvée, affiche un message
 }

 const topVideos = data.videos.slice(0, 10); // Récupère les 10 premières vidéos

 // Prépare le message avec les vignettes
 let output = `🔍 Résultats pour: ${query}\n\n`; // Initialise la chaîne de sortie
 const attachments = []; // Crée un tableau pour les pièces jointes

 for (let i = 0; i < Math.min(5, topVideos.length); i++) { // Boucle sur les 5 premières vidéos ou moins
 const video = topVideos[i]; // Récupère la vidéo actuelle
 output += `📼 ${i + 1}. ${video.title}\n⏱️ ${video.length_min} min | 👍 ${video.rating}/5\n🌐 Url: https://www.eporner.com/video-${video.id}/${video.slug}/\n\n`; // Ajoute les informations de la vidéo à la sortie

 
 // Récupère la vignette
 try {
 const thumbResponse = await axios.get(video.default_thumb.src, { responseType: 'stream' }); // Effectue une requête pour la vignette
 attachments.push(thumbResponse.data); // Ajoute les données de la vignette au tableau des pièces jointes
 } catch (e) {
 console.error(`Échec de l'obtention de la vignette pour la vidéo ${i + 1}`); // Affiche une erreur en cas d'échec
 }
 }

 output += `\nRépndez avec le numéro (1-${Math.min(5, topVideos.length)}) pour obtenir l'URL de la vidéo.`; // Ajoute des instructions pour répondre avec le numéro de la vidéo

 await message.reply({
 body: output, // Envoie le message
 attachment: attachments // Envoie les pièces jointes (vignettes)
 });

 // Stocke les données de la vidéo pour la gestion des réponses
 global.GoatBot.onReply.set(event.messageID, {
 commandName, // Nom de la commande
 author: event.senderID, // ID de l'auteur
 messageID: event.messageID, // ID du message
 videos: topVideos // Liste des vidéos
 });

 } catch (e) {
 console.error(e); // Affiche les erreurs dans la console
 return message.reply("❌ | Échec de la récupération des données vidéo. Veuillez réessayer plus tard."); // Envoie un message d'erreur
 }
 },

 onReply: async function ({ message, Reply, event }) {
 const { author, commandName, videos } = Reply;
 if (event.senderID !== author) return; // Vérifie si l'auteur de la réponse est le même que celui de la commande d'origine
 
 const selectedNum = parseInt(event.body); // Convertit la réponse en entier
 if (isNaN(selectedNum)) {
 return message.reply("❌ | Veuillez répondre avec un numéro de la liste."); // Si la réponse n'est pas un nombre, affiche un message d'erreur
 }
 
 const videoIndex = selectedNum - 1; // Calcule l'index de la vidéo sélectionnée
 if (videoIndex < 0 || videoIndex >= Math.min(5, videos.length)) {
 return message.reply("❌ | Sélection invalide. Veuillez choisir un numéro de la liste."); // Si l'index est invalide, affiche un message d'erreur
 }
 
 const selectedVideo = videos[videoIndex]; // Récupère la vidéo sélectionnée
 
 try {
 // Récupère la page d'intégration de la vidéo pour extraire l'URL directe de la vidéo
 const embedUrl = `https://www.eporner.com/embed/${selectedVideo.id}`;
 const embedResponse = await axios.get(embedUrl);
 const embedHtml = embedResponse.data;
 
 // Extrait l'URL source de la vidéo de la page d'intégration
 const videoUrlMatch = embedHtml.match(/src="(https:\/\/[^"]+\.mp4)"/i);
 const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null;
 
 if (!videoUrl) {
 throw new Error("Impossible d'extraire l'URL de la vidéo"); // Si l'URL n'est pas trouvée, génère une erreur
 }
 
 await message.reply({
 body: `🎥 ${selectedVideo.title}\n⏱️ ${selectedVideo.length_min} min | 👍 ${selectedVideo.rating}/5\n\n🔗 URL de la vidéo directe:\n${videoUrl}`, // Envoie les informations et l'URL directe de la vidéo
 attachment: await global.utils.getStreamFromURL(selectedVideo.default_thumb.src) // Envoie la vignette
 });
 
 } catch (e) {
 console.error(e); // Affiche les erreurs dans la console
 // Rétrograde vers l'URL de la page si l'URL directe de la vidéo ne peut pas être obtenue
 const fallbackUrl = `https://www.eporner.com/video-${selectedVideo.id}/${selectedVideo.slug}/`;
 await message.reply({
 body: `🎥 ${selectedVideo.title}\n⏱️ ${selectedVideo.length_min} min | 👍 ${selectedVideo.rating}/5\n\n❌ Impossible d'obtenir l'URL directe de la vidéo. Voici le lien de la page:\n${fallbackUrl}`, // Envoie les informations et le lien de la page en cas d'échec
 attachment: await global.utils.getStreamFromURL(selectedVideo.default_thumb.src) // Envoie la vignette
 });
 }
 
 global.GoatBot.onReply.delete(event.messageID); // Supprime les données de réponse
 }
};