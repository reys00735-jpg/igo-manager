import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import Welcome from './src/screens/auth/Welcome';
import Login from './src/screens/auth/Login';
import RegisterStep1 from './src/screens/auth/RegisterStep1';
import RegisterStep2 from './src/screens/auth/RegisterStep2';
import Home from './src/screens/Home';
import CreateInitiative from './src/screens/CreateInitiative';
import Prioritization from './src/screens/Prioritization';
import Quadrants from './src/screens/Quadrants';
import ActionPlan from './src/screens/ActionPlan';
import { getSupabaseSession, hasSupabaseConfig, setDemoSession, supabase } from './src/lib/supabase';
import { requestNotificationPermissions } from './src/lib/NotificationHandler';
import Graficos from './src/screens/Graficos';
const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      await requestNotificationPermissions();

      if (!hasSupabaseConfig()) {
        const demoSession = await setDemoSession();
        setSession(demoSession);
        setLoading(false);
        return;
      }

      const session = await getSupabaseSession();
      setSession(session);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, nextSession: any) => {
        setSession(nextSession);
      });
      return () => subscription.unsubscribe();
    };

    init();
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#2458C5" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="CreateInitiative" component={CreateInitiative} />
            <Stack.Screen name="Prioritization" component={Prioritization} />
            <Stack.Screen name="Quadrants" component={Quadrants} />
            <Stack.Screen name="ActionPlan" component={ActionPlan} />
            <Stack.Screen name="Graficos" component={Graficos} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="RegisterStep1" component={RegisterStep1} />
            <Stack.Screen name="RegisterStep2" component={RegisterStep2} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
