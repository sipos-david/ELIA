module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    ignorePatterns: ["**/*.mp3", "**/*.md", "**/*.json"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jsdoc/recommended",
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    parser: "@typescript-eslint/parser",
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
};
