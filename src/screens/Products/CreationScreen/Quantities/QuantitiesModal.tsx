import React, { useState } from "react";
import Animated from "react-native-reanimated";
import { Appbar, Button, Text, useTheme as usePaperTheme } from "react-native-paper";
import { FlatList, ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import NavigationNames from "../../NavigationNames";
import { formatUsp, QuantityType } from "../../../../services";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import QuantityInputCol from "./QuantityInputCol";


/**
 * Prop-type for the QuantitiesModal
 */
type Properties = {
  quantities?: QuantityType
}

/**
 * Used to edit the quantities of a product.
 * Props passed from route.
 * @constructor
 */
const QuantitiesModal = () => {
  const { Layout } = useBoilerTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const props: Properties = route.params as any;
  const initQuantities = props.quantities ?? {};
  const theme = usePaperTheme();

  /* quantities (display and inventory) of the product */
  const [quantities, setQuantities] = useState(initQuantities);

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
        <Appbar.Content title={"Quantities"} />
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
                quantities: quantities
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
            paddingHorizontal: 20
          }}
          bounces={true}
          showsVerticalScrollIndicator={false}
          data={Object.keys(initQuantities)}
          renderItem={(uspWrapper) => {
            const usp = uspWrapper.item;

            return (
              <View key={usp} style={[
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
                <ScrollView horizontal={true}
                            showsHorizontalScrollIndicator={false}>
                  <Text style={{
                    fontWeight: "600",
                    fontSize: 18
                  }}>
                    {
                      formatUsp(usp)
                    }
                  </Text>
                </ScrollView>
                <QuantityInputCol usp={usp}
                                  quantities={quantities}
                                  setQuantities={setQuantities} />
              </View>
            );
          }}
        />
      </View>
    </Animated.View>
  );
};

export default QuantitiesModal;
