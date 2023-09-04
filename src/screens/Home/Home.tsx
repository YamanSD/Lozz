import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme } from 'react-native-paper';

/**
 * Home screen component.
 * @constructor
 */
const Home = () => {
  const {
    Layout,
  } = useBoilerTheme();

  const theme = useTheme();

  return (
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
        <TouchableOpacity onPress={() => {
        }}>
          <Text>
            Hello world!
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Home;
