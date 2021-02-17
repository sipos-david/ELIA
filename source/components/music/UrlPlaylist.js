module.exports = function getYoutubePlaylistId(url) {
    let id = /[&|?]list=([a-zA-Z0-9_-]+)/gi.exec(url);
    if (id == null) return null;
    else return id[0].substring(6);
};
