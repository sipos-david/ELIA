module.exports = {
    apps: [
        {
            name: "elia",
            script: "./build/index.js",
            node_args: "-r dotenv/config",
        },
    ],
};
