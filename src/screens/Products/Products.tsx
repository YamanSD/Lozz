import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useTheme as useBoilerTheme } from "../../hooks";
import { Appbar, useTheme as usePaperTheme, Text } from "react-native-paper";

const Products = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  return (
    <SafeAreaView style={[
      Layout.fullSize,
    ]}>
      <Appbar.Header mode={"center-aligned"} style={{
        backgroundColor: theme.colors.primary
      }}>
        <Appbar.Content title={"Products"} />
        <Appbar.Action icon={"plus"} size={28} />
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={{
          ...Layout.center,
          ...Layout.scrollSpaceBetween,
          ...Layout.selfStretch,
          backgroundColor: theme.colors.primary
        }}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >

      </ScrollView>
    </SafeAreaView>
  );
};

export default Products;
