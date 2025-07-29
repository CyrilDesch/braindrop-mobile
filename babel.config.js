module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "babel-plugin-transform-import-meta",
      ["inline-import", { "extensions": [".sql"] }],
      ["react-native-reanimated/plugin", { processNestedWorklets: true }],
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@ui': './src/core/ui',
          }
        }
      ]
    ]
  };
};
