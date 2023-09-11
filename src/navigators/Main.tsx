import React from 'react';
import { Home } from "../screens";
import { createMaterialBottomTabNavigator }
  from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from
    'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme as usePaperTheme } from "react-native-paper";

const BottomNavigator = createMaterialBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  const theme = usePaperTheme();

  /* to ensure consistency */
  const IconGenerator = (name: string) => {
    return ({ color }: { color: string }) => (
      <MaterialCommunityIcons name={name} color={color} size={21} />
    );
  }

  return (
    <BottomNavigator.Navigator labeled={false} barStyle={{
      height: 70,
      borderTopColor: theme.colors.secondary,
      borderTopWidth: 2,
    }}>
      <BottomNavigator.Screen name="Home" component={Home} options={{
        tabBarLabel: 'Home',
        tabBarIcon: IconGenerator("home"),
      }} />
    </BottomNavigator.Navigator>
  );
};

export default MainNavigator;
