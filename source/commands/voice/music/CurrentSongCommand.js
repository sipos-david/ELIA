const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class CurrentSongCommand extends Command {
    name = "currentsong";
    description = "Get the current song";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.musicComponent.messageSenderHasRightPermissions(message) &&
            elia.musicComponent.messageSenderInVoiceChannel(message)
        )
            elia.musicComponent.musicQueue.getCurrentSong(message);
    }
}

module.exports = CurrentSongCommand;
