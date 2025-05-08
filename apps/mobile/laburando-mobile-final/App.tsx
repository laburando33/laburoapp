// apps/mobile/App.tsx
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { navigationRef } from "./navigationRef";
import { AuthProvider } from "./AuthProvider";

import HomeScreen from "./screens/HomeScreen";
import Dashboard from "./screens/DashboardScreen";
import InvitadoHome from "./screens/InvitadoHomeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="InvitadoHome" component={InvitadoHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
