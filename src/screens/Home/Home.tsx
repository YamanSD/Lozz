import React from "react";
import { SafeAreaView, View } from "react-native";
import { Text } from "react-native-paper";
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
      <View style={[
        { backgroundColor: theme.colors.primary },
        Layout.fill,
        Layout.relative,
        Layout.fullWidth,
        Layout.justifyContentCenter,
        Layout.alignItemsCenter,
      ]}>
        <HomeCarousel topHeight={200} components={[
          {
            top: (<View style={{backgroundColor: "white", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
            bottom: (<View style={{backgroundColor: "black", height: 400, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
          },
          {
            top: (<View style={{backgroundColor: "blue", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
            bottom: (<View style={{backgroundColor: "green", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
          },
        ]} />
      </View>
    </SafeAreaView>
  );
};

export default Home;
