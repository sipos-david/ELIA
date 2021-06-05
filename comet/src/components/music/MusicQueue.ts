import MusicData from "./MusicData.js";

/**
 * A class that handles a queue of music
 */
export default class MusicQueue {
    // --- Properties ---

    /**
     * The array of songs which the queue has
     *
     * @type {MusicData[]}
     */
    private queue: MusicData[] = [];

    /**
     * The current song that is playing, if undefined no song is playing
     *
     * @type {?MusicData}
     */
    private current: MusicData | undefined = undefined;

    /**
     * The last song played
     *
     * @type {?MusicData}
     */
    private last: MusicData | undefined = undefined;

    // --- Flags ---

    /**
     * Determines if the current song is being looped or not
     *
     * @type {boolean}
     */
    private isLoopingSong = false;

    /**
     * Determines if the current queue is being looped or not
     *
     * @type {boolean}
     */
    private isLoopingQueue = false;

    /**
     * Gets the state on playing music
     *
     * @returns {boolean} true or false, depending on if playing music
     */
    get isPlayingMusic(): boolean {
        if (this.current) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Plays a music
     *
     * @param {MusicData} music the music to be played
     */
    play(music: MusicData): void {
        this.current = music;
    }

    /**
     * Replays the last song if avaliable
     *
     * @returns {?MusicData} the last song that need to be replayed
     */
    replay(): MusicData | undefined {
        if (this.last) {
            this.queue.unshift(this.last);
            return this.last;
        }
        return undefined;
    }

    /**
     * Get the next item from the queue
     *
     * @returns {?MusicData} the next item, if available
     */
    getNext(): MusicData | undefined {
        this.last = this.current;

        if (this.isLoopingSong) {
            return this.current;
        }
        this.current = this.queue.shift();

        if (this.isLoopingQueue && this.last) {
            this.queue.push(this.last);
        }
        return this.current;
    }

    /**
     * Gets the current song
     *
     * @returns {?MusicData} the current song, if available
     */
    getCurrentSong(): MusicData | undefined {
        return this.current;
    }

    /**
     * Gets the current song
     *
     * @returns {MusicData[]} the current song, if available
     */
    getQueuedMusic(): MusicData[] {
        return this.queue;
    }

    /**
     * Steps and resets the state of the queue
     */
    stop(): void {
        this.queue = [];
        this.current = undefined;
        this.isLoopingSong = false;
        this.isLoopingQueue = false;
    }

    /**
     * Shuffle's the queue
     *
     * @returns {boolean} true if the queue was shuffled, else false
     */
    shuffle(): boolean {
        if (this.queue.length >= 2) {
            for (let i = this.queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp1 = this.queue[i];
                const temp2 = this.queue[j];
                if (temp1 && temp2) {
                    this.queue[i] = temp2;
                    this.queue[j] = temp1;
                }
            }
            return true;
        }
        return false;
    }

    /**
     *  Removes a song from the queue and returns it, if the action wasn't succesfull returns undefined
     *
     * @param {number} index the index that needs to be removed
     * @returns {?MusicData} the element which was removed
     */
    remove(index: number): MusicData | undefined {
        if (index < 0 || index > this.queue.length) {
            return undefined;
        } else {
            const removed = this.queue[index];
            if (index == 0 && this.queue.length == 1) {
                this.queue = [];
            } else {
                this.queue.splice(index, 1);
            }
            return removed;
        }
    }

    /**
     *  Removes songs from the queue and returns them
     *
     * @param {number} from the index to start from
     * @param {number} to the index to end
     * @returns {MusicData[]} the array of the removed elements
     */
    removeRange(from: number, to: number): MusicData[] {
        const removedSongs: MusicData[] = [];

        for (let i = from; i <= to; i++) {
            const song = this.queue[i];
            if (song) {
                removedSongs.push(song);
            }
        }

        if (from == 0 && to == this.queue.length - 1) {
            this.queue = [];
        } else {
            this.queue.splice(from, to - from + 1);
        }

        return removedSongs;
    }

    /**
     * Starts or stops looping the current song
     *
     * @returns {boolean} the state of looping
     */
    toogleSongLooping(): boolean {
        this.isLoopingSong = !this.isLoopingSong;
        return this.isLoopingSong;
    }

    /**
     * Starts or stops looping the queue
     *
     * @returns {boolean} the state of looping
     */
    toogleQueueLooping(): boolean {
        this.isLoopingQueue = !this.isLoopingQueue;
        return this.isLoopingQueue;
    }

    /**
     * Adds songs to the queue
     *
     * @param {MusicData[]} songs the array of songs to add to the queue in order
     * @returns {number} the new size of the queue
     */
    add(songs: MusicData[]): number {
        this.queue = this.queue.concat(songs);
        return this.queue.length;
    }
}
