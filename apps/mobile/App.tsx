import "react-native-url-polyfill/auto";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { navigationRef } from "./navigationRef";
import { AuthProvider } from "./lib/AuthProvider";
import { linking } from "./linking";

// Screens
import HomeScreen from "./screens/HomeScreen";
import RegistroPaso1Screen from "./screens/RegistroPaso1Screen";
import RegistroPaso2Screen from "./screens/RegistroPaso2Screen";
import RegistroPaso3Screen from "./screens/RegistroPaso3Screen";
import DashboardScreen from "./screens/DashboardScreen";
import InvitadoHomeScreen from "./screens/InvitadoHomeScreen";
import LoginScreen from "./screens/LoginScreen";
import AuthCallbackScreen from "./screens/AuthCallbackScreen";
import TestDeepLinkScreen from "./screens/TestDeepLinkScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <AuthProvider />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="TestDeepLink" component={TestDeepLinkScreen} />
          <Stack.Screen name="RegistroPaso1" component={RegistroPaso1Screen} />
          <Stack.Screen name="RegistroPaso2" component={RegistroPaso2Screen} />
          <Stack.Screen name="RegistroPaso3" component={RegistroPaso3Screen} />
          <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="InvitadoHome" component={InvitadoHomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
