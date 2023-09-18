import React, { useState } from "react";
import Animated from "react-native-reanimated";
import { Appbar, Button, TextInput } from "react-native-paper";
import { useTheme as usePaperTheme } from "react-native-paper";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import NavigationNames from "../NavigationNames";


/**
 * Prop-type for the DescriptionEditor
 */
type Properties = {
  description?: string
}

/**
 * Used to edit the description of a product.
 * Props passed from route.
 * @constructor
 */
const DescriptionEditor = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const props: Properties = route.params as any;
  const description = props.description ?? "";

  const theme = usePaperTheme();
  const [desc, setDesc] = useState<string>(description);

  const edited = () => {
    return desc.length !== 0 || desc !== description;
  }

  return (
    <Animated.View>
      <Appbar mode={"center-aligned"}>
        {
          edited() ?
            <Button
              textColor={theme.colors.secondary}
              labelStyle={{
                fontSize: 16
              }}
              onPress={navigation.goBack}>
              Cancel
            </Button> :
            <Appbar.BackAction onPress={navigation.goBack} />
        }
        <Appbar.Content title={"Description"} />
        {
          edited() ?
            <Button
              textColor={theme.colors.secondary}
              labelStyle={{
                fontSize: 16
              }}
              onPress={() => {
                navigation.navigate(
                  NavigationNames.CreationScreen as never,
                  {
                    description: desc
                  } as never
                );
              }}>
              Save
            </Button> :
            null
        }
      </Appbar>
      <View style={{ paddingTop: 0, padding: 20 }}>
        <TextInput multiline={true}
                   style={{
                     backgroundColor: theme.colors.primary,
                   }}
                   underlineStyle={{
                     borderWidth: 2,
                   }}
                   underlineColor={theme.colors.secondary}
                   selectionColor={theme.colors.secondary}
                   onChangeText={setDesc}
                   value={desc}
                   textColor={theme.colors.secondary} />
      </View>
    </Animated.View>
  )
};

export default DescriptionEditor;
