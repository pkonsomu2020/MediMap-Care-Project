// App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Import your screens
import Landing from "./src/pages/Landing";
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";
import DashboardLayout from "./src/compontents/dashboard/DashboardLayout";
import FindClinics from "./src/pages/dashboard/FindClinics";
import Appointments from "./src/pages/dashboard/Appointments";
import Directory from "./src/pages/dashboard/Directory";
import Reviews from "./src/pages/dashboard/Reviews";
import Profile from "./src/pages/dashboard/Profile";
import NotFound from "./src/pages/NotFound";

const queryClient = new QueryClient();
const Stack = createStackNavigator();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "bottom"]}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Landing">
              <Stack.Screen
                name="Landing"
                component={Landing}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Dashboard"
                component={DashboardLayout}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="FindClinics" component={FindClinics} />
              <Stack.Screen name="Appointments" component={Appointments} />
              <Stack.Screen name="Directory" component={Directory} />
              <Stack.Screen name="Reviews" component={Reviews} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
          </NavigationContainer>

          {/* Toast notifications */}
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
