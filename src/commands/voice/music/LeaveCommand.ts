import EliaInstance from "../../../EliaInstance";
import CommandCallSource from "../../../model/CommandCallSource";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LeaveCommand extends Command {
    name = "leave";
    description = "The bot leaves the voice channel";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(
        source: CommandCallSource,
        _args: string[],
        elia: EliaInstance
    ): void {
        if (
            elia.properties.modes.isRadio ||
            elia.musicComponent?.messageSenderInVoiceChannel(source)
        ) {
            elia.musicComponent?.stopMusic(source);
        }
    }
}
