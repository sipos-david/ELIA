module.exports = {
    apps: [
        {
            name: "E.L.I.A.",
            script: "./build/index.js",
            node_args: "-r dotenv/config",
        },
    ],
};
