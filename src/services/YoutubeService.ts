import ytSearch from "yt-search";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import play, { YouTubeStream, SoundCloudStream } from "play-dl";
import MusicData from "../model/MusicData";

/**
 * Service for handling operations with YouTube
 */
export default class YoutubeService {
    /**
     * Get audio stream from YouTube video url
     *
     * @param {string} url a YouTube video url
     * @returns {any} the stream containing the audio
     */
    async getStreamFromUrl(
        url: string,
    ): Promise<YouTubeStream | SoundCloudStream> {
        return play.stream(url);
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
     * Gets the songs from the playlist id
     *
     * @param {string} id the id of the playlist
     * @returns {MusicData[]} an array of the songs in the playlist
     */
    async getPlaylistFromId(id: string): Promise<MusicData[]> {
        const result: MusicData[] = [];
        const playlist = await ytpl(id, {});
        if (playlist.items.length > 1) {
            for (let i = 1; i < playlist.items.length; i++) {
                const item = playlist.items[i];
                if (item) {
                    result.push(new MusicData(item.url, item.title));
                }
            }
        }
        return result;
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

    async getMusicFromUrl(url: string): Promise<MusicData | undefined> {
        const result = await ytdl.getBasicInfo(url);
        if (result) {
            return new MusicData(url, result.videoDetails.title);
        } else {
            return undefined;
        }
    }
}
