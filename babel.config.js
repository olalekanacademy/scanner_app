module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["react-native-worklets-core/plugin"],
      // Required for expo-router
      "expo-router/babel",
      "nativewind/babel",
      "react-native-reanimated/plugin"
    ],
    env: {
      production: {
        plugins: []
      }
    }
  }
}
