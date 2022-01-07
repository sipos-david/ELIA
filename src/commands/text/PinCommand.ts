import { TextChannel } from "discord.js";
import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class PinCommand extends Command {
    name = "pin";
    description = "send messages to the server's pin channel";
    usage = " <message>";
    hasArguments = true;
    type = CommandTypeEnum.OTHER;
    shouldDelete = false;

    async execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (source.guild) {
            const channelID = elia.properties.channels.pinId;
            if (channelID) {
                const channel = await source.client?.channels.fetch(channelID);
                if (channel && channel instanceof TextChannel) {
                    const messageText = args.join(" ");
                    channel.send(`${source.user.toString()} ` + messageText);

                    elia.loggingComponent.log(
                        source.user.username + " pinned a message"
                    );
                }
            }
        }
    }
}
