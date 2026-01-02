import { Tabs } from 'expo-router';
import { Car, Droplet, Home, MapPin, Sparkles, Wrench } from 'lucide-react-native';
import { Platform, View } from 'react-native';

// ⚠️ ATENÇÃO AQUI: Esse caminho "../.." sobe duas pastas.
// Ele sai de "(tabs)", sai de "app" e procura "src" na raiz do projeto.
import { colors } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: colors.headerBg,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          fontFamily: 'Inter-Regular', // Fonte consistente entre iOS e Android
        },
      }}
    >
      <Tabs.Screen
        name="vehicle"
        options={{
          title: 'Meu Carro',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
                backgroundColor: focused ? colors.rosaClaro : 'transparent', 
                padding: 8, 
                borderRadius: 20,
                shadowColor: focused ? colors.rosaClaro : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: focused ? 4 : 0
            }}>
                <Car size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="fuel"
        options={{
          title: 'Combustível',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
                backgroundColor: focused ? colors.rosaClaro : 'transparent', 
                padding: 8, 
                borderRadius: 20,
                shadowColor: focused ? colors.rosaClaro : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: focused ? 4 : 0
            }}>
                <Droplet size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
                backgroundColor: focused ? colors.rosaClaro : 'transparent', 
                padding: focused ? 12 : 8, 
                borderRadius: 24,
                shadowColor: focused ? colors.rosaClaro : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: focused ? 8 : 0,
                borderWidth: focused ? 3 : 0,
                borderColor: 'white'
            }}>
                <Sparkles size={focused ? 26 : 22} color={color} strokeWidth={focused ? 3 : 2.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
                backgroundColor: focused ? colors.rosaClaro : 'transparent', 
                padding: 8, 
                borderRadius: 20,
                shadowColor: focused ? colors.rosaClaro : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: focused ? 4 : 0
            }}>
                <Wrench size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="workshops"
        options={{
          title: 'Oficinas',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
                backgroundColor: focused ? colors.rosaClaro : 'transparent', 
                padding: 8, 
                borderRadius: 20,
                shadowColor: focused ? colors.rosaClaro : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: focused ? 4 : 0
            }}>
                <MapPin size={22} color={color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}