const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class LoopSongCommand extends Command {
    name = "loopsong";
    description = "Start's or stops the current song from looping";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.loopCurrentSong(message);
    }
}

module.exports = LoopSongCommand;
