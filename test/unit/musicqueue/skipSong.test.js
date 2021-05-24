/* eslint-disable no-undef */
const assert = require("assert");
const sinon = require("sinon");
const MusicQueue = require("../../../source/components/music/MusicQueue");
const Elia = require("../../../source/Elia");

var mockLoggingComponent;
var spyLog;
var mockMessageComponent;
var spyReply;
var mockUser;
var mockMessage;
var musicQueue;
var spyContinuePlayingMusic;

describe("MusicQueue", function () {
    describe("#skipSong()", function () {
        before(function () {
            mockLoggingComponent = { log: function () {} };
            spyLog = sinon.spy(mockLoggingComponent, "log");
            mockMessageComponent = { reply: function () {} };
            spyReply = sinon.spy(mockMessageComponent, "reply");
            mockUser = { username: String };
            mockMessage = { author: mockUser };
            musicQueue = new MusicQueue(
                new Elia(
                    null,
                    null,
                    mockLoggingComponent,
                    null,
                    mockMessageComponent
                )
            );
            spyContinuePlayingMusic = sinon.spy(
                musicQueue,
                "continuePlayingMusic"
            );
        });

        it("reply, log then continouePlayingMusic", function () {
            musicQueue.skipSong(mockMessage);
            assert(spyLog.calledAfter(spyReply));
            assert(spyContinuePlayingMusic.calledAfter(spyLog));
            assert(spyLog.calledOnce);
            assert(spyReply.calledOnce);
            assert(spyContinuePlayingMusic.calledOnce);
        });
    });
});
