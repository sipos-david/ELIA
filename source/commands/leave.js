const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "leave",
    description: "The bot leaves the voice channel",
    usage: " ",
    type: CommandTypeEnum.MUSIC,
    async execute(msg, _args, bot) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );

        bot.musicQueue.stopMusic();
        await voiceChannel.leave();
        await msg.reply("Bye Bye :smiling_face_with_tear:");

        msg.delete();
    },
};
