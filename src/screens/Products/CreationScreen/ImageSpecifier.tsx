import { Surface, Text } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Generic } from "../../../services";

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

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
      }
    ]} elevation={4}>
      <Text style={{
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 10,
      }}>
        Specify Media
      </Text>
    </Surface>
  );
};

export default ImageSpecifier;
