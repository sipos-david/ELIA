const { Util } = require("discord.js");
const { prefix } = require("../../config.json");
const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "help",
    description: "List all of my commands or info about a specific command.",
    usage: "*optional:* [command name]",
    type: CommandTypeEnum.UTILITY,
    execute(message, args, _bot) {
        const data = [];
        const { commands } = message.client;

        console.log(message.author.username + " requested help");

        if (!args.length) {
            data.push("***Here's a list of all my commands:***");

            let musicCommandsList = [];
            let soundEffectCommandsList = [];
            let utilityCommandsList = [];
            let otherCommandsList = [];

            commands
                .map((cmd) => cmd.name)
                .forEach((element) => {
                    let cmd = commands.get(element);
                    switch (cmd.type) {
                        case CommandTypeEnum.MUSIC:
                            musicCommandsList.push(cmd.name);
                            break;
                        case CommandTypeEnum.SOUNDEFFECT:
                            soundEffectCommandsList.push(cmd.name);
                            break;
                        case CommandTypeEnum.UTILITY:
                            utilityCommandsList.push(cmd.name);
                            break;
                        case CommandTypeEnum.OTHER:
                            otherCommandsList.push(cmd.name);
                            break;
                    }
                });

            data.push("\n***Music Commands***");
            data.push(musicCommandsList.join(", "));

            data.push("\n***SoundEffect Commands***");
            data.push(soundEffectCommandsList.join(", "));

            data.push("\n***Utility Commands ***");
            data.push(utilityCommandsList.join(", "));

            data.push("\n***Other Commands***");
            data.push(otherCommandsList.join(", "));

            data.push(
                `\n***You can send*** \`${prefix}help [command name]\` ***to get info on a specific command!***`
            );

            return message.author
                .send(data, { split: true })
                .then(() => {
                    if (message.channel.type === "dm") return;
                    message.reply("I've sent you a DM with all my commands!");
                })
                .catch((error) => {
                    console.error(
                        `Could not send help DM to ${message.author.tag}.\n`,
                        error
                    );
                    message.reply(
                        "it seems like I can't DM you! Do you have DMs disabled?"
                    );
                });
        }

        const name = args[0].toLowerCase();

        const command = commands.get(name);

        if (!command) {
            return message.reply("that's not a valid command!");
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases)
            data.push(`**Aliases:** ${command.aliases.join(", ")}`);
        if (command.description)
            data.push(`**Description:** ${command.description}`);
        if (command.usage)
            data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        message.channel.send(data, { split: true });

        if (message.channel.type === "dm") return;
        message.delete();
    },
};
