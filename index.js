const fs = require("fs");
const Discord = require("discord.js");
const bot = new Discord.Client();
const SoundEffect = require("./commands/soundeffects/soundEffectTemplate.js");

const { token, prefix } = require("./config.json");

bot.commands = new Discord.Collection();

// import generic commands
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// import sound effects
console.log("------\nGenerating soundeffect commands:");

const soundEffects = fs
    .readdirSync("./resources/soundeffects")
    .filter((file) => file.endsWith(".mp3"));

for (const soundEffect of soundEffects) {
    const command = new SoundEffect(
        soundEffect.replace(".mp3", "").toLowerCase()
    );
    bot.commands.set(command.name, command);
    console.log("\t" + soundEffect + " -> " + command.name);
}

// on start
bot.on("ready", () => {
    console.log("------------\nE.L.I.A. is online!\n------------");
});

// interpret commands
bot.on("message", (message) => {
    try {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = bot.commands.get(commandName);

        if (!command) return message.reply("I can't understand that command!");

        if (command.guildOnly && message.channel.type !== "text") {
            return message.reply("I can't execute that command inside DMs!");
        }

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }

        if (!bot.commands.has(commandName)) return;

        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message
            .reply("there was an error trying to execute that command!")
            .then((_r) => null);
    }
});

// bot login
bot.login(token).then((_r) => null);
