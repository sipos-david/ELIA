import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class PauseCommand extends Command {
    name = "pause";
    description = "Pause playing the song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.musicQueue?.pauseMusic(message);
    }
}
