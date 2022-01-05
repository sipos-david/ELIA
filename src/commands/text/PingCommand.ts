import { Message } from "discord.js";
import EliaInstance from "../../EliaInstance";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class PingCommand extends Command {
    name = "ping";
    description = "Pings the bot";
    usage = " ";
    type = CommandTypeEnum.OTHER;
    execute(message: Message, _args: string[], elia: EliaInstance): void {
        elia.messageComponent.reply(message, "Pong!", elia.properties);
    }
}
