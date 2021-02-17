const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

class HelpCommand extends Command {
    name = "help";
    description = "List all of my commands or info about a specific command.";
    usage = "*optional:* [command name]";
    type = CommandTypeEnum.UTILITY;
    guildOnly = false;
    execute(message, args, elia) {
        const data = [];

        elia.loggingComponent.log(message.author.username + " requested help");

        if (!args.length) {
            data.push("***Here's a list of all my commands:***");

            let musicCommandsList = [];
            let soundEffectCommandsList = [];
            let utilityCommandsList = [];
            let otherCommandsList = [];

            elia.commandMap.forEach((element) => {
                switch (element.type) {
                    case CommandTypeEnum.MUSIC:
                        musicCommandsList.push(element.name);
                        break;
                    case CommandTypeEnum.SOUNDEFFECT:
                        soundEffectCommandsList.push(element.name);
                        break;
                    case CommandTypeEnum.UTILITY:
                        utilityCommandsList.push(element.name);
                        break;
                    case CommandTypeEnum.OTHER:
                        otherCommandsList.push(element.name);
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
                `\n***You can send*** \`${elia.dataComponent.getPrefix()}help [command name]\` ***to get info on a specific command!***`
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

        const command = elia.commandMap.get(name);

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
    }
}

module.exports = HelpCommand;
