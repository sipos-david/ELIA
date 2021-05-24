/* eslint-disable no-undef */
const assert = require("assert");
const sinon = require("sinon");
const { Message } = require("discord.js");
const Elia = require("../../../source/Elia.js");
const MusicQueue = require("../../../source/components/music/MusicQueue");

var message = Message;
var mockActivityDisplay;
var mockVoiceChannel;
var spyLeave;
var mockMessageComponent;
var spyReply;
var musicQueue;

describe("MusicQueue", function () {
    describe("#stopMusic()", function () {
        before(function () {
            mockActivityDisplay = { setDefault: function () {} };
            mockVoiceChannel = { leave: function () {} };
            spyLeave = sinon.spy(mockVoiceChannel, "leave");
            mockMessageComponent = { reply: function () {} };
            spyReply = sinon.spy(mockMessageComponent, "reply");
            musicQueue = new MusicQueue(
                new Elia(
                    null,
                    null,
                    null,
                    mockActivityDisplay,
                    mockMessageComponent
                )
            );
        });

        it("set default state of musicQueue", function () {
            musicQueue.voiceChannel = mockVoiceChannel;
            musicQueue.stopMusic(message);
            assert.strictEqual(musicQueue.musicQueueArray.length, 0);
            assert.strictEqual(musicQueue.titleMap.size, 0);
            assert.strictEqual(musicQueue.isPlayingMusic, false);
            assert.strictEqual(musicQueue.isPaused, false);
            assert.strictEqual(musicQueue.voiceChannel, null);
            assert.strictEqual(musicQueue.connection, null);
            assert.strictEqual(musicQueue.currentSong, null);
            assert.strictEqual(musicQueue.isLoopingSong, false);
            assert.strictEqual(musicQueue.isLoopingQueue, false);
            assert(spyReply.calledOnceWith);
            assert(spyLeave.calledOnceWith);
        });
    });
});
