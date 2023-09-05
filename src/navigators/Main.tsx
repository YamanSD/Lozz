import React from 'react';
import { Home } from "../screens";
import { createMaterialBottomTabNavigator }
  from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from
    'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavigator = createMaterialBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  return (
    <BottomNavigator.Navigator labeled={false} barStyle={{
      height: 70
    }}>
      <BottomNavigator.Screen name="Home" component={Home} options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={21} />
        ),
      }} />
    </BottomNavigator.Navigator>
  );
};

export default MainNavigator;
