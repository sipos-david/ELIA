const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class RemoveSongFromQueueCommand extends Command {
    name = "rmsong";
    description = "Remove's a song or a range of songs from the music queue";
    usage =
        " *required:* <number in the queue> *or range in queue:* <from>-<to>";
    type = CommandTypeEnum.MUSIC;
    async execute(message, args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.removeFromQueue(args[0], message);
    }
}

module.exports = RemoveSongFromQueueCommand;
