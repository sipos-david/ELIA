module.exports = {
    name: "currentsong",
    description: "Get the current song",
    async execute(msg, _args, bot) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            return msg.channel.send("You don't have the correct permissions");

        bot.musicQueue.getCurrentSong(msg);
    },
};
