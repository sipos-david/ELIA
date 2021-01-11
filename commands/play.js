const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { musicVolume } = require("../config.json");

module.exports = {
    name: "play",
    description: "Joins and plays a video from youtube",
    async execute(msg, args) {
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

        const validURL = (str) => {
            var pattern = new RegExp(
                "^(https?:\\/\\/)?" + // protocol
                    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
                    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
                    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
                    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
                    "(\\#[-a-z\\d_]*)?$",
                "i"
            ); // fragment locator
            return !!pattern.test(str);
        };

        if (validURL(args[0])) {
            const connection = await voiceChannel.join();

            const stream = ytdl(args[0], { filter: "audioonly" });

            connection
                .play(stream, { seek: 0, volume: parseFloat(musicVolume) })
                .on("finish", () => {
                    voiceChannel.leave();
                });

            await msg.reply(":musical_note: Now Playing ***" + args[0] + "***");

            console.log(msg.author.username + " played: " + args[0]);

            return;
        }

        const connection = await voiceChannel.join();

        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };

        const video = await videoFinder(args.join(" "));

        if (video) {
            const stream = ytdl(video.url, { filter: "audioonly" });
            connection
                .play(stream, {
                    seek: 0,
                    volume: parseFloat(musicVolume),
                })
                .on("finish", () => {
                    voiceChannel.leave();
                });

            await msg.reply(
                ":musical_note: Now Playing ***" +
                    video.title +
                    "*** at ***" +
                    video.url +
                    "***"
            );

            console.log(msg.author.username + " played: " + video.url);
        } else {
            msg.channel.send("No video results found.");
        }
    },
};
