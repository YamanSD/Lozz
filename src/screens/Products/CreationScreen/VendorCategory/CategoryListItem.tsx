import React, { useEffect, useState } from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { Category, DependencyTree } from "../../../../services";
import { Surface, Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the VendorListItems
 */
type Properties = {
  categoryId: string,
};

/**
 * @param categoryId to display its data
 * @constructor
 */
const CategoryListItem = ({ categoryId }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* used when a value is undefined */
  const placeholderText = "Loading...";

  /* category of the component */
  const [category, setCategory] =
    useState<Category | undefined>(undefined);

  /* load the category */
  useEffect(() => {
    DependencyTree.Categories.get(categoryId).then(c => {
      setCategory(c);
    });
  }, []);

  /* used by text fields */
  const textStyle: StyleProp<TextStyle> = [
    {
      fontWeight: "700",
      color: theme.colors.primary,
      marginVertical: 3,
    }
  ];

  /* used by text field containers */
  const textContainerStyle: StyleProp<ViewStyle> = [
    Layout.fullWidth,
    Layout.row,
    Layout.rowHCenter,
    Layout.justifyContentBetween,
    {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      marginBottom: 8,
      paddingVertical: 4,
    }
  ];

  return (
    <Surface style={[
      Layout.fullWidth,
      {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: theme.colors.secondary,
        borderBottomColor: theme.colors.primary,
        borderBottomWidth: 3
      }
    ]} elevation={5}>
      <View style={textContainerStyle}>
        <Text style={textStyle}>
          -Name:
        </Text>
        <Text style={textStyle}>
          {category?.name ?? placeholderText}
        </Text>
      </View>
      {(category?.isDeactivated ?? false) ?
        (
          <View style={[Layout.center]}>
            <Text style={{
              fontWeight: "700",
              color: "red",
              marginVertical: 3,
              textDecorationLine: "underline"
            }}>
              Unavailable
            </Text>
          </View>
        ) : null
      }
    </Surface>
  );
}

export default CategoryListItem;
