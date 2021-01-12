const ytdl = require("ytdl-core");
const { musicVolume } = require("../../config.json");
const setDefaultActivity = require("./defaultActivity.js");

module.exports = async function playFromURL(
    bot,
    msg,
    voiceChannel,
    url,
    title = null
) {
    const connection = await voiceChannel.join();

    const stream = ytdl(url, { filter: "audioonly" });

    bot.user.setActivity("Music :musical_note:", {
        type: "STREAMING",
    });

    connection
        .play(stream, { seek: 0, volume: parseFloat(musicVolume) })
        .on("finish", () => {
            voiceChannel.leave();
            setDefaultActivity(bot);
        });

    if (title == null) {
        await msg.reply(":musical_note: Now Playing ***" + url + "***");
    } else {
        await msg.reply(
            ":musical_note: Now Playing ***" +
                title +
                "*** at ***" +
                url +
                "***"
        );
    }

    console.log(msg.author.username + " played: " + url);
};
