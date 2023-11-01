import React from "react";
import { View } from "react-native";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

/**
 * Prop-type for the InstructionsWrapper component
 */
type Properties = {
  children: any,
  onPress: () => void
}

/**
 * Currently not that customizable.
 *
 * @param children to be rendered.
 * @param onPress toggled when the icon is pressed.
 * @constructor
 */
const InstructionsWrapper = ({ children, onPress }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  return (
    <View style={[
      Layout.justifyContentBetween,
      Layout.row,
      Layout.rowHCenter,
      Layout.fullWidth,
      {
        borderBottomColor: theme.colors.secondary,
        borderBottomWidth: 1,
        borderTopColor: theme.colors.secondary,
        borderTopWidth: 1,
        paddingVertical: 20,
        paddingHorizontal: 5
      }
    ]}>
      <View style={{
        width: "90%"
      }}>
        {children}
      </View>

      {/* delete icon */}
      <Icon name={"delete-forever"}
            color={theme.colors.secondary}
            onPress={onPress}
            size={35}
            style={{
              margin: 0,
              padding: 0
            }}
      />
    </View>
  );
};

export default InstructionsWrapper;
