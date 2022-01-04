import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LoopSongCommand extends Command {
    name = "loopsong";
    description = "Start's or stops the current song from looping";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.loopCurrentSong(message);
    }
}
