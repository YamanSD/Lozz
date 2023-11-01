import { Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { QuantityType } from "../../../services";
import { useNavigation } from "@react-navigation/native";
import NavigationNames from "../NavigationNames";
import { sum } from "lodash";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

/**
 * Prop-type for the Instruction selector component.
 */
type Properties = {
  quantities: QuantityType
};

/**
 * @param quantities of the product (display & inventory)
 * @constructor
 */
const QuantitiesSelector = ({ quantities }: Properties) => {
  const { Layout } = useBoilerTheme();
  const navigation = useNavigation();

  /* total selected quantities */
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(sum(Object.values(quantities)));
  }, [quantities]);

  /**
   * Used by description bar.
   */
  const onClick = () => {
    navigation.navigate(
      NavigationNames.QuantityEditorModal as never,
      {
        quantities: quantities
      } as never
    );
  };

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25
      }
    ]} elevation={4}>
      <Text style={{
        fontWeight: "600",
        fontSize: 22,
        marginBottom: 15
      }}>
        Inventory
      </Text>
      {/* quantities editor */}
      <TouchableOpacity style={[
        Layout.fullWidth,
        Layout.justifyContentBetween,
        Layout.rowHCenter,
        Layout.row,
        {
          paddingLeft: 5
        }
      ]} onPress={onClick}>
        <Text style={{
          fontWeight: "500",
          fontSize: 17
        }}>
          {total} available
        </Text>
        <Icon name={"chevron-right"} size={22} />
      </TouchableOpacity>
    </Surface>
  );
};

export default QuantitiesSelector;
