import { Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Generic } from "../../../services";
import InstructionsForm from "./Instructions/InstructionsForm";

/**
 * Prop-type for the Instruction selector component.
 */
type Properties = {
  instructions: Generic<string>,
  setInstructions:  React.Dispatch<React.SetStateAction<Generic<string>>>
};

/**
 * - title: Title of the instruction.
 * - description: Description or body of the instruction.
 */
type InstructionsList = {
  title: string,
  description: string
}[];

/**
 * @param instructions of the product
 * @param setInstructions modifies the instructions
 * @constructor
 */
const InstructionSelector = ({ instructions,
                               setInstructions }: Properties) => {
  const { Layout } = useBoilerTheme();

  /* instructions array data */
  const [data, setData] = useState<InstructionsList>([]);

  /* when the data changes, modify the instructions object */
  useEffect(() => {
    let result: Generic<string> = {};

    data.forEach((item) => {
      result[item.title] = item.description
    });

    setInstructions(result);
  }, [data]);

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
      <InstructionsForm setData={setData} />
    </Surface>
  );
};

export default InstructionSelector;
