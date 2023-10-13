import React, { useEffect, useState } from "react";
import { Image, ImageProps } from 'react-native';
import { Generic } from "../../services";
import { ImagesManager } from "../../services";
import { useTheme as useBoilerTheme } from "../../hooks";

/**
 * Cache image that relies on the ImagesManager
 */
const CacheImage = (props: ImageProps) => {
  const { Images } = useBoilerTheme();
  const baseUri = (props.source as Generic)["uri"];
  const [uri, setUri] = useState<string | undefined>(baseUri);

  useEffect(() => {
    const temp = async () => {
      setUri(await ImagesManager.get(baseUri));
    }

    temp().then();
  }, []);

  return (<Image
    {...props}
    source={uri !== undefined ? {uri: uri} : Images.defaultImage}
  />);
};

export default CacheImage;
