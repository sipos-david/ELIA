class SoundEffect {
    constructor(_name, volume) {
        this.name = _name;

        this.description = "plays " + _name + "soundeffect";

        if (volume != null) this.soundEffectVolume = volume;
        else this.soundEffectVolume = 0.4;
    }

    args = false;
    usage = "";
    guildOnly = true;
    soundEffectVolume;

    async execute(msg, _args) {
        if (msg.member.voice.channel) {
            // Only try to join the sender's voice channel if they are in one themselves
            msg.delete();
            let connection = await msg.member.voice.channel.join();
            const dispatcher = connection.play(
                "./resources/soundeffects/" + this.name + ".mp3",
                {
                    volume: this.soundEffectVolume,
                }
            );
            dispatcher.on("finish", () => {
                console.log(msg.author.username + " played: " + this.name);
                dispatcher.destroy();
                connection.disconnect();
            });
        } else {
            msg.reply("You need to join a voice channel first!");
        }
    }
}

module.exports = SoundEffect;
