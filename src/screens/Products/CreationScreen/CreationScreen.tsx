import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleProp, TextStyle, View } from "react-native";
import { Appbar, Text, Button, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import MediaSelector from "./MediaSelector";

const CreationScreen = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();

  const [images, setImages] = useState<string[]>([]);

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
          ...Layout.scrollSpaceBetween,
          ...Layout.selfStretch,
          backgroundColor: theme.colors.primary
        }}
        bounces={true}
        showsVerticalScrollIndicator={false}>
        <MediaSelector setImages={setImages} />

      </ScrollView>
    </SafeAreaView>
  );
};

export default CreationScreen;
