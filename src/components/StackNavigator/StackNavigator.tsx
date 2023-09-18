import React from "react";
import { StackNavigationOptions } from "@react-navigation/stack";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/**
 * Stack navigator for the screens
 */
const Stack = createNativeStackNavigator();

/* type for ScreenOptions props */
type ScreenOptionsType =
  StackNavigationOptions
  | ((props: {
    route: RouteProp<ParamListBase, string>,
    navigation: any
  }) => StackNavigationOptions)

/**
 * Screen type used to input screen names and their component.
 *
 * - component: to be rendered.
 *
 * - options?: stack screen options.
 */
type Screen = {
  component?: any,
  options?: ScreenOptionsType
}

/**
 * Prop-type for the stack navigator.
 */
type Properties = {
  screens: {
    [id: string]: Screen
  },
  screenOptions?: ScreenOptionsType,
  initialRouteName?: string,
  id?: string,
}

/**
 * @param screens to be placed in a stack
 * @param screenOptions screenOptions for the entire navigator.
 *        By default, the header is not shown.
 * @param initialRouteName initial route of the stack
 * @param id ID of the stack
 * @constructor
 */
const StackNavigator = ({ screens, screenOptions,
                          initialRouteName, id }: Properties) => {
  screenOptions = screenOptions ?? { headerShown: false };

  return (
    <Stack.Navigator id={id}
                     screenOptions={screenOptions}
                     initialRouteName={initialRouteName}>
      {
        Object.keys(screens).map(name => {
          const options = screens[name];

          return (
            <Stack.Screen
              key={name}
              name={name}
              component={options.component}
              options={options.options}
            />
          );
        })
      }
    </Stack.Navigator>
  );
}

export default StackNavigator;
