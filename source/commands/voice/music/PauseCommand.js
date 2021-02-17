const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class PauseCommand extends Command {
    name = "pause";
    description = "Pause playing the song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.musicComponent.messageSenderHasRightPermissions(message) &&
            elia.musicComponent.messageSenderInVoiceChannel(message)
        )
            elia.musicComponent.musicQueue.pauseMusic(message);
    }
}

module.exports = PauseCommand;
