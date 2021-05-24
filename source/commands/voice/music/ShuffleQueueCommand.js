const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class ShuffleQueueCommand extends Command {
    name = "shuffle";
    description = "Shuffles the music queue in a random way";
    usage = "";
    type = CommandTypeEnum.MUSIC;
    async execute(message, _args, elia) {
        if (
            elia.dataComponent.getRadioMode() ||
            (elia.musicComponent.messageSenderInVoiceChannel(message) &&
                elia.musicComponent.messageSenderHasRightPermissions(message))
        )
            elia.musicComponent.musicQueue.shuffleMusic(message);
    }
}

module.exports = ShuffleQueueCommand;
