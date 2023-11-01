import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Text } from "react-native-paper";

/**
 * Prop-type for the GraphLabel component.
 *
 * - color: Color of the label.
 *
 * - label: Text to be displayed in the label.
 */
type Properties = {
  color: string,
  label: string
}

/**
 * @param color
 * @param label
 * @constructor
 */
const GraphLabel = ({ color, label }: Properties) => {
  const { Layout } = useBoilerTheme();

  return (
    <View style={[
      Layout.row,
      Layout.rowHCenter,
      { width: 100 }
    ]}>
      <View style={{
        height: 10,
        width: 10,
        borderRadius: 10,
        backgroundColor: color,
        marginRight: 10
      }} />
      <Text style={{
        fontWeight: "bold"
      }}>{label}</Text>
    </View>
  );
};

export default GraphLabel;

