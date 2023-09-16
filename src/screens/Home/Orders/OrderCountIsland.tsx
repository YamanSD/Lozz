import React from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Surface, Text } from "react-native-paper";
import { ScreenDimensions } from "../../../theme/Variables";
import { StyleProp, TextStyle } from "react-native";

/**
 * Prop-type for the OrderCountIsland
 */
type Properties = {
  color: string,
  label: string,
  count: number,
  noShrink?: boolean
};

/**
 * @param color border color of the island
 * @param label label of the island
 * @param count count of the status in the island
 * @param noShrink if true, the bar occupies the max length
 * @constructor
 */
const OrderCountIsland = ({ color, label, count, noShrink }: Properties) => {
  const { Layout } = useBoilerTheme();

  const dimension = noShrink
    ? (ScreenDimensions.width - 20)
    : (ScreenDimensions.width - 40) / 2;
  const textStyle: StyleProp<TextStyle> = {
    fontWeight: "bold",
    fontSize: 24
  };

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        marginHorizontal: 10,
        padding: 15,
        borderColor: color,
        borderWidth: 2,
        width: dimension,
        height: 150,
        borderRadius: 15
      }
    ]}>
      <Text style={textStyle}>{label}</Text>
      <Text style={textStyle}>{count}</Text>
    </Surface>
  );
};

export default OrderCountIsland;
