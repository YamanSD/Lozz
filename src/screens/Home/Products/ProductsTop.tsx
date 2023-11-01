import React from "react";
import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Surface, Text } from "react-native-paper";
import ChangeBadge from "../ChangeBadge";
import { formattedNumber, Statistics } from "../../../services";

/**
 * Prop-type for the Products slide top component.
 *
 * - statistics: total statistics block for the timescale
 *
 * - percentage: percentage of change
 */
type Properties = {
  statistics: Statistics,
  percentage: number
};

/**
 * Top component for the total products
 *
 * @param statistics to get data from
 * @param percentage percentage change, given by bottom component
 * @constructor
 */
const ProductsTop = ({ statistics, percentage }: Properties) => {
  const { Layout } = useBoilerTheme();

  return (
    <Surface style={[
      Layout.fullWidth,
      Layout.justifyContentBetween,
      {
        borderRadius: 10,
        height: 150,
        padding: 25
      }
    ]}
             elevation={4}
    >
      <View style={[
        Layout.row,
        Layout.justifyContentBetween
      ]}>
        <Text style={{
          fontWeight: "600",
          fontSize: 30
        }}>
          Sold Products
        </Text>
        <ChangeBadge percentage={percentage} />
      </View>

      <View style={[
        Layout.fullWidth,
        Layout.row,
        Layout.rowHCenter
      ]}>
        <Text style={{
          fontWeight: "700",
          fontSize: 35
        }}>{formattedNumber(statistics.sold_products, true)}</Text>
      </View>
    </Surface>
  );
};

export default ProductsTop;
