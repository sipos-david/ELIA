const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class LeaveCommand extends Command {
    name = "leave";
    description = "The bot leaves the voice channel";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            elia.musicComponent.messageSenderInVoiceChannel(message)
        ) {
            elia.musicComponent.musicQueue.stopMusic(message);
        }
    }
}

module.exports = LeaveCommand;
