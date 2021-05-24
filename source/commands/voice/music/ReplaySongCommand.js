const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class ReplaySongCommand extends Command {
    name = "replay";
    description = "Replays the last played song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.replayMusic(message);
    }
}

module.exports = ReplaySongCommand;
