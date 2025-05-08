import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AuthCallbackScreen from "../screens/AuthCallbackScreen";
import RegistroPaso1 from "../screens/registro/Paso1Screen";
import RegistroPaso2 from "../screens/registro/Paso2Screen";
import RegistroPaso3 from "../screens/registro/Paso3Screen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="RegistroPaso1" component={RegistroPaso1} />
      <Stack.Screen name="RegistroPaso2" component={RegistroPaso2} />
      <Stack.Screen name="RegistroPaso3" component={RegistroPaso3} />
    </Stack.Navigator>
  );
}
