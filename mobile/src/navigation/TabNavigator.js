import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

import DashboardScreen from '../screens/DashboardScreen';
import CareerTwinScreen from '../screens/CareerTwinScreen';
import ResumeUploadScreen from '../screens/ResumeUploadScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CareerTwinTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'ResumeTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'SkillsTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="CareerTwinTab"
        component={CareerTwinScreen}
        options={{ tabBarLabel: 'Twin' }}
      />
      <Tab.Screen
        name="ResumeTab"
        component={ResumeUploadScreen}
        options={{ tabBarLabel: 'Resume' }}
      />
      <Tab.Screen
        name="SkillsTab"
        component={AssessmentScreen}
        options={{ tabBarLabel: 'Verify' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
