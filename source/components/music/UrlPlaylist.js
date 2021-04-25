/**
 * Get's the YouTube id form a string
 *
 * @param {string} url a YouTube link
 * @returns {string} the YouTube id of the playlist
 */
module.exports = function getYoutubePlaylistId(url) {
    let id = /[&|?]list=([a-zA-Z0-9_-]+)/gi.exec(url);
    if (id == null) return null;
    else return id[0].substring(6);
};
