import Discord from "discord.js";
import Elia from "./Elia";
import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import { getMusicCommands } from "./components/music/MusicComponent";
import DeleteMessagesCommand from "./commands/text/DeleteMessagesCommand";
import HelpCommand from "./commands/text/HelpCommand";
import MemeCommand from "./commands/text/MemeCommand";
import PinCommand from "./commands/text/PinCommand";
import PingCommand from "./commands/text/PingCommand";
import PollCommand from "./commands/text/PollCommand";
import YoutubeService from "./services/YoutubeService";
import PlayCommand from "./commands/voice/music/PlayCommand";
import QueueSongCommand from "./commands/voice/music/QueueSongCommand";
import { getSoundEffectCommands } from "./commands/voice/SoundEffectCommand";

const TOKEN = process.env["DISCORD_TOKEN"];
const bot = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

// create services
const youtubeService = new YoutubeService();

// create components
const loggingComponent = new LoggingComponent();
const activityDisplayComponent = new ActivityDisplayComponent(bot);
const messageComponent = new MessageComponent(loggingComponent);

// create ELIA
const elia = new Elia(
    bot,
    loggingComponent,
    activityDisplayComponent,
    messageComponent,
    youtubeService
);

// Add the base commands
elia.addCommands([
    new DeleteMessagesCommand(),
    new HelpCommand(elia.commands),
    new MemeCommand(),
    new PinCommand(),
    new PingCommand(),
    new PollCommand(),
]);
loggingComponent.log("Basic commands added to Elia.");

// Add the sound effect commands
elia.addCommands(getSoundEffectCommands(loggingComponent));
loggingComponent.log("Sound effect commands added to Elia.");

// Add the music commands
elia.addCommands(
    getMusicCommands(
        new PlayCommand(youtubeService),
        new QueueSongCommand(youtubeService)
    )
);
loggingComponent.log("Music commands added to Elia.");

elia.getAvailableCommands();

// on start
bot.on("ready", () => {
    elia.onReady();
});

// setup message handling
bot.on("messageCreate", (message: Discord.Message) => {
    elia.onMessage(message);
});

// bot login
bot.login(TOKEN);
