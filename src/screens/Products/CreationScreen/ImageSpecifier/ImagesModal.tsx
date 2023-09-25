import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { Generic } from "../../../../services";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme as usePaperTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import NavigationNames from "../../NavigationNames";

/**
 * Prop-type for the image specifier component.
 */
type Properties = {
  uspList?: string[],
  images?: string[],
  imagesMap?: Generic<string[]>
};

/**
 * Images modal used by images specifier.
 * @constructor
 */
const ImagesModal = () => {
  const { Layout } = useBoilerTheme();
  const navigation = useNavigation();
  const theme = usePaperTheme();
  const route = useRoute();
  const props: Properties = route.params as any;
  const initImagesMap = props.imagesMap ?? {};
  const images = props.images ?? [];
  const uspList = props.uspList ?? [];

  /* imageMap of the product */
  const [imagesMap, setImagesMap] = useState<Generic<string[]>>(initImagesMap);

  return (
    <Animated.View>
      <Appbar mode={"center-aligned"} style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.secondary
      }}>
        <Button
          textColor={theme.colors.secondary}
          labelStyle={{
            fontSize: 16,
            fontWeight: "500"
          }}
          onPress={navigation.goBack}>
          Cancel
        </Button>
        <Appbar.Content title={"Select an Image"} />
        <Button
          textColor={theme.colors.secondary}
          labelStyle={{
            fontSize: 16,
            fontWeight: "500"
          }}
          onPress={() => {
            navigation.navigate(
              NavigationNames.CreationScreen as never,
              {
                imagesMap: imagesMap
              } as never
            );
          }}>
          Save
        </Button>
      </Appbar>

      <View style={[Layout.fullSize]}>
        <FlatList
          initialNumToRender={9}
          contentContainerStyle={{
            paddingBottom: 180
          }}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 20,
            paddingHorizontal: 20,
          }}
          bounces={true}
          showsVerticalScrollIndicator={false}
          data={images}
          renderItem={({ item }) => {
            return (
              <View key={item} style={[
                Layout.row,
                Layout.fullWidth,
                Layout.rowHCenter,
                Layout.justifyContentBetween,
                {
                  height: 80,
                  padding: 5,
                  backgroundColor: theme.colors.primary,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.tertiary
                }
              ]}>
                <Text>{item}</Text>
              </View>
            );
          }}
        />
      </View>
    </Animated.View>
  );
};

export default ImagesModal;
