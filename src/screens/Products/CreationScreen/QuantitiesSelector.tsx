import { Button, Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Category, DependencyTree, QuantityType } from "../../../services";
import { useNavigation } from "@react-navigation/native";
import NavigationNames from "../NavigationNames";

/**
 * Prop-type for the Instruction selector component.
 */
type Properties = {
  categoryId: string,
  quantities: QuantityType
};


const QuantitiesSelector = ({ categoryId, quantities }: Properties) => {
  const { Layout } = useBoilerTheme();
  const navigation = useNavigation();

  /* category of the component */
  const [category, setCategory] =
    useState<Category | undefined>(undefined);

  /* load the category */
  useEffect(() => {
    if (!DependencyTree.Categories.idSet.has(categoryId)) {
      return;
    }

    DependencyTree.Categories.get(categoryId).then(c => {
        setCategory(c);
    });
  }, [categoryId]);

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
        marginBottom: 20
      }
    ]} elevation={4}>
      <Button mode={"outlined"} onPress={() => {
        navigation.navigate(
          NavigationNames.QuantityEditorModal as never
        );
      }}>
        p
      </Button>
      <Text style={{
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 10,
      }}>
        Quantities, {category?.optionValues.map(ar => {
          return `${ar}\n`
      })}
      </Text>
    </Surface>
  );
};

export default QuantitiesSelector;
