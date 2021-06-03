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

const elia = new Elia(
    bot,
    dataComponent,
    loggingComponent,
    activityDisplayComponent,
    messageComponent
);

// Add function component's
elia.addComponent(new CommandComponent());
elia.addComponent(new MusicComponent());
elia.addComponent(new SoundEffectComponent());

    elia.getAvailableCommands();

// on start
bot.on("ready", () => {
    elia.onReady();
});

// setup message handling
bot.on("message", (message: Discord.Message) => {
    elia.onMessage(message);
});

// bot login
bot.login(elia.getToken()).then(() => null);
