import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class SkipSongCommand extends Command {
    name = "skip";
    description = "Skip a song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args_: string[],
        elia: EliaInstance
    ): void {
        if (
            elia.properties.modes.isDev ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        )
            elia.musicComponent?.skipSong(source);
    }
}
