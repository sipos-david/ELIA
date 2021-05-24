import { Message } from "discord.js";
import Elia from "../../Elia";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class PingCommand extends Command {
    name = "ping";
    description = "Pings the bot";
    usage = " ";
    type = CommandTypeEnum.OTHER;
    execute(message: Message, _args: string[], elia: Elia): void {
        elia.messageComponent.reply(message, "Pong!");
    }
}
