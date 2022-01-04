import Discord from "discord.js";
import Elia from "./Elia";
import DataComponent from "./components/core/DataComponent";
import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import CommandComponent from "./components/CommandComponent";
import MusicComponent from "./components/music/MusicComponent";
import MusicQueue from "./components/music/MusicQueue";
import DeleteMessagesCommand from "./commands/text/DeleteMessagesCommand";
import HelpCommand from "./commands/text/HelpCommand";
import MemeCommand from "./commands/text/MemeCommand";
import PinCommand from "./commands/text/PinCommand";
import PingCommand from "./commands/text/PingCommand";
import PollCommand from "./commands/text/PollCommand";
import YoutubeService from "./components/music/YoutubeService";
import SoundEffectComponent from "./components/SoundEffectComponent";
import PlayCommand from "./commands/voice/music/PlayCommand";
import QueueSongCommand from "./commands/voice/music/QueueSongCommand";

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
const dataComponent = new DataComponent();
const loggingComponent = new LoggingComponent();
const activityDisplayComponent = new ActivityDisplayComponent(
    bot,
    dataComponent
);
const commandComponent = new CommandComponent();
const messageComponent = new MessageComponent(
    bot,
    dataComponent,
    loggingComponent,
    commandComponent
);

// create optional components
const musicComponent = new MusicComponent(
    youtubeService,
    activityDisplayComponent,
    messageComponent,
    loggingComponent,
    dataComponent,
    new MusicQueue(),
    bot
);

// create ELIA
const elia = new Elia(
    bot,
    dataComponent,
    loggingComponent,
    activityDisplayComponent,
    messageComponent,
    commandComponent,
    musicComponent
);

// Add the base commands
commandComponent.addCommands([
    new DeleteMessagesCommand(),
    new HelpCommand(),
    new MemeCommand(),
    new PinCommand(),
    new PingCommand(),
    new PollCommand(),
]);
loggingComponent.log("Basic commands added to Elia.");

// Add the sound effect commands
commandComponent.addCommands(
    SoundEffectComponent.getSoundEffectCommands(loggingComponent)
);
loggingComponent.log("Sound effect commands added to Elia.");

// Add the music commands
commandComponent.addCommands(
    MusicComponent.getMusicCommands(
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
