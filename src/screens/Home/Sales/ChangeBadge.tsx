import React from "react";
import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";


/**
 * Prop-type for the change percentage badge.
 *
 * - percentage: percentage value
 */
type Properties = {
  percentage: number
};

/**
 * Indicates if the change is good (green) or bad (red),
 * based on percentage.
 *
 * @param percentage of change
 * @constructor
 */
const ChangeBadge = ({ percentage }: Properties) => {
  const { Layout } = useBoilerTheme();

  const backgroundColor = percentage > 0
    ? "#228B22"
    : (percentage < 0
      ? "#8B0000"
      : "#777777"
    );

  const textColor = percentage === 0 ? "black" : "white";

  return (
    <View style={[
      Layout.justifyContentBetween,
      Layout.row,
      Layout.rowHCenter,
      {
      paddingHorizontal: 5,
      borderRadius: 10,
      height: 28,
      width: 100,
      backgroundColor: backgroundColor
    }]}>
      <Text style={{
        fontWeight: "800",
        fontSize: 13,
        color: textColor,
      }}>
        % {percentage < 0 ? '-' : '+'}
        {(100 * Math.abs(percentage)).toFixed(2)}
      </Text>
      <Icon name={percentage < 0
        ? "trending-down"
        : (percentage > 0
          ? "trending-up"
          : "trending-neutral")}
            size={20}
            color={textColor} />
    </View>
  );
};

export default ChangeBadge;
