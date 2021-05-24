import { Message, VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";
import Elia from "../../Elia";

/**
 * Play's a song from an URL
 *
 * @param {Elia} elia an ELIA object
 * @param {?Message} message a Discord message
 * @param {VoiceConnection} connection a Discord connection
 * @param {string} url a Youtube URL
 * @param {?string} title the title of the song
 */
export default function playFromURL(
    elia: Elia,
    message: Message | undefined,
    connection: VoiceConnection,
    url: string,
    title: string | undefined
): void {
    if (elia.musicComponent) {
        const stream = ytdl(url, { filter: "audioonly" });
        connection
            .play(stream, {
                seek: 0,
                volume: getMusicVolume(elia, message),
            })
            .on("finish", () => {
                if (elia.musicComponent && elia.musicComponent.musicQueue) {
                    elia.musicComponent.musicQueue.continuePlayingMusic();
                }
            });

        if (elia.musicComponent && elia.musicComponent.musicQueue) {
            elia.musicComponent.musicQueue.cacheYouTubeTitle(url);
        }

        if (message) {
            if (title) {
                elia.messageComponent.reply(
                    message,
                    ":musical_note: Now Playing ***" +
                        title +
                        "*** at ***" +
                        url +
                        "***"
                );
            } else {
                elia.messageComponent.reply(
                    message,
                    ":musical_note: Now Playing ***" + url + "***"
                );
            }
            elia.loggingComponent.log(
                message.author.username + " played: " + url
            );
        }
    }
}

/**
 * Get the volume number from message
 *
 * @param {Elia} elia an ELIA object
 * @param {?Message} message a Discord message
 * @returns  {number} the volume number
 */
function getMusicVolume(elia: Elia, message: Message | undefined): number {
    let vol: string;

    if (message && message.guild) {
        vol = elia.dataComponent.getMusicVolume(message.guild.id);
    } else {
        vol = elia.dataComponent.getMusicVolume(undefined);
    }

    return parseFloat(vol);
}
