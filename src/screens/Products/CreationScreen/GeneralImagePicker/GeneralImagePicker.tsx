import React, { useEffect, useRef, useState } from "react";
import CollectionInfo from "../../../../CollectionInfo";
import { FlatList, Image, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Text, useTheme as usePaperTheme } from "react-native-paper";
import ImagePicker from "react-native-image-crop-picker";
import { useTheme as useBoilerTheme } from "../../../../hooks";

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

  // Width for preview images
  const elementWidth = 160;

  // Total height for the list
  const elementHeight = 180;

  // Used to set the width for images button selector
  const [btnWidth, setBtnWidth] = useState<undefined | number>(undefined);

  const btn = useRef(
    <Button
      mode={"outlined"}
      style={{
        width: btnWidth,
        borderRadius: 10,
        margin: 0,
        borderStyle: "dashed",
        borderColor: "rgb(190, 190, 190)"
      }}
      contentStyle={[Layout.center]}
      onPress={() => {
        ImagePicker.openPicker({
          multiple: true,
          maxFiles: CollectionInfo.product.maxImageCount,
          waitAnimationEnd: true,
          mediaType: "photo"
        }).then(newImages => {
          if (newImages.length === 0) {
            return;
          }

          setImages(
            newImages.map(
              img => img.path
            ).slice( // Enforce the maximum image count for android
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
          paddingVertical: 10
        }]}>
        <MaterialCommunityIcons name={"file-image-plus"}
                                size={25}
                                color={theme.colors.secondary}
                                style={{ margin: 0, marginBottom: 10 }}
        />
        <Text style={{
          fontSize: 16
        }}>
          Edit media
        </Text>
      </View>
    </Button>
  );

  useEffect(() => {
    if (images.length !== 0) {
      setBtnWidth(elementWidth);
    }
  }, [images]);

  return (
    btnWidth ?
      (
        <FlatList
          contentContainerStyle={{
            alignContent: "center",
            alignItems: "center",
            height: elementHeight
          }}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            return (
              <View style={{
                width: 1,
                backgroundColor: "transparent",
                marginHorizontal: 10
              }}>
              </View>
            );
          }}
          horizontal={true}
          data={images}
          renderItem={({ item }) => {
            return (
              <Image
                source={{
                  uri: item,
                  width: elementWidth,
                  height: elementHeight - 10
                }}
                style={{
                  borderRadius: 10
                }}
              />
            );
          }}
          ListHeaderComponentStyle={{
            marginRight: 20
          }}
          ListHeaderComponent={btn.current}
        />
      ) : btn.current
  );
};

export default GeneralImagePicker;
