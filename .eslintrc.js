module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:jsdoc/recommended"],
    parserOptions: {
        ecmaVersion: 12,
    },
    parser: "babel-eslint",
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
};
