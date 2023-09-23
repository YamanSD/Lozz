import { Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Generic } from "../../../services";

/**
 * Prop-type for the Instruction selector component.
 */
type Properties = {
  instructions: Generic<string>,
  setInstructions:  React.Dispatch<React.SetStateAction<Generic<string>>>
};


const MetaDataSelector = () => {
  const { Layout } = useBoilerTheme();

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
        marginBottom: 20,
      }
    ]} elevation={4}>
      <Text style={{
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 10,
      }}>
        Instructions
      </Text>
    </Surface>
  );
};

export default MetaDataSelector;
