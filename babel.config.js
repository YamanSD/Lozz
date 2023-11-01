/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "@babel/plugin-transform-export-namespace-from",
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".js", ".json"],
        alias: {
          "@": "./src",
          types: "./@types",
        },
      },
    ],
    "inline-dotenv",
    "react-native-reanimated/plugin", // needs to be last
  ],
};
