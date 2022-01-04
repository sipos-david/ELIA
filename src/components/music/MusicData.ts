/**
 * Class for handling data on music
 */
export default class MusicData {
    /**
     * @param {string} url The URL to the YouTube video
     * @param {?string} title The title for the video
     */
    constructor(url: string, title: string | undefined = undefined) {
        this.url = url;
        this._title = title;
    }

    /**
     * The URL to the YouTube video
     */
    url: string;

    /**
     * The title for the video
     */
    private _title: string | undefined;

    /**
     * The title for the video
     *
     * @returns {string} the title if exists, else "Title not avaliable"
     */
    get title(): string {
        if (this._title) {
            return this._title;
        } else {
            return "Title not avaliable";
        }
    }
}
