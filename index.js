const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const LOG_CHANNEL_ID = "1506692717772673245";
let active = true;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

async function sendLog(color, title, fields, footer = "") {
  if (!active) return;
  const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!channel) return;
  const embed = new EmbedBuilder().setColor(color).setTitle(title).addFields(fields).setTimestamp();
  if (footer) embed.setFooter({ text: footer });
  await channel.send({ embeds: [embed] }).catch(console.error);
}

client.once("ready", async () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: [
      { name: "activer", description: "Active les logs" },
      { name: "stop", description: "Désactive les logs" },
    ],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "activer") {
    active = true;
    await interaction.reply({ content: "✅ Logs activés !", ephemeral: true });
  } else if (interaction.commandName === "stop") {
    active = false;
    await interaction.reply({ content: "🛑 Logs désactivés !", ephemeral: true });
  }
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
