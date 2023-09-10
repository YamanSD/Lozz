import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from 'react-native-paper';
import { HomeCarousel, CarouselProps } from "../../components";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { ScreenDimensions } from "../../theme/Variables";
import { CacheImage } from "../../components";
import CollectionInfo from "../../CollectionInfo";
import { addAlpha } from "../../services";

/**
 * Home screen component.
 * @constructor
 */
const Home = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  const components: CarouselProps[] = [
    {
      top: (<View style={{backgroundColor: "black", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "black", height: 400, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "blue", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "green", height: 4000, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
  ];

  /* screen width, used for spring animation */
  const maxWidth = ScreenDimensions.width;

  /* min screen width, used for spring animation */
  const minWidth = 50; // px

  /* horizontal padding for all components */
  const horizontalPadding = 10;

  const animationWidth = useSharedValue(maxWidth);
  const [bottomIndex, setBottomIndex] = useState(0);

  /* toggles animation and changes the current index */
  const setBottom = (index: number) => {
    // Reduce old bottom component
    animationWidth.value = withSpring(minWidth);

    /*
     * Expand the new one.
     * (Note that this approach is not the best, however it works).
     * If better alternative found change.
     */
    setTimeout(() => {
      setBottomIndex(index);
      animationWidth.value = withSpring(
        maxWidth,
        {
          damping: 17
        }
      );
    }, 150);
  }

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
        {/* app name bar */}
        <View style={[
          Layout.fullWidth,
          Layout.rowHCenter, {
          padding: 20,
          height: 90,
          backgroundColor: theme.colors.primary
        }]}>
          <CacheImage
            source={{uri: "https://www.research-andme.com/wp-content/uploads/2018/03/3840x2160-dark-red-solid-color-background.jpg"}}
            style={{
              height: 45,
              width: 45,
              borderRadius: 8
            }}
          />
          <Text style={{
            fontWeight: "800",
            fontSize: 22,
            paddingLeft: 15
          }}>
            {CollectionInfo.app_name}
          </Text>
        </View>

        {/* separator */}
        <LinearGradient style={[
          Layout.fullWidth,
          { height: 5 }
        ]}
        colors={[
          addAlpha(theme.colors.secondary, 0.7),
          addAlpha(theme.colors.secondary, 0),
        ]}
        />

        {/* dashboard header */}
        <View style={[
          Layout.row,
          Layout.fullWidth,
          Layout.rowHCenter,
          Layout.justifyContentBetween, {
            paddingVertical: 2 * horizontalPadding,
            paddingHorizontal: horizontalPadding
          }
        ]}>
          <Text style={[{
            fontSize: 34,
            fontWeight: "800"
          }]}>
            Dashboard
          </Text>
          <Button textColor={"#FFF"}>HERE</Button>
        </View>

        {/* Top component with pagination bar */}
        <HomeCarousel setBottom={setBottom}
                      topHeight={400}
                      components={components}
                      padHTop={horizontalPadding} />

        {/* Bottom component */}
        <Animated.View
          style={{
            ...Layout.fullWidth,
            width: animationWidth,
            paddingHorizontal: horizontalPadding,
          }}
        >
          {components[bottomIndex].bottom}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
