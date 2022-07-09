/**
 * Class for handling data on music
 */
export default class MusicData {
    /**
     * @param {string} url The URL to the YouTube video
     * @param {?string} title The title for the video
     */
    constructor(
        public readonly url: string,
        title: string | undefined = undefined,
    ) {
        if (title) {
            this.title = title;
        } else {
            this.title = "Title not avaliable";
        }
    }

    /**
     * The title for the video
     */
    title: string;
}
