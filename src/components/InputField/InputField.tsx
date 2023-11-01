import React from "react";
import { InputModeOptions, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { HelperText, TextInput, useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the InputField component
 */
type Properties = {
  autoCapitalize?: boolean,
  onChangeText: (value: any) => any,
  label?: string,
  value: any,
  errorChecker?: (value: any) => boolean,
  errorMessage?: (value: any) => string,
  style?: StyleProp<TextStyle>,
  viewStyle?: StyleProp<ViewStyle>,
  inputMode?: InputModeOptions,
  outlineStyle?: StyleProp<ViewStyle>,
  contentStyle?: StyleProp<TextStyle>,
  formatValue?: (value: any) => any,
  unpackValue?: (value: string) => any,
  outline?: boolean
  multiline?: boolean
};

/**
 *
 * @param autoCapitalize if true, no auto capitalization
 * @param onChangeText triggered when the value is changed
 * @param label placeholder when the field is empty
 * @param value state variable to display change
 * @param errorChecker takes the variable returns true
 *        if the variable is valid, otherwise false.
 * @param errorMessage takes the variable returns an
 *        error message
 * @param style styling for the textInput component
 * @param viewStyle styling view wrapper
 * @param inputMode of the input field
 * @param formatValue takes the value, returns a formatted string,
 *        if not provided, the value is returns by itself.
 * @param unpackValue takes the formatted value, returns the actual value.
 *        Must be provided if format value is provided.
 *        If it returns undefined, the value does not change.
 * @param outline if true, the inputField is outlined.
 * @param multiline if true, the inputField is multiline.
 * @param outlineStyle for the InputField
 * @param contentStyle for the InputField
 * @constructor
 */
const InputField = ({
                      autoCapitalize, onChangeText, contentStyle,
                      label, value, errorChecker,
                      errorMessage, style, viewStyle,
                      inputMode, formatValue, unpackValue,
                      outline, multiline, outlineStyle
                    }: Properties) => {
  const theme = usePaperTheme();

  if (formatValue === undefined) {
    formatValue = (value: any) => {
      return value;
    };
  } else if (unpackValue === undefined) {
    throw new Error("Invalid formatting of InputField, must add unpacking");
  }

  if (unpackValue === undefined) {
    unpackValue = (value: string) => {
      return value;
    };
  }

  if (errorChecker === undefined) {
    errorChecker = (ignored) => {
      return false;
    };
  }

  return (
    <View style={viewStyle}>
      <TextInput
        outlineStyle={outlineStyle}
        contentStyle={contentStyle}
        mode={outline ? "outlined" : "flat"}
        multiline={multiline}
        selectionColor={theme.colors.secondary}
        activeUnderlineColor={theme.colors.secondary}
        activeOutlineColor={theme.colors.secondary}
        textColor={theme.colors.secondary}
        autoCapitalize={autoCapitalize ? undefined : "none"}
        onChangeText={(value) => {
          if (unpackValue !== undefined) {
            const result = unpackValue(value);

            if (result !== undefined) {
              onChangeText(result);
            }
          }
        }}
        label={label}
        value={formatValue(value)}
        error={errorChecker(value)}
        style={style}
        inputMode={inputMode}
      />
      {errorMessage !== undefined
        ? (
          <HelperText
            type="error"
            visible={errorChecker(value)}>
            {errorMessage(value)}
          </HelperText>
        )
        : null
      }
    </View>
  );
};

export default InputField;
