import { Message } from "discord.js";
import EliaInstance from "../../../EliaInstance";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class ShuffleQueueCommand extends Command {
    name = "shuffle";
    description = "Shuffles the music queue in a random way";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args_: string[], elia: EliaInstance): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent?.shuffleMusic(message);
    }
}
