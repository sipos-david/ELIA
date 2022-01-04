import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class RemoveSongFromQueueCommand extends Command {
    name = "rmsong";
    description = "Remove's a song or a range of songs from the music queue";
    usage =
        " *required:* <number in the queue> *or range in queue:* <from>-<to>";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, args: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        ) {
            const arg = args[0];
            if (arg) {
                elia.musicComponent?.removeFromQueue(arg, message);
            }
        }
    }
}
