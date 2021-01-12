module.exports = {
    name: "leave",
    description: "The bot leaves the voice channel",
    async execute(msg, _args, _bot) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );
        await voiceChannel.leave();
        await msg.reply("Bye Bye :smiling_face_with_tear:");

        msg.delete();
    },
};
