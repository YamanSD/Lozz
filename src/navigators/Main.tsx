import React from 'react';
import { Home } from "../screens";
import { createMaterialBottomTabNavigator }
  from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from
    'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavigator = createMaterialBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  /* to ensure consistency */
  const IconGenerator = (name: string) => {
    return ({ color }: { color: string }) => (
      <MaterialCommunityIcons name={name} color={color} size={21} />
    );
  }

  return (
    <BottomNavigator.Navigator labeled={false} barStyle={{
      height: 70
    }}>
      <BottomNavigator.Screen name="Home" component={Home} options={{
        tabBarLabel: 'Home',
        tabBarIcon: IconGenerator("home"),
      }} />
    </BottomNavigator.Navigator>
  );
};

export default MainNavigator;
