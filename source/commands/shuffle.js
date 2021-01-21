const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "shuffle",
    description: "Shuffles the music queue in a random way.",
    usage: "",
    type: CommandTypeEnum.MUSIC,
    async execute(msg, _args, bot) {
        let voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            return msg.channel.send("You don't have the correct permissions");

        bot.musicQueue.shuffleMusic(msg);
    },
};
