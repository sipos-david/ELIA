/**
 * Get's the YouTube id form a string
 *
 * @param {string} url a YouTube link
 * @returns {?string} the YouTube id of the playlist
 */
export default function getYoutubePlaylistId(url: string): string | null {
    const id = /[&|?]list=([a-zA-Z0-9_-]+)/gi.exec(url);
    if (id && id[0]) return id[0].substring(6);
    return null;
}
