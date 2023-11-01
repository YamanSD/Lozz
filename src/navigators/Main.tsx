import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme as usePaperTheme } from "react-native-paper";
import { Details, Home, Orders, Products } from "../screens";

const BottomNavigator = createMaterialBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  const theme = usePaperTheme();

  /* to ensure consistency */
  const IconGenerator = (name: string, ionic?: boolean) => {
    return ({ color }: { color: string }) => (
      ionic
        ? <Ionicons name={name} color={color} size={19} />
        : <MaterialCommunityIcons name={name} color={color} size={21} />
    );
  };

  return (
    <BottomNavigator.Navigator labeled={false} barStyle={{
      height: 70,
      borderTopColor: theme.colors.secondary,
      borderTopWidth: 2
    }}>
      <BottomNavigator.Screen name="Home" component={Home} options={{
        tabBarLabel: "Home",
        tabBarIcon: IconGenerator("home")
      }} />

      <BottomNavigator.Screen name="Orders" component={Orders} options={{
        tabBarLabel: "Orders",
        tabBarIcon: IconGenerator("inbox-arrow-down")
      }} />

      <BottomNavigator.Screen name="Products" component={Products} options={{
        tabBarLabel: "Products",
        tabBarIcon: IconGenerator("pricetag", true)
      }} />

      <BottomNavigator.Screen name="Settings" component={Details} options={{
        tabBarLabel: "Details",
        tabBarIcon: IconGenerator("dots-horizontal")
      }} />
    </BottomNavigator.Navigator>
  );
};

export default MainNavigator;
