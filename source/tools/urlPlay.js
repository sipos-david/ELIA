const ytdl = require("ytdl-core");
const { musicVolume } = require("../../config.json");
const { botSpamChannelID } = require("../../config.json");

module.exports = async function playFromURL(
    bot,
    msg,
    connection,
    url,
    title = null
) {
    const stream = ytdl(url, { filter: "audioonly" });

    bot.activityDisplay.setMusicPlaying();

    connection
        .play(stream, { seek: 0, volume: parseFloat(musicVolume) })
        .on("finish", () => {
            bot.musicQueue.continuePlayingMusic();
        });

    if (msg != null) {
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
    } else {
        if (title == null) {
            bot.channels.cache
                .get(botSpamChannelID)
                .send(":musical_note: Now Playing ***" + url + "***");
        } else {
            bot.channels.cache
                .get(botSpamChannelID)
                .send(
                    ":musical_note: Now Playing ***" +
                        title +
                        "*** at ***" +
                        url +
                        "***"
                );
        }
    }
};
