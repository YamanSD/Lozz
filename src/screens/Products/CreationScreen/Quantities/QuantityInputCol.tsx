import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import { QuantityType } from "../../../../services";
import { InputField } from "../../../../components";
import { isNaN } from "lodash";

/**
 * Prop-type for the QuantityInputCol component
 */
type Properties = {
  usp: string,
  quantities: QuantityType,
  setQuantities: React.Dispatch<React.SetStateAction<QuantityType>>,
};

/**
 * @param usp of the products
 * @param quantities of the products
 * @param setQuantities modifies the quantities
 * @constructor
 */
const QuantityInputCol = ({
                            usp, quantities,
                            setQuantities
                          }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* for the quantity */
  const [counter, setCounter] = useState(quantities[usp]);

  /* background color for the text field */
  const textFieldBackgroundColor = theme.colors.elevation["level4"];

  /* for the quantities */
  const MaxValue = 100_000;

  /* maximum length for the input */
  const MaxLength = Math.floor(Math.log10(MaxValue));

  return (
    <View style={[
      Layout.row,
      Layout.rowHCenter,
      Layout.justifyContentBetween,
      {
        width: 180
      }
    ]}>
      <TouchableOpacity style={[Layout.center]}
                        onPress={() => {
                          const actualValue = Math.max(counter - 1, 0);
                          setCounter(actualValue);
                          quantities[usp] = actualValue;
                          setQuantities({ ...quantities });
                        }}>
        <Icon name={"minus"}
              size={24}
              color={theme.colors.secondary} />
      </TouchableOpacity>
      <InputField outline={true}
                  value={counter.toString()}
                  inputMode={"numeric"}
                  onChangeText={(value: string) => {
                    if (MaxLength < value.length) {
                      return;
                    }

                    let actualValue = Number.parseInt(value);

                    if (value.length === 0) {
                      actualValue = 0;
                    }

                    if (isNaN(actualValue)
                      || actualValue < 0) {
                      return;
                    }

                    actualValue = Math.min(
                      actualValue,
                      MaxValue
                    );

                    setCounter(actualValue);
                    quantities[usp] = actualValue;
                    setQuantities({ ...quantities });
                  }}
                  outlineStyle={[
                    {
                      backgroundColor: textFieldBackgroundColor,
                      borderRadius: 50,
                      borderWidth: 0
                    }
                  ]}
                  contentStyle={{
                    fontWeight: "500",
                    fontSize: 18
                  }}
                  style={[
                    Layout.center,
                    {
                      marginBottom: 6,
                      width: 120,
                      height: 40
                    }
                  ]}
      />
      <TouchableOpacity style={[Layout.center]} onPress={() => {
        const actualValue = Math.min(counter + 1, MaxValue);
        setCounter(actualValue);
        quantities[usp] = actualValue;
        setQuantities({ ...quantities });
      }}>
        <Icon name={"plus"}
              size={24}
              color={theme.colors.secondary} />
      </TouchableOpacity>
    </View>
  );
};

export default QuantityInputCol;
