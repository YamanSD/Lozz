import Products from "./Products";
import CreationScreen from "./CreationScreen/CreationScreen";
import NavigationNames from "./NavigationNames";
import DescriptionEditor from "./CreationScreen/DescriptionEditor";
import QuantitiesModal from "./CreationScreen/Quantities/QuantitiesModal";

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
  },
  [NavigationNames.QuantityEditorModal]: {
    component: QuantitiesModal,
    options: { presentation: 'modal' }
  }
};
