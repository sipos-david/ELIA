import Discord from "discord.js";
import Elia from "./Elia";
import DataComponent from "./components/core/DataComponent";
import ActivityDisplayComponent from "./components/core/ActivityDisplayComponent";
import LoggingComponent from "./components/core/LoggingComponent";
import MessageComponent from "./components/core/MessageComponent";
import CommandComponent from "./components/CommandComponent";
import MusicComponent from "./components/music/MusicComponent";
import SoundEffectComponent from "./components/SoundEffectComponent";

const bot = new Discord.Client();

// The DataComponent for ELIA
const dataComponent = new DataComponent();
// The LoggingComponent for ELIA
const loggingComponent = new LoggingComponent();
// The ActivityDisplayComponent for ELIA
const activityDisplayComponent = new ActivityDisplayComponent(
    bot,
    dataComponent
);
// The MessageComponent for ELIA
const messageComponent = new MessageComponent(
    bot,
    dataComponent,
    loggingComponent
);

const Index = new Elia(
    bot,
    dataComponent,
    loggingComponent,
    activityDisplayComponent,
    messageComponent
);

// Add function component's
Index.addComponent(new CommandComponent());
Index.addComponent(new MusicComponent());
Index.addComponent(new SoundEffectComponent());

Index.getAvailableCommands();

// on start
bot.on("ready", () => {
    Index.onReady();
});

// setup message handling
bot.on("message", (message: Discord.Message) => {
    Index.onMessage(message);
});

// bot login
bot.login(Index.getToken()).then(() => null);
