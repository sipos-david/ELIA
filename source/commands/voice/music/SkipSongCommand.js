const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class SkipSongCommand extends Command {
    name = "skip";
    description = "Skip a song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.skipSong(message);
    }
}

module.exports = SkipSongCommand;
