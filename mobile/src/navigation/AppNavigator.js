import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ServerConfigScreen from '../screens/ServerConfigScreen';

import TabNavigator from './TabNavigator';
import CareerGoalScreen from '../screens/CareerGoalScreen';
import AtsAnalysisScreen from '../screens/AtsAnalysisScreen';
import CodingProfilesScreen from '../screens/CodingProfilesScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AssessmentResultScreen from '../screens/AssessmentResultScreen';
import SkillGapScreen from '../screens/SkillGapScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ProgressReportsScreen from '../screens/ProgressReportsScreen';
import AIGuidanceScreen from '../screens/AIGuidanceScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Connecting to CareerTwin..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />
        </>
      ) : (
        // Main Authenticated Stack
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="CareerGoal" component={CareerGoalScreen} />
          <Stack.Screen name="AtsAnalysis" component={AtsAnalysisScreen} />
          <Stack.Screen name="CodingProfiles" component={CodingProfilesScreen} />
          <Stack.Screen name="Assessment" component={AssessmentScreen} />
          <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} />
          <Stack.Screen name="SkillGaps" component={SkillGapScreen} />
          <Stack.Screen name="Roadmap" component={RoadmapScreen} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
          <Stack.Screen name="Challenges" component={ChallengesScreen} />
          <Stack.Screen name="Reports" component={ProgressReportsScreen} />
          <Stack.Screen name="AIGuidance" component={AIGuidanceScreen} />
          <Stack.Screen name="ServerConfig" component={ServerConfigScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
