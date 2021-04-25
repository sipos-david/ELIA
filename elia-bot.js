const Discord = require("discord.js");
const Elia = require("./source/Elia");
const DataComponent = require("./source/components/core/DataComponent");
const ActivityDisplayComponent = require("./source/components/core/ActivityDisplayComponent");
const LoggingComponent = require("./source/components/core/LoggingComponent");
const MessageComponent = require("./source/components/core/MessageComponent");
const CommandComponent = require("./source/components/CommandComponent");
const MusicComponent = require("./source/components/music/MusicComponent");
const SoundEffectComponent = require("./source/components/SoundEffectComponent");

let bot = new Discord.Client();

// The DataComponent for ELIA
let dataComponent = new DataComponent();
// The LoggingComponent for ELIA
let loggingComponent = new LoggingComponent();
// The ActivityDisplayComponent for ELIA
let activityDisplayComponent = new ActivityDisplayComponent(bot, dataComponent);
// The MessageComponent for ELIA
let messageComponent = new MessageComponent(
    bot,
    dataComponent,
    loggingComponent
);

let EliaBot = new Elia(
    bot,
    dataComponent,
    loggingComponent,
    activityDisplayComponent,
    messageComponent
);

// Add function component's
EliaBot.addComponent(new CommandComponent());
EliaBot.addComponent(new MusicComponent());
EliaBot.addComponent(new SoundEffectComponent());

EliaBot.getAvaliableCommands();

// on start
bot.on("ready", () => {
    EliaBot.onReady();
});

// setup message handling
bot.on("message", (message) => {
    EliaBot.onMessage(message);
});

// bot login
bot.login(EliaBot.getToken()).then((_r) => null);
