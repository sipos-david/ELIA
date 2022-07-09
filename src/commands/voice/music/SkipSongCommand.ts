import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class SkipSongCommand extends Command {
    name = "skip";
    description = "Skips a song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args_: string[],
        elia: EliaInstance,
    ): void {
        if (
            elia.properties.modes.isDev ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        ) {elia.musicComponent?.skipSong(source);}
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
