import { Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { countOptions, Generic } from "../../../services";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import NavigationNames from "../NavigationNames";
import { useNavigation } from "@react-navigation/native";
import { useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the image specifier component.
 */
type Properties = {
  uspList: string[],
  images: string[],
  imagesMap: Generic<string[]>,
  setImagesMap: React.Dispatch<React.SetStateAction<Generic<string[]>>>
};

/**
 * @param uspList list of USPs in the category.
 * @param images list of available image URLs.
 * @param imagesMap maps a USP to its images.
 * @param setImagesMap modifies the imagesMap.
 * @constructor
 */
const ImageSpecifier = ({ uspList, images,
                          imagesMap, setImagesMap }: Properties) => {
  const { Layout } = useBoilerTheme();
  const navigation = useNavigation();
  const theme = usePaperTheme();

  /**
   * Used by description bar.
   */
  const onClick = () => {
    navigation.navigate(
      NavigationNames.ImagesSpecifierModal as never,
      {
        imagesMap: imagesMap
      } as never
    );
  };

  /* number of options */
  const [optionsCount, setOptionsCount] = useState(0);

  /* modify the count of the options */
  useEffect(() => {
    if (uspList.length > 0) {
      setOptionsCount(countOptions(uspList[0]));
    }
  }, [uspList]);

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
        fontSize: 22,
        marginBottom: 15,
      }}>
        Specify Media
      </Text>
      {/* images specifier */}
      <TouchableOpacity style={[
        Layout.fullWidth,
        Layout.justifyContentBetween,
        Layout.rowHCenter,
        Layout.row,
        {
          paddingLeft: 5,
        }
      ]} onPress={onClick}>
        <View>
          <Text style={{
            fontWeight: "500",
            fontSize: 17,
            marginBottom: 3,
          }}>
            {uspList.length} variant{uspList.length === 1 ? '' : 's'}
          </Text>
          <Text style={{
            fontSize: 12,
          }}>
              From combinations of {optionsCount} option{optionsCount === 1 ? '' : 's'}
          </Text>
        </View>
        <Icon name={"chevron-right"} size={22} />
      </TouchableOpacity>
    </Surface>
  );
};

export default ImageSpecifier;
