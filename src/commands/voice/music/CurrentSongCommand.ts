import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class CurrentSongCommand extends Command {
    name = "currentsong";
    description = "Get the current song";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args: string[],
        elia: EliaInstance
    ): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        )
            elia.musicComponent?.getCurrentSong(source);
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
