import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class SkipSongCommand extends Command {
    name = "skip";
    description = "Skip a song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args_: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.musicQueue?.skipSong(message);
    }
}
