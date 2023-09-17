import Products from "./Products";
import CreationScreen from "./CreationScreen/CreationScreen";
import NavigationNames from "./NavigationNames";

export default {
  MainScreen: {
    name: NavigationNames.MainScreen,
    component: Products
  },
  CreationScreen: {
    name: NavigationNames.CreationScreen,
    component: CreationScreen
  }
};
