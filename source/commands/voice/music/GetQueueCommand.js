const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class GetQueueCommand extends Command {
    name = "getqueue";
    description = "Get the songs in the queue";
    usage = " ";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.getQueuedMusic(message);
    }
}

module.exports = GetQueueCommand;
