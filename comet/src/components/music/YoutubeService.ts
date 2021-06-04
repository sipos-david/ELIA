import { Readable } from "stream";
import ytSearch from "yt-search";
import ytdl from "ytdl-core";
import MusicData from "./MusicData";

/**
 * Service for handling operations with YouTube
 */
export default class YoutubeService {
    /**
     * Get audio stream from YouTube video url
     *
     * @param {string} url a YouTube video url
     * @returns {Readable} the stream contaiing the audio
     */
    getStreamFromUrl(url: string): Readable {
        return ytdl(url, { filter: "audioonly" });
    }

    /**
     * Get's the YouTube playlist id form a string
     *
     * @param {string} url a YouTube link
     * @returns {?string} the YouTube id of the playlist, if exists
     */
    getPlaylistIdFromUrl(url: string): string | null {
        const id = /[&|?]list=([a-zA-Z0-9_-]+)/gi.exec(url);
        if (id && id[0]) return id[0].substring(6);
        return null;
    }

    /**
     * Searches a string on YouTube and get the fist result.
     *
     * @param {string} query the string to search on YouTube
     * @returns {?MusicData} the first result of the query or null if no results
     */
    async getMusicFromQuery(query: string): Promise<MusicData | undefined> {
        const videoResult = await ytSearch(query);
        if (videoResult.videos.length > 1) {
            const result = videoResult.videos[0];
            if (result) {
                return new MusicData(result.url, result.title);
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}
