import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from 'react-native-paper';
import HomeCarousel, { CarouselProps } from "../../components/HomeCarousel/HomeCarousel";
import Animated, {
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { ScreenDimensions } from "../../theme/Variables";

/**
 * Home screen component.
 * @constructor
 */
const Home = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  const components: CarouselProps[] = [
    {
      top: (<View style={{backgroundColor: "white", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "black", height: 400, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "blue", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "green", height: 4000, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "white", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "black", height: 400, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "blue", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "green", height: 4000, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "white", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "black", height: 400, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "blue", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
      bottom: (<View style={{backgroundColor: "green", height: 4000, justifyContent: "flex-end"}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
    },
    {
      top: (<View style={{backgroundColor: "white", height: 400}}><Text style={{color: "#FF0000"}}>WORLD</Text></View>),
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
    <SafeAreaView style={[Layout.fullWidth]}>
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
        {/* Top component with pagination bar */}
        <HomeCarousel setBottom={setBottom}
                      topHeight={400}
                      components={components} />

        {/* Bottom component */}
        <Animated.View
          style={{
            ...Layout.fullWidth,
            width: animationWidth
          }}
        >
          {components[bottomIndex].bottom}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
