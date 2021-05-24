const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class LoopQueueCommand extends Command {
    name = "loopqueue";
    description = "Start's or stops the queue from looping";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.loopMusicQueue(message);
    }
}

module.exports = LoopQueueCommand;
