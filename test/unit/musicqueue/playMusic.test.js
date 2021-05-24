/* eslint-disable no-undef */
var assert = require("assert");
const sinon = require("sinon");
const { Message } = require("discord.js");
const Elia = require("../../../source/Elia.js");
const MusicQueue = require("../../../source/components/music/MusicQueue");

var musicQueue;
var message;
var mockVoiceChannel;
var spyCacheYoutubeTitle;
var spyJoin;

describe("MusicQueue", function () {
    describe("#playMusic()", function () {
        before(function () {
            musicQueue = new MusicQueue(Elia);
            message = new Message();
            mockVoiceChannel = { id: String, join: function () {} };
            spyCacheYoutubeTitle = sinon.spy(musicQueue, "cacheYouTubeTitle");
            spyJoin = sinon.spy(mockVoiceChannel, "join");
        });

        it("add values and called once voiceChannel.join() function and call once cacheYouTubeTitle function", function () {
            musicQueue.playMusic(
                message,
                mockVoiceChannel,
                "https://www.youtube.com/watch?v=NYeLG0wG--k&list=RDGMEMTmC-2iNKH_l8gQ1LHo9FeQVMNYeLG0wG--k&start_radio=1"
            );
            assert.strictEqual(musicQueue.isPlayingMusic, true);
            assert.strictEqual(musicQueue.voiceChannel, mockVoiceChannel);
            assert(spyJoin.calledOnce);
            assert(spyCacheYoutubeTitle.calledOnce);
        });
    });
});
