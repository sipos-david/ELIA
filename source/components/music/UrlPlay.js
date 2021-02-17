const ytdl = require("ytdl-core");

/**
 * Play's a song from anURL
 *
 * @param {*} elia an ELIA object
 * @param {*} msg a Discord message
 * @param {*} connection a Discord connection
 * @param {*} url an URL in string
 * @param {*} title string
 */
module.exports = async function playFromURL(
    elia,
    msg,
    connection,
    url,
    title = null
) {
    const stream = ytdl(url, { filter: "audioonly" });

    elia.activityDisplayComponent.setMusicPlaying();

    if (msg != null) {
        connection
            .play(stream, {
                seek: 0,
                volume: parseFloat(
                    elia.dataComponent.getMusicVolume(msg.guild.id)
                ),
            })
            .on("finish", () => {
                elia.musicComponent.musicQueue.continuePlayingMusic();
            });

        if (title == null) {
            await elia.messageComponent.reply(
                msg,
                ":musical_note: Now Playing ***" + url + "***"
            );
        } else {
            await elia.messageComponent.reply(
                msg,
                ":musical_note: Now Playing ***" +
                    title +
                    "*** at ***" +
                    url +
                    "***"
            );
        }

        console.log(msg.author.username + " played: " + url);
    } else {
        connection
            .play(stream, {
                seek: 0,
                volume: parseFloat(elia.dataComponent.getMusicVolume()),
            })
            .on("finish", () => {
                elia.musicComponent.musicQueue.continuePlayingMusic();
            });

        if (title == null) {
            elia.bot.channels.cache
                .get(elia.dataComponent.getBotSpamChannelId(msg.guild.id))
                .send(":musical_note: Now Playing ***" + url + "***");
        } else {
            elia.bot.channels.cache
                .get(elia.dataComponent.getBotSpamChannelId(msg.guild.id))
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
