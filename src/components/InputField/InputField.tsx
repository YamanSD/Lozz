import React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the InputField component
 */
type Properties = {
  autoCapitalize?: boolean,
  onChangeText: (value: string) => any,
  label: string,
  value: string,
  errorChecker: (value: string) => boolean,
  errorMessage: (value: string) => string,
  style?: StyleProp<TextStyle>,
  viewStyle?: StyleProp<ViewStyle>
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
 * @constructor
 */
const InputField = ({ autoCapitalize, onChangeText,
                      label, value, errorChecker,
                      errorMessage, style, viewStyle}: Properties) => {
  const theme = usePaperTheme();

  return (
    <View style={viewStyle}>
      <TextInput
        selectionColor={theme.colors.secondary}
        activeUnderlineColor={theme.colors.secondary}
        activeOutlineColor={theme.colors.secondary}
        textColor={theme.colors.secondary}
        autoCapitalize={autoCapitalize ? undefined : "none"}
        onChangeText={onChangeText}
        label={label}
        value={value}
        error={errorChecker(value)}
        style={style}
      />
      <HelperText
        type="error"
        visible={errorChecker(value)}
      >
        {errorMessage(value)}
      </HelperText>
    </View>
  );
};

export default InputField;
