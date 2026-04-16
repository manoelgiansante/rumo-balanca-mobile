import { Tabs } from 'expo-router';
import { Database, Scale, Settings } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

const TAB_TOKENS = {
  activeColor: Colors.primary,
  inactiveColor: Colors.muted,
  iconSize: 22,
  labelSize: 11,
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_TOKENS.activeColor,
        tabBarInactiveTintColor: TAB_TOKENS.inactiveColor,
        tabBarLabelStyle: {
          fontFamily: Typography.bodyMedium,
          fontSize: TAB_TOKENS.labelSize,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border,
          height: Platform.select({ ios: 88, android: 60, default: 64 }),
          paddingBottom: Platform.select({ ios: 28, android: 4, default: 8 }),
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 12 },
            default: {},
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pesagens',
          tabBarIcon: ({ color }) => (
            <Scale size={TAB_TOKENS.iconSize} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="cadastros"
        options={{
          title: 'Cadastros',
          tabBarIcon: ({ color }) => (
            <Database size={TAB_TOKENS.iconSize} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => (
            <Settings size={TAB_TOKENS.iconSize} color={color} strokeWidth={1.75} />
          ),
        }}
      />
    </Tabs>
  );
}
