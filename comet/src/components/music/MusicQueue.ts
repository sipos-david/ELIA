import MusicData from "./MusicData.js";

/**
 * A music queue that play's music.
 */
export default class MusicQueue {
    private queue: MusicData[] = [];
    private current: MusicData | undefined = undefined;
    private last: MusicData | undefined = undefined;

    // --- Flags ---

    /**
     * Determines if the current song is being looped or not
     *
     * @type {boolean}
     */
    isLoopingSong = false;

    /**
     * Determines if the current queue is being looped or not
     *
     * @type {boolean}
     */
    isLoopingQueue = false;

    play(music: MusicData): void {
        this.current = music;
    }

    replay(): MusicData | undefined {
        if (this.last) {
            this.queue.unshift(this.last);
            return this.last;
        }
        return undefined;
    }

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

    getCurrentSong(): MusicData | undefined {
        return this.current;
    }

    getQueuedMusic(): MusicData[] {
        return this.queue;
    }

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

    toogleSongLooping(): boolean {
        this.isLoopingSong = !this.isLoopingSong;
        return this.isLoopingSong;
    }

    toogleQueueLooping(): boolean {
        this.isLoopingQueue = !this.isLoopingQueue;
        return this.isLoopingQueue;
    }

    add(songs: MusicData[]): number {
        this.queue = this.queue.concat(songs);
        return this.queue.length;
    }
}
