import React from 'react';
import { Home } from "../screens";
import { createMaterialBottomTabNavigator }
  from '@react-navigation/material-bottom-tabs';

const BottomNavigator = createMaterialBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  return (
    <BottomNavigator.Navigator>
      <BottomNavigator.Screen name="Home" component={Home} />
    </BottomNavigator.Navigator>
  );
};

export default MainNavigator;
