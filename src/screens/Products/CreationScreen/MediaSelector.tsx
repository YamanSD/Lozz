import React from "react";
import { Surface, Text, Button } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import { View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/**
 * Prop-type for the Media selector component.
 */
type Properties = {
  setImages: React.Dispatch<React.SetStateAction<string[]>>
}

/**
 * Media selector component.
 *
 * @param setImages modifies the selected images.
 * @constructor
 */
const MediaSelector = ({ setImages }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
      }
    ]}
    elevation={4}>
      <Text style={{
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 10,
      }}>
        Media
      </Text>
      <Button mode={"outlined"} style={{
          borderRadius: 10,
          margin: 0,
          borderStyle: "dashed",
          borderColor: "rgb(190, 190, 190)"
        }} contentStyle={[Layout.center]} onPress={() => console.log("PR")}>
          <View style={[
            Layout.center,
            {
              height: 150,
              paddingVertical: 10,
            }
          ]}>
            <MaterialCommunityIcons name={'file-image-plus'}
                                    size={25}
                                    color={theme.colors.secondary}
                                    style={{ margin: 0, marginBottom: 10 }}
            />
            <Text style={{
              fontSize: 16
            }}>
              Add media
            </Text>
          </View>
      </Button>
    </Surface>
  );
};

export default MediaSelector;
