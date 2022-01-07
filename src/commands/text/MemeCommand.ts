import { TextChannel } from "discord.js";
import EliaInstance from "../../EliaInstance";
import CommandCallSource from "../../model/CommandCallSource";
import Command from "../Command";
import { CommandTypeEnum } from "../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class MemeCommand extends Command {
    name = "meme";
    description = "send memes to the server's specific meme channel";
    hasArguments = true;
    usage = " <link>";
    type = CommandTypeEnum.OTHER;
    shouldDelete = false;
    async execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance
    ): Promise<void> {
        if (source.guild !== null) {
            const channelID = elia.properties.channels.memeId;
            if (channelID) {
                const channel = await source.client?.channels.fetch(channelID);
                if (channel && channel instanceof TextChannel) {
                    const messageText = args.join(" ");
                    channel.send(`${source.user.toString()} ` + messageText);

                    elia.loggingComponent.log(
                        source.user.username + " sent memes"
                    );
                }
            }
        }
    }

    createSlashCommandData(): Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
        // eslint-disable-next-line indent
    > {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
