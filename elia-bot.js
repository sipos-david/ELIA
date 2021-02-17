const Discord = require("discord.js");
const Elia = require("./source/Elia");

let bot = new Discord.Client();
let EliaBot = new Elia(bot);

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
