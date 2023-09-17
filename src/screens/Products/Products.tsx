import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";

const Products = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  return (
    <SafeAreaView style={[
      Layout.fullSize,
    ]}>
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
