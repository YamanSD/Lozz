import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from 'react-native-paper';
import HomeCarousel from "../../components/HomeCarousel/HomeCarousel";

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
          <HomeCarousel components={[
            {
              top: <Text style={{color: "#FF0000"}}>WORLD</Text>,
              bottom: <Text>HELLO</Text>
            }
          ]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
