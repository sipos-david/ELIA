import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class PingCommand extends Command {
    name = "ping";
    description = "Pings the bot";
    usage = " ";
    type = CommandTypeEnum.OTHER;
    execute(
        source: CommandCallSource,
        _args: string[],
        elia: EliaInstance
    ): void {
        elia.messageComponent.reply(source, "Pong!");
    }
}
