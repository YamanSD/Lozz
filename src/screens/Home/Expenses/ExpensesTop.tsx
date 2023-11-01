import React from "react";
import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Surface, Text } from "react-native-paper";
import { formattedNumber, Statistics } from "../../../services";

/**
 * Prop-type for the Sales slide top component.
 *
 * - statistics: total statistics block for the timescale
 *
 * - percentage: percentage of change
 */
type Properties = {
  statistics: Statistics,
};

/**
 * Top component for the total sales
 *
 * @param statistics to get data from
 * @param percentage percentage change, given by bottom component
 * @constructor
 */
const ExpensesTop = ({ statistics }: Properties) => {
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
          Total Expenses
        </Text>
      </View>

      <View style={[
        Layout.fullWidth,
        Layout.row,
        Layout.rowHCenter
      ]}>
        <Text style={{
          fontWeight: "700",
          fontSize: 35
        }}>${formattedNumber(statistics.total_expenses.data)}</Text>
      </View>
    </Surface>
  );
};

export default ExpensesTop;
