import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from 'react-native-paper';

/**
 * Home screen component.
 * @constructor
 */
const Home = () => {
  const {
    Layout,
  } = useBoilerTheme();

  const theme = usePaperTheme();

  return (
    <SafeAreaView style={Layout.fill}>
      <ScrollView
        style={Layout.fill}
        contentContainerStyle={[
          Layout.fullSize,
          Layout.fill,
          Layout.colCenter,
          Layout.scrollSpaceBetween,
        ]}>
        <View style={[
          { backgroundColor: theme.colors.primary },
          Layout.fill,
          Layout.relative,
          Layout.fullWidth,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter,
        ]}>
          <Button icon={"camera"} style={{backgroundColor: "#000"}}>
            Press me
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
