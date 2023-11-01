import React from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import { toTitle } from "../../../../services";

/**
 * Prop-type for the CategoryOptions display
 */
type Properties = {
  optionKey: string,
  optionValues: string[]
};

/**
 * @param optionKey to display its values
 * @param optionValues the values linked to the key
 * @constructor
 */
const CategoryOptionRow = ({ optionKey, optionValues }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* style for option value boxes */
  const boxStyle: StyleProp<ViewStyle> = [
    Layout.center,
    {
      backgroundColor: theme.colors.primary,
      height: 30,
      borderColor: theme.colors.secondary,
      marginRight: 10,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 15
    }
  ];

  return (
    <View key={optionKey} style={{
      marginTop: 15,
      borderTopColor: theme.colors.secondary,
      borderTopWidth: 1,
      paddingTop: 10
    }}>
      <Text style={{
        fontWeight: "400",
        fontSize: 18,
        marginBottom: 7
      }}>
        {toTitle(optionKey)}
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {
          optionValues.map(value => {
            return (
              <View key={optionKey + value} style={boxStyle}>
                <Text style={{
                  fontWeight: "600",
                  fontSize: 15
                }}>
                  {value}
                </Text>
              </View>
            );
          })
        }
      </ScrollView>
    </View>
  );
};

export default CategoryOptionRow;
