import { Message, TextChannel } from "discord.js";
import EliaInstance from "../../EliaInstance";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";

export default class MemeCommand extends Command {
    name = "meme";
    description = "send memes to the server's specific meme channel";
    hasArguments = true;
    usage = " <link>";
    type = CommandTypeEnum.OTHER;
    shouldDelete = false;
    async execute(
        message: Message,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (message.guild !== null) {
            const channelID = elia.properties.channels.memeId;
            if (channelID) {
                const channel = await message.client.channels.fetch(channelID);
                if (channel && channel instanceof TextChannel) {
                    const messageText = args.join(" ");
                    channel.send(`${message.author.toString()} ` + messageText);
                    message.delete();
                    elia.loggingComponent.log(
                        message.author.username + " sent memes"
                    );
                }
            }
        }
    }
}
