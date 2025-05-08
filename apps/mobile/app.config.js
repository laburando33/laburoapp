const path = require("path");

module.exports = {
  name: "laburando",
  slug: "laburandoappv2",
  scheme: "laburando",
  version: "1.0.0",
  orientation: "portrait",
  platforms: ["ios", "android"],
  icon: path.resolve(__dirname, "assets/icon.png"),
  userInterfaceStyle: "light",
  splash: {
    image: path.resolve(__dirname, "assets/splash.png"),
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.laburando.app"
  },
  android: {
    package: "com.laburando.app",
    intentFilters: [
      {
        action: "VIEW",
        data: {
          scheme: "laburando",
          host: "auth",
          pathPrefix: "/callback"
        },
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  extra: {
    eas: {
      projectId: "21e15a01-e72e-42d4-b0d8-f963796a7278"
    }
  },
  owner: "cattash"
};
