const ytdl = require("ytdl-core");

/**
 * Play's a song from an URL
 *
 * @param {*} elia an ELIA object
 * @param {*} msg a Discord message
 * @param {*} connection a Discord connection
 * @param {*} url an URL in string
 * @param {*} title the title of the song
 */
module.exports = async function playFromURL(elia, msg, connection, url, title) {
    const stream = ytdl(url, { filter: "audioonly" });

    connection
        .play(stream, {
            seek: 0,
            volume: parseFloat(elia.dataComponent.getMusicVolume()),
        })
        .on("finish", () => {
            elia.musicComponent.musicQueue.continuePlayingMusic();
        });

    elia.musicComponent.musicQueue.cacheYoutubeTitle(url);

    if (msg != null) {
        if (title == null)
            elia.messageComponent.reply(
                msg,
                ":musical_note: Now Playing ***" + url + "***"
            );
        else
            elia.messageComponent.reply(
                msg,
                ":musical_note: Now Playing ***" +
                    title +
                    "*** at ***" +
                    url +
                    "***"
            );
        elia.loggingComponent.log(msg.author.username + " played: " + url);
    }
};
