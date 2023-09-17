import React from "react";
import { StackNavigator } from "../../components";
import NavigationList from "./NavigationList";

/**
 * Stack navigation wrapper for the products screen.
 * @constructor
 */
const ProductsNavigator = () => {
  return <StackNavigator key={"ProductsNavigator"}
                         screens={NavigationList} />
}

export default ProductsNavigator;
