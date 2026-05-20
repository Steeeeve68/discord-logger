const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const TOKEN = process.env.TOKEN;
const LOG_CHANNEL_ID = "ID_SALON_LOGS";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

async function sendLog(color, title, fields, footer = "") {
  const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!channel) return;
  const embed = new EmbedBuilder().setColor(color).setTitle(title).addFields(fields).setTimestamp();
  if (footer) embed.setFooter({ text: footer });
  await channel.send({ embeds: [embed] }).catch(console.error);
}

client.once("ready", () => console.log(`✅ Bot connecté : ${client.user.tag}`));

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  await sendLog(0x5865f2, "📨 Nouveau message", [
    { name: "Auteur", value: `${message.author}`, inline: true },
    { name: "Salon", value: `${message.channel}`, inline: true },
    { name: "Message", value: message.content || "*[pas de texte]*" },
  ], `ID: ${message.id}`);
});

client.on("messageUpdate", async (before, after) => {
  if (!before || !after || before.author?.bot || before.content === after.content) return;
  await sendLog(0xfaa61a, "✏️ Message modifié", [
    { name: "Auteur", value: `${before.author}`, inline: true },
    { name: "Salon", value: `${before.channel}`, inline: true },
    { name: "Avant", value: before.content || "*[vide]*" },
    { name: "Après", value: after.content || "*[vide]*" },
  ], `ID: ${before.id}`);
});

client.on("messageDelete", async (message) => {
  if (message.author?.bot) return;
  await sendLog(0xed4245, "🗑️ Message supprimé", [
    { name: "Auteur", value: `${message.author}`, inline: true },
    { name: "Salon", value: `${message.channel}`, inline: true },
    { name: "Contenu", value: message.content || "*[vide]*" },
  ], `ID: ${message.id}`);
});

client.login(TOKEN);
