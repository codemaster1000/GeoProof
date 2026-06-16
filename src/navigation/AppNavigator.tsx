// App Navigator — Tab + Stack Navigation
// Bottom tabs: Projects | Camera | Settings

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

// Screens
import ProjectsScreen from '../screens/ProjectsScreen';
import CameraScreen from '../screens/CameraScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import PhotoDetailScreen from '../screens/PhotoDetailScreen';
import ReportScreen from '../screens/ReportScreen';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

// ─── Projects Stack ────────────────────────────────────────────────────────────
function ProjectsStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsList" component={ProjectsScreen as any} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen as any} />
      <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen as any} />
      <Stack.Screen name="Report" component={ReportScreen as any} />
    </Stack.Navigator>
  );
}

// ─── Camera Stack ──────────────────────────────────────────────────────────────
function CameraStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CameraMain" component={CameraScreen as any} />
    </Stack.Navigator>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
const TABS = [
  { name: 'ProjectsTab', icon: '📁', label: 'Projects' },
  { name: 'CameraTab', icon: '📷', label: 'Camera' },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const tab = TABS.find(t => t.name === route.name);
          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Text style={styles.tabIcon}>{tab?.icon}</Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStack}
        options={{ tabBarLabel: 'Projects' }}
      />
      <Tab.Screen
        name="CameraTab"
        component={CameraStack}
        options={{ tabBarLabel: 'Camera' }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen
          name="Projects"
          component={ProjectsScreen as any}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.surfaceBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    marginTop: -2,
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: Colors.accentGlow,
  },
  tabIcon: {
    fontSize: 20,
  },
});
