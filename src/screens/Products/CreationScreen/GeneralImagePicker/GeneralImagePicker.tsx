import React from "react";
import CollectionInfo from "../../../../CollectionInfo";
import { View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import ImagePicker from 'react-native-image-crop-picker';
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the GeneralImageSelector component.
 */
type Properties = {
  images: string[],
  setImages: React.Dispatch<React.SetStateAction<string[]>>
}

/**
 * @param setImages modifies the selected images.
 * @param images of the product
 * @constructor
 */
const GeneralImagePicker = ({ images, setImages }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  return (
    <Button mode={"outlined"} style={{
      borderRadius: 10,
        margin: 0,
        borderStyle: "dashed",
        borderColor: "rgb(190, 190, 190)"
    }} contentStyle={[Layout.center]} onPress={() => {
      ImagePicker.openPicker({
        multiple: true,
        maxFiles: CollectionInfo.product.maxImageCount,
        waitAnimationEnd: true,
        mediaType: "photo"
      }).then(newImages => {
        if (newImages.length === 0) {
          return;
        }

        // Enforce the maximum image count
        setImages(
          images.concat(newImages.map(
            img => img.path
          )).slice(
            0,
            CollectionInfo.product.maxImageCount
          )
        );
      }).catch(e => {
        if (e instanceof Error) {
          // User cancelled selection

          // check if another error has occurred.
          if (e.message !== "User cancelled image selection") {
            throw e;
          }
        }
      });
    }}>
    <View style={[
          Layout.center,
      {
        height: 150,
          paddingVertical: 10,
      }]}>
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
  );
};

export default GeneralImagePicker;
