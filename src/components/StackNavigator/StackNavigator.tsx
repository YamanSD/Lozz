import React from "react";
import { createStackNavigator, StackNavigationOptions } from "@react-navigation/stack";
import { ParamListBase, RouteProp } from "@react-navigation/native";

/**
 * Stack navigator for the screens
 */
const Stack = createStackNavigator();

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
 * - name: Name of the component used for navigation
 *
 * - component: to be rendered.
 *
 * - options?: stack screen options.
 */
type Screen = {
  name: string,
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
        Object.values(screens).map(options => {
          return (
            <Stack.Screen
              key={options.name}
              name={options.name}
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
