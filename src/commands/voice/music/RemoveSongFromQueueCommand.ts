import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class RemoveSongFromQueueCommand extends Command {
    name = "rmsong";
    description = "Remove's a song or a range of songs from the music queue";
    usage =
        "*required:* <number in the queue> *or range in queue:* <from>-<to>";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        args: string[],
        elia: EliaInstance,
    ): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        ) {
            const arg = args[0];
            if (arg) {
                elia.musicComponent?.removeFromQueue(source, arg);
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
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName("interval")
                    .setDescription(
                        "<number in the queue> *or range in queue:* <from>-<to>",
                    )
                    .setRequired(true),
            );
    }
}
