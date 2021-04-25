const MusicQueue = require("./MusicQueue");
const Elia = require("../../Elia");
const { Message } = require("discord.js");
//song command imports
const CurrentSongCommand = require("../../commands/voice/music/CurrentSongCommand");
const GetQueueCommand = require("../../commands/voice/music/GetQueueCommand");
const LeaveCommand = require("../../commands/voice/music/LeaveCommand");
const LoopQueueCommand = require("../../commands/voice/music/LoopQueueCommand");
const LoopSongCommand = require("../../commands/voice/music/LoopSongCommand");
const PauseCommand = require("../../commands/voice/music/PauseCommand");
const PlayCommand = require("../../commands/voice/music/PlayCommand");
const QueueSongCommand = require("../../commands/voice/music/QueueSongCommand");
const RemoveSongFromQueueCommand = require("../../commands/voice/music/RemoveSongFromQueueCommand");
const ReplaySongCommand = require("../../commands/voice/music/ReplaySongCommand");
const ResumeSongCommand = require("../../commands/voice/music/ResumeSongCommand");
const ShuffleQueueCommand = require("../../commands/voice/music/ShuffleQueueCommand");
const SkipSongCommand = require("../../commands/voice/music/SkipSongCommand");

/**
 * Component for ELIA which add the music commands
 */
class MusicComponent {
    /**
     * Set's up the MusicComponent object for the ussage of music commands.
     *
     * @param {Elia} elia an Elia object
     */
    init(elia) {
        this.elia = elia;
        this.elia.musicComponent = this;
        /**
         * The music queue for the component
         * @type {MusicQueue}
         */
        this.musicQueue = new MusicQueue(elia);

        let commands = [
            new CurrentSongCommand(),
            new GetQueueCommand(),
            new LeaveCommand(),
            new LoopQueueCommand(),
            new LoopSongCommand(),
            new PauseCommand(),
            new PlayCommand(),
            new QueueSongCommand(),
            new RemoveSongFromQueueCommand(),
            new ReplaySongCommand(),
            new ResumeSongCommand(),
            new ShuffleQueueCommand(),
            new SkipSongCommand(),
        ];

        commands.forEach((cmd) => elia.commandMap.set(cmd.name, cmd));

        elia.loggingComponent.log("Music commands added to Elia.");
    }

    /**
     * Check's if the user who sent the massage has permissions to connect and speak in the channelh he/she currently in.
     *
     * @param {Message} message
     * @returns true if the user has the right permissions, else false
     */
    messageSenderHasRightPermissions(message) {
        const permissions = message.member.voice.channel.permissionsFor(
            message.client.user
        );
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            this.elia.messageComponent.reply(
                message,
                "You don't have the correct permissions"
            );
            return false;
        } else return true;
    }

    /**
     * Check's if the sender of the message is in a voice channel.
     *
     * @param {Message} message
     * @returns true if the user is a voice channel
     */
    messageSenderInVoiceChannel(message) {
        if (!message.member.voice.channel) {
            this.elia.messageComponent.reply(
                message,
                "You need to be in a channel to execute this command!"
            );
            return false;
        } else return true;
    }
}

module.exports = MusicComponent;
