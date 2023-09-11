import React from "react";
import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Text, Surface } from "react-native-paper";
import ChangeBadge from "./ChangeBadge";
import { formatMonetary } from "../../../services";

/**
 * Prop-type for the Sales slide top component.
 *
 * - timescale: current timescale
 */
type Properties = {
  timescale: string,
};

/**
 * Top component for the total sales
 *
 * @param timescale to get the data for
 * @constructor
 */
const SalesTop = ({ timescale }: Properties) => {
  const { Layout } = useBoilerTheme();

  return (
    <Surface style={[
      Layout.fullWidth,
      Layout.justifyContentBetween,
      {
        borderRadius: 10,
        height: 150,
        padding: 25,
      }
    ]}
    elevation={4}
    >
      <View style={[
        Layout.row,
        Layout.justifyContentBetween,
      ]}>
          <Text style={{
            fontWeight: "600",
            fontSize: 30,
          }}>
            Total Sales
          </Text>
          <ChangeBadge percentage={+0.123} />
      </View>

      <View style={[
        Layout.fullWidth,
        Layout.row,
        Layout.rowHCenter
      ]}>
        <Text style={{
          fontWeight: "700",
          fontSize: 35
        }}>${formatMonetary(123100101.123131)}</Text>
      </View>
    </Surface>
  );
};

export default SalesTop;
