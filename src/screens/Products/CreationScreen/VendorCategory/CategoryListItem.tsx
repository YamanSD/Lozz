import React, { useEffect, useState } from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { Category, DependencyTree } from "../../../../services";
import { Surface, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../../hooks";

/**
 * Prop-type for the VendorListItems
 */
type Properties = {
  categoryId: string,
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>
};

/**
 * @param categoryId to display its data
 * @param setIsValid modifies the validity of the category
 * @constructor
 */
const CategoryListItem = ({ categoryId, setIsValid }: Properties) => {
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
      if (c.isDeactivated) {
        setIsValid(false);
      } else {
        setIsValid(true);
        setCategory(c);
      }
    });
  }, [categoryId]);

  /* used by text fields */
  const textStyle: StyleProp<TextStyle> = [
    {
      fontWeight: "700",
      color: theme.colors.primary,
      marginVertical: 3
    }
  ];

  /* used by text field containers */
  const textContainerStyle: StyleProp<ViewStyle> = [
    Layout.fullWidth,
    Layout.row,
    Layout.rowHCenter,
    Layout.justifyContentBetween,
    {
      paddingVertical: 4
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
};

export default CategoryListItem;
