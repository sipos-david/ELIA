const Command = require("../../Command");
const CommandTypeEnum = require("../../CommandTypeEnum");

class SoundEffectCommand extends Command {
    constructor(name, volume) {
        super();
        this.name = name;

        this.description = "plays " + this.name + "soundeffect";

        if (volume != null) this.soundEffectVolume = volume;
        else this.soundEffectVolume = 0.8;
    }
    usage = " ";
    type = CommandTypeEnum.SOUNDEFFECT;
    soundEffectVolume;

    async execute(message, _args, elia) {
        if (elia.musicComponent.messageSenderInVoiceChannel(message)) {
            // Only try to join the sender's voice channel if they are in one themselves
            message.delete();

            const voiceChannel = message.member.voice.channel;
            const connection = await voiceChannel.join();

            connection
                .play("./resources/soundeffects/" + this.name + ".mp3", {
                    seek: 0,
                    volume: this.soundEffectVolume,
                })
                .on("finish", () => {
                    elia.loggingComponent.log(
                        message.author.username + " played: " + this.name
                    );
                    voiceChannel.leave();
                });
        } else {
            elia.messageComponent.reply(
                message,
                "You need to join a voice channel first!"
            );
        }
    }
}

module.exports = SoundEffectCommand;
