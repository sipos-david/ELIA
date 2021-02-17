const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class ResumeSongCommand extends Command {
    name = "resume";
    description = "Resume playing the song";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.musicComponent.messageSenderHasRightPermissions(message) &&
            elia.musicComponent.messageSenderInVoiceChannel(message)
        )
            elia.musicComponent.musicQueue.resumeMusic(message);
    }
}

module.exports = ResumeSongCommand;
