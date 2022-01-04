import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class ShuffleQueueCommand extends Command {
    name = "shuffle";
    description = "Shuffles the music queue in a random way";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args_: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.shuffleMusic(message);
    }
}
