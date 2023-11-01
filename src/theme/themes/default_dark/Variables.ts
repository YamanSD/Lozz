import { ThemeNavigationColors } from "../../../../@types/theme";

export const Colors = {
  primary: "#7454a5",
  textGray800: "#E0E0E0",
  textGray400: "#969696",
  textGray200: "#BABABA",
  inputBackground: "#3a3a3a",
  circleButtonBackground: "#252732"
};

export const NavigationColors: Partial<ThemeNavigationColors> = {
  primary: Colors.primary,
  background: "#000",
  card: "#000"
};

export default {
  Colors,
  NavigationColors
};
