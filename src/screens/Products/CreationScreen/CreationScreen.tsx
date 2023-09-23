import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleProp, TextStyle } from "react-native";
import { Appbar, Text, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import GeneralInfoSelector from "./GeneralInfoSelector";
import { Generic, MonetaryType } from "../../../services";
import InstructionSelector from "./InstructionSelector";
import MetaDataSelector from "./MetaDataSelector";

const CreationScreen = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams: {
    description?: string
  } = route.params ?? {};

  /* images of the product */
  const [images, setImages] = useState<string[]>([]);

  /* product name */
  const [name, setName] = useState<string>("");

  /* product description name
   * Note that the modification is sent back here using navigation route props.
   */
  const [description, setDescription] = useState<string>("");

  /* product price */
  const [price, setPrice] = useState<MonetaryType>(0.00);

  /* product cost */
  const [cost, setCost] = useState<MonetaryType>(0.00);

  /* instructions of the product */
  const [instructions, setInstructions] = useState<Generic<string>>({});

  useEffect(() => {
    setDescription(routeParams.description ?? "");
  }, [routeParams]);

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
                             setInstructions={setInstructions} />

        <MetaDataSelector />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreationScreen;
