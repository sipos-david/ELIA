const ytSearch = require("yt-search");
const validURL = require("../tools/urlChecker.js");
const CommandTypeEnum = require("../tools/commandTypeEnum.js");

module.exports = {
    name: "play",
    description: "Joins and plays a video from youtube",
    usage:
        " *required:* <Youtube link> *or search terms:* <term1> <term2> <term3> ...",
    type: CommandTypeEnum.MUSIC,
    async execute(msg, args, bot) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(
                "You need to be in a channel to execute this command!"
            );
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
            return msg.channel.send("You don't have the correct permissions");
        if (!args.length)
            return msg.channel.send("You need to send the second argument!");

        if (validURL(args[0])) {
            bot.musicQueue.playMusic(msg, voiceChannel, args[0]);
        } else {
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return videoResult.videos.length > 1
                    ? videoResult.videos[0]
                    : null;
            };

            const video = await videoFinder(args.join(" "));

            if (video) {
                bot.musicQueue.playMusic(
                    msg,
                    voiceChannel,
                    video.url,
                    video.title
                );
            } else {
                msg.channel.send("No video results found.");
            }
        }
    },
};
