import * as Linking from "expo-linking";

export const linking = {
  prefixes: ["laburando://", Linking.createURL("/")],
  config: {
    screens: {
      AuthCallback: "auth/callback",
      RegistroPaso1: "registro/paso1",
      RegistroPaso2: "registro/paso2",
      RegistroPaso3: "registro/paso3",
      Dashboard: "dashboard",
      Login: "login",
      Home: "home",
    },
  },
};
