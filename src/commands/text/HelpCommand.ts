import {Message} from "discord.js";
import Elia from "../../Elia";
import Command from "../Command";
import {CommandTypeEnum} from "../CommandTypeEnum";

export default class HelpCommand extends Command {
    name = "help";
    description = "List all of my commands or info about a specific command.";
    usage = "*optional:* [command name]";
    type = CommandTypeEnum.UTILITY;
    guildOnly = false;

    execute(message: Message, args: string[], elia: Elia): void {
        elia.loggingComponent.log(
            message.author.username + " requested help"
        );

        if (!args.length) {
            elia.messageComponent.helpSendAllCommands(message, elia);
        } else {
            const arg = args[0];
            if (arg) {
                const command = elia.commandMap.get(arg.toLowerCase());
                if (!command) {
                    return elia.messageComponent.reply(
                        message,
                        "that's not a valid command!"
                    );
                } else elia.messageComponent.helpCommandUsage(message, command);
            }
        }
    }
}
