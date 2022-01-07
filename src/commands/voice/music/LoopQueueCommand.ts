import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LoopQueueCommand extends Command {
    name = "loopqueue";
    description = "Start's or stops the queue from looping";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args: string[],
        elia: EliaInstance
    ): void {
        if (
            elia.properties.modes.isRadio ||
            (elia.musicComponent?.messageSenderInVoiceChannel(source) &&
                elia.musicComponent.messageSenderHasRightPermissions(source))
        )
            elia.musicComponent?.loopMusicQueue(source);
    }
}
