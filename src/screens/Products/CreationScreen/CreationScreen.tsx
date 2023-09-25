import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleProp, TextStyle } from "react-native";
import { Appbar, Text, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import GeneralInfoSelector from "./GeneralInfoSelector";
import {
  DependencyTree,
  emptyQuantities,
  Generic,
  MonetaryType,
  QuantityType
} from "../../../services";
import InstructionSelector from "./InstructionSelector";
import MetaDataSelector from "./MetaDataSelector";
import QuantitiesSelector from "./QuantitiesSelector";

/**
 * Responsible for the product creation process.
 * This will be used to modify products in the future.
 * @constructor
 */
const CreationScreen = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams: {
    description?: string,
    quantities?: QuantityType
  } = route.params ?? {};

  /* images of the product */
  const [images, setImages] = useState<string[]>([]);

  /* product name */
  const [name, setName] = useState<string>("");

  /* product description name
   * Note that the modification is sent back here using navigation route props.
   */
  const [description, setDescription] = useState<string>("");

  /* quantities (display & inventory) of the product */
  const [quantities, setQuantities] = useState<QuantityType>({});

  /* product price */
  const [price, setPrice] = useState<MonetaryType>(0.00);

  /* product cost */
  const [cost, setCost] = useState<MonetaryType>(0.00);

  /* instructions of the product */
  const [instructions, setInstructions] = useState<Generic<string>>({});

  /* vendor ID of the product (which is actually the vendor name) */
  const [vendorId, setVendorId] = useState<string>("");

  /* category ID of the product (which is actually the category name) */
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => { // Get results from models
    if (routeParams.description !== undefined) {
      setDescription(routeParams.description);
    }

    if (routeParams.quantities !== undefined) {
      setQuantities(routeParams.quantities);
    }
  }, [routeParams]);

  useEffect(() => { // Reset quantities on category change
    if (categoryId === "") { // Initial category
      return;
    }

    DependencyTree.Categories.get(categoryId).then(c => {
      setQuantities(emptyQuantities(c));
    });
  }, [categoryId]);

  /* product ID */
  const [productId, setProductId] = useState<string>("");

  const textStyle: StyleProp<TextStyle> = {
    color: theme.colors.secondary,
    fontWeight: "500",
    fontSize: 16,
  };

  return (
    <SafeAreaView style={[
      Layout.fullSize,
    ]}>
      <Appbar.Header mode={"center-aligned"} style={
        [Layout.justifyContentBetween,
          {
            backgroundColor: theme.colors.primary,
          }
        ]}>
        <Button onPress={navigation.goBack} mode={"text"}>
          <Text style={textStyle}>
            Cancel
          </Text>
        </Button>

        <Text style={{...textStyle, fontSize: 18}}>New Product</Text>

        <Button onPress={navigation.goBack} mode={"text"}>
          <Text style={textStyle}>
            Save
          </Text>
        </Button>
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={{
          ...Layout.center,
          ...Layout.selfStretch,
          backgroundColor: theme.colors.primary
        }}
        bounces={true}
        showsVerticalScrollIndicator={false}>
        <GeneralInfoSelector setImages={setImages}
                             images={images}
                             setName={setName}
                             name={name}
                             description={description}
                             setId={setProductId}
                             id={productId}
                             setPrice={setPrice}
                             price={price}
                             setCost={setCost}
                             cost={cost}
        />

        <InstructionSelector instructions={instructions}
                             setInstructions={setInstructions}
        />

        <MetaDataSelector vendorId={vendorId}
                          setVendorId={setVendorId}
                          categoryId={categoryId}
                          setCategoryId={setCategoryId}
        />

        <QuantitiesSelector quantities={quantities} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreationScreen;
