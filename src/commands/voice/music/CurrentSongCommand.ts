import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class CurrentSongCommand extends Command {
    name = "currentsong";
    description = "Get the current song";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.getCurrentSong(message);
    }
}
