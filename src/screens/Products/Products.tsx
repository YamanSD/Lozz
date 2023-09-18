import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useNavigation } from '@react-navigation/native';
import { Appbar, useTheme as usePaperTheme } from "react-native-paper";
import NavigationNames from "./NavigationNames";

const Products = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[
      Layout.fullSize,
    ]}>
        <Appbar.Header mode={"center-aligned"} style={{
          backgroundColor: theme.colors.primary
        }}>
          <Appbar.Content title={"Products"} />
          <Appbar.Action icon={"plus"} size={28} onPress={() => {
            navigation.navigate(NavigationNames.CreationScreen as never);
          }} />
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
