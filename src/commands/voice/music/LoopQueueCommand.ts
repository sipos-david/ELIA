import { Message } from "discord.js";
import EliaInstance from "../../../EliaInstance";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LoopQueueCommand extends Command {
    name = "loopqueue";
    description = "Start's or stops the queue from looping";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: EliaInstance): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.loopMusicQueue(message);
    }
}
