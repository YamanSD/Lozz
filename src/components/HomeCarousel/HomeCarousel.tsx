import React, { JSXElementConstructor, ReactElement } from "react";
import { ScrollView, View } from "react-native";
import { useSharedValue, } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { ScreenDimensions } from "../../theme/Variables";
import { PaginationBar } from "../index";
import { modifyProgress } from "../PaginationBar/PaginationBar";
import { useTheme as useBoilerTheme } from "../../hooks";

/**
 * Type of top & bottom elements.
 */
type ElementType = ReactElement<any, string | JSXElementConstructor<any>>;

/**
 * - bottom: Component to be displayed under the pagination dots.
 *
 * - top: Component to be displayed above the pagination dots.
 */
type CarouselProps = {
  top: ElementType,
  bottom: ElementType,
};

/**
 * Prop-type for the HomeCarousel component
 */
type Properties = {
  components: CarouselProps[],
};

/**
 * Carousel used in the home screen to display components.
 * @constructor
 */
const HomeCarousel = ({ components }: Properties) => {
  const { Layout } = useBoilerTheme();

  const progressValue = useSharedValue<number>(0);
  const width = ScreenDimensions.width;
  const height = ScreenDimensions.height;

  return (
      <View style={{
        ...Layout.center,
        ...Layout.fill,
      }}>
          {/* Top component */}
          <Carousel
            width={width}
            height={height}
            loop={true}
            pagingEnabled={true}
            snapEnabled={true}
            onProgressChange={(_, absoluteProgress) => {
              return modifyProgress(progressValue, absoluteProgress);
            }}
            mode="horizontal-stack"
            modeConfig={{}}
            data={components}
            renderItem={({item}) => {
              return (
                <ScrollView
                  contentContainerStyle={{
                    paddingVertical: 45,
                  }}
                  bounces={true}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Top component */}
                  {item.top}

                  {/* Pagination Bar */}
                  <PaginationBar animationValue={progressValue}
                                 count={components.length}
                                 defaultActiveColor={"white"}
                                 defaultInactiveColor={"black"}
                                 style={{ paddingVertical: 10 }}
                                 radius={10}
                                 gap={5} />

                  {/* Bottom component */}
                  {item.bottom}
                </ScrollView>
              );
            }} />
    </View>
  );
};

export default HomeCarousel;
