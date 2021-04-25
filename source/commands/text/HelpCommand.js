const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

class HelpCommand extends Command {
    name = "help";
    description = "List all of my commands or info about a specific command.";
    usage = "*optional:* [command name]";
    type = CommandTypeEnum.UTILITY;
    guildOnly = false;
    async execute(message, args, elia) {
        elia.loggingComponent.log(message.author.username + " requested help");

        if (!args.length) {
            elia.messageComponent.helpSendAllCommands(message, elia);
        } else {
            const command = elia.commandMap.get(args[0].toLowerCase());

            if (!command) {
                return elia.messageComponent.reply(
                    message,
                    "that's not a valid command!"
                );
            } else elia.messageComponent.helpCommandUsage(message, command);
        }
    }
}

module.exports = HelpCommand;
