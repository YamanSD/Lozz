import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme: typeof MD3LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    tertiary: "rgb(80, 80, 80)",
    secondary: "rgb(0, 0, 0)",
    primary: "rgb(255, 255, 255)"
  }
}

export const DarkTheme: typeof MD3DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    tertiary: "rgb(80, 80, 80)",
    primary: "rgb(0, 0, 0)",
    secondary: "rgb(255, 255, 255)"
  }
};
