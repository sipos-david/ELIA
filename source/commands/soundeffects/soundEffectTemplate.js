const CommandTypeEnum = require("../../tools/commandTypeEnum.js");
class SoundEffect {
    constructor(_name, volume) {
        this.name = _name;

        this.description = "plays " + _name + "soundeffect";

        if (volume != null) this.soundEffectVolume = volume;
        else this.soundEffectVolume = 0.4;
    }

    args = false;
    usage = " ";
    type = CommandTypeEnum.SOUNDEFFECT;
    soundEffectVolume;

    async execute(msg, _args, _bot) {
        if (msg.member.voice.channel) {
            // Only try to join the sender's voice channel if they are in one themselves
            msg.delete();

            const voiceChannel = msg.member.voice.channel;
            const connection = await voiceChannel.join();

            connection
                .play("./resources/soundeffects/" + this.name + ".mp3", {
                    seek: 0,
                    volume: this.soundEffectVolume,
                })
                .on("finish", () => {
                    console.log(msg.author.username + " played: " + this.name);
                    voiceChannel.leave();
                });
        } else {
            msg.reply("You need to join a voice channel first!");
        }
    }
}

module.exports = SoundEffect;
