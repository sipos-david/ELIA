import { Message } from "discord.js";
import EliaInstance from "../../../EliaInstance";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LeaveCommand extends Command {
    name = "leave";
    description = "The bot leaves the voice channel";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: EliaInstance): void {
        if (
            elia.properties.modes.isRadio ||
            elia.musicComponent?.messageSenderInVoiceChannel(message)
        ) {
            elia.musicComponent?.stopMusic(message);
        }
    }
}
