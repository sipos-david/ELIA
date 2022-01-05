import { Message, TextChannel } from "discord.js";
import EliaInstance from "../../EliaInstance";
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
        message: Message,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (message.guild) {
            const channelID = elia.properties.channels.pinId;
            if (channelID) {
                const channel = await message.client.channels.fetch(channelID);
                if (channel && channel instanceof TextChannel) {
                    const messageText = args.join(" ");
                    channel.send(`${message.author.toString()} ` + messageText);
                    message.delete();
                    elia.loggingComponent.log(
                        message.author.username + " pinned a message"
                    );
                }
            }
        }
    }
}
