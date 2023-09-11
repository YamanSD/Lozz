import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme: typeof MD3LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    tertiary: "rgb(160, 160, 160)",
    secondary: "rgb(0, 0, 0)",
    primary: "rgb(255, 255, 255)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(255, 255, 255)",
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level2: "rgb(255, 255, 255)",
    }
  }
}

export const DarkTheme: typeof MD3DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    tertiary: "rgb(80, 80, 80)",
    primary: "rgb(0, 0, 0)",
    secondary: "rgb(255, 255, 255)",
    onPrimary: "rgb(0, 0, 0)",
    primaryContainer: "rgb(0, 0, 0)",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level2: "rgb(0, 0, 0)",
    }
  }
};
