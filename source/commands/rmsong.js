const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "rmsong",
    description: "Remove's the song",
    usage:
        " *required:* <number in the queue> *or range in queue:* <from>-<to>",
    type: CommandTypeEnum.MUSIC,
    async execute(msg, args, bot) {
        if (!args.length)
            return msg.channel.send("You need to send the second argument!");
        let voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            return msg.channel.send("You don't have the correct permissions");

        bot.musicQueue.removeFromQueue(args[0], msg);
    },
};
