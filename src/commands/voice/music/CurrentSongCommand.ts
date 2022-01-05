import { Message } from "discord.js";
import EliaInstance from "../../../EliaInstance";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class CurrentSongCommand extends Command {
    name = "currentsong";
    description = "Get the current song";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: EliaInstance): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.getCurrentSong(message);
    }
}
