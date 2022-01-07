import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class ShuffleQueueCommand extends Command {
    name = "shuffle";
    description = "Shuffles the music queue in a random way";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args_: string[],
        elia: EliaInstance
    ): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        )
            elia.musicComponent?.shuffleMusic(source);
    }
}
