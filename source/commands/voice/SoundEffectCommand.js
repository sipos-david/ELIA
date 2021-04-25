const Command = require("../Command");
const CommandTypeEnum = require("../CommandTypeEnum");

/**
 * Command for playing sound effects
 */
class SoundEffectCommand extends Command {
    /**
     * @param {string} name the command's name
     * @param {?number} volume the volume of the played sound
     */
    constructor(name, volume) {
        super();
        this.name = name;

        this.description = "plays " + this.name + "soundeffect";

        if (volume != null) this.soundEffectVolume = volume;
    }
    usage = " ";
    type = CommandTypeEnum.SOUNDEFFECT;
    /**
     * the volume of the played sound
     * @type {number}
     */
    soundEffectVolume = 0.8;

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
