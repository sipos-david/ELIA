const { Message, VoiceConnection } = require("discord.js");
const ytdl = require("ytdl-core");
const Elia = require("../../Elia");

/**
 * Play's a song from an URL
 *
 * @param {Elia} elia an ELIA object
 * @param {Message} message a Discord message
 * @param {VoiceConnection} connection a Discord connection
 * @param {string} url a Youtube URL
 * @param {string} title the title of the song
 */
module.exports = async function playFromURL(
    elia,
    message,
    connection,
    url,
    title
) {
    const stream = ytdl(url, { filter: "audioonly" });

    connection
        .play(stream, {
            seek: 0,
            volume: parseFloat(elia.dataComponent.getMusicVolume()),
        })
        .on("finish", () => {
            elia.musicComponent.musicQueue.continuePlayingMusic();
        });

    elia.musicComponent.musicQueue.cacheYouTubeTitle(url);

    if (message != null) {
        if (title == null)
            elia.messageComponent.reply(
                message,
                ":musical_note: Now Playing ***" + url + "***"
            );
        else
            elia.messageComponent.reply(
                message,
                ":musical_note: Now Playing ***" +
                    title +
                    "*** at ***" +
                    url +
                    "***"
            );
        elia.loggingComponent.log(message.author.username + " played: " + url);
    }
};
