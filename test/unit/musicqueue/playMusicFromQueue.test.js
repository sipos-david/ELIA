/* eslint-disable no-undef */
const assert = require("assert");
const { Message } = require("discord.js");
const sinon = require("sinon");
const MusicQueue = require("../../../source/components/music/MusicQueue");
const Elia = require("../../../source/Elia");

var message = Message;
var mockMusicQueueArray;
var spyShift;
var spyUnshift;
var mockActivityDisplayComponent;
var spySetMusicPlaying;
var musicQueue;

describe("MusicQueue", function () {
    describe("#playMusicFromQueue()", function () {
        this.beforeEach(function () {
            mockMusicQueueArray = {
                length: Number,
                shift: function () {
                    return "currentSong";
                },
                unshift: function () {},
            };
            spyShift = sinon.spy(mockMusicQueueArray, "shift");
            spyUnshift = sinon.spy(mockMusicQueueArray, "unshift");
            mockActivityDisplayComponent = { setMusicPlaying: function () {} };
            spySetMusicPlaying = sinon.spy(
                mockActivityDisplayComponent,
                "setMusicPlaying"
            );
            musicQueue = new MusicQueue(
                new Elia(null, null, null, mockActivityDisplayComponent, null)
            );
            musicQueue.lastSong = "oldSong";
            musicQueue.currentSong = "newSong";
        });

        it("queue is empty", function () {
            mockMusicQueueArray.length = 0;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            musicQueue.playMusicFromQueue(message);
            assert(spyShift.notCalled);
            assert.strictEqual(musicQueue.currentSong, "newSong");
            assert.strictEqual(musicQueue.lastSong, "oldSong");
        });

        it("queue is not empty and isLoopingSong is false", function () {
            mockMusicQueueArray.length = 5;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            musicQueue.isLoopingSong = false;
            musicQueue.playMusicFromQueue(message);
            assert(spyShift.calledOnce);
            spyShift.restore();
            assert(spySetMusicPlaying.calledOnce);
            assert.strictEqual(musicQueue.lastSong, "newSong");
            assert.strictEqual(musicQueue.currentSong, "currentSong");
            assert(spyUnshift.notCalled);
        });

        it("queue is not empty and isLoopingSong is true", function () {
            mockMusicQueueArray.length = 5;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            musicQueue.isLoopingSong = true;
            musicQueue.playMusicFromQueue(message);
            assert(spyShift.calledOnce);
            spyShift.restore();
            assert(spySetMusicPlaying.calledOnce);
            assert.strictEqual(musicQueue.lastSong, "newSong");
            assert.strictEqual(musicQueue.currentSong, "currentSong");
            assert(spyUnshift.calledOnce);
        });
    });
});
