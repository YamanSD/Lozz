import Products from "./Products";
import CreationScreen from "./CreationScreen/CreationScreen";
import NavigationNames from "./NavigationNames";
import DescriptionEditor from "./CreationScreen/DescriptionEditor";

export default {
  [NavigationNames.MainScreen]: {
    component: Products
  },
  [NavigationNames.CreationScreen]: {
    component: CreationScreen
  },
  [NavigationNames.DescriptionEditorModal]: {
    component: DescriptionEditor,
    options: { presentation: 'modal' }
  }
};
