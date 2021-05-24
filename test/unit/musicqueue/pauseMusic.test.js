/* eslint-disable no-undef */
const assert = require("assert");
const sinon = require("sinon");
const { VoiceChannel } = require("discord.js");
const Elia = require("../../../source/Elia.js");
const MusicQueue = require("../../../source/components/music/MusicQueue");

var voiceChannel = VoiceChannel;
var mockMessageComponent;
var spyReply;
var mockDispatcher;
var voiceConnection;
var spyPause;
var mockLoggingComponent;
var spyLog;
var mockUser;
var mockMessage;
var musicQueue;

describe("MusicQueue", function () {
    describe("#pauseMusic()", function () {
        beforeEach(function () {
            mockMessageComponent = { reply: function () {} };
            spyReply = sinon.spy(mockMessageComponent, "reply");
            mockDispatcher = { pause: function () {} };
            voiceConnection = { dispatcher: mockDispatcher };
            spyPause = sinon.spy(mockDispatcher, "pause");
            mockLoggingComponent = { log: function () {} };
            spyLog = sinon.spy(mockLoggingComponent, "log");
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
        });

        it("musicQueue.isPaused was true", function () {
            musicQueue.isPaused = true;
            musicQueue.pauseMusic(mockMessage);
            assert(spyReply.calledOnce);
        });

        it("musicQueue.isPaused was false", function () {
            musicQueue.isPaused = false;
            musicQueue.voiceChannel = voiceChannel;
            musicQueue.connection = voiceConnection;
            musicQueue.pauseMusic(mockMessage);
            assert(spyPause.calledOnce);
            assert(spyReply.calledOnce);
            assert(spyLog.calledOnce);
            assert.strictEqual(musicQueue.isPaused, true);
        });
    });
});
