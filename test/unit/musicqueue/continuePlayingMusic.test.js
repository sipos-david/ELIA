/* eslint-disable no-undef */
const assert = require("assert");
const sinon = require("sinon");
const MusicQueue = require("../../../source/components/music/MusicQueue");
const Elia = require("../../../source/Elia");

var mockActivityDisplayComponent;
var mockMusicQueueArray;
var musicQueue;
var stubHasMembersInVoice;
var spyStopMusic;
var spyPlayMusicFromQueue;

describe("MusicQueue", function () {
    describe("#continuePlayingMusic()", function () {
        before(function () {
            mockActivityDisplayComponent = {
                setDefault: function () {},
                setMusicPlaying: function () {},
            };
            mockMusicQueueArray = { length: Number, shift: function () {} };
            musicQueue = new MusicQueue(
                new Elia(null, null, null, mockActivityDisplayComponent, null)
            );
            stubHasMembersInVoice = sinon.stub(musicQueue, "hasMembersInVoice");
            spyStopMusic = sinon.spy(musicQueue, "stopMusic");
            spyPlayMusicFromQueue = sinon.spy(musicQueue, "playMusicFromQueue");
        });

        it("queue is empty", function () {
            mockMusicQueueArray.length = 0;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            musicQueue.continuePlayingMusic();
            assert(spyPlayMusicFromQueue.notCalled);
            assert(spyStopMusic.calledOnce);
        });

        it("number of members is zero", function () {
            mockMusicQueueArray.length = 5;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            stubHasMembersInVoice.returns(false);
            musicQueue.continuePlayingMusic();
            assert(spyStopMusic.calledTwice);
            assert(spyPlayMusicFromQueue.notCalled);
        });

        it("queue is not empty and number of members is more than 0", function () {
            mockMusicQueueArray.length = 5;
            musicQueue.musicQueueArray = mockMusicQueueArray;
            stubHasMembersInVoice.returns(true);
            musicQueue.continuePlayingMusic();
            assert(spyStopMusic.calledTwice);
            assert(spyPlayMusicFromQueue.calledOnce);
        });
    });
});
