import { Message } from "discord.js";
import Elia from "../../../Elia";
import Command from "../../Command";
import { CommandTypeEnum } from "../../CommandTypeEnum";

export default class LeaveCommand extends Command {
    name = "leave";
    description = "The bot leaves the voice channel";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    execute(message: Message, _args: string[], elia: Elia): void {
        if (
            elia.dataComponent.getRadioMode() ||
            elia.musicComponent?.messageSenderInVoiceChannel(message)
        ) {
            elia.musicComponent?.stopMusic(message);
        }
    }
}
