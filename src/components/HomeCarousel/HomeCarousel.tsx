import React, { JSXElementConstructor, ReactElement, useRef } from "react";
import { ScrollView } from "react-native";
import { useSharedValue, } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
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
 *
 * - topHeight: Height of the top component in pixels
 */
type Properties = {
  topHeight: number,
  components: CarouselProps[],
};

/**
 * Carousel used in the home screen to display components.
 * @constructor
 */
const HomeCarousel = ({ components, topHeight }: Properties) => {
  const { Layout } = useBoilerTheme();

  // Create refs for both carousels
  const carouselTop = useRef<ICarouselInstance>(null);
  const carouselBottom = useRef<ICarouselInstance>(null);

  const progressValue = useSharedValue<number>(0);

  const barPadding = 10;
  const width = ScreenDimensions.width;
  const height = ScreenDimensions.height;

  return (
    <ScrollView
      style={{...Layout.fullWidth}}
      contentContainerStyle={{
        ...Layout.center,
        ...Layout.scrollSpaceBetween,
        ...Layout.selfStretch
      }}
      bounces={true}
      showsVerticalScrollIndicator={false}
    >
      {/* Top component */}
      <Carousel
        ref={carouselTop}
        onSnapToItem={() => {
          const current = carouselTop.current;

          if (current !== null) {
            const index = (current as ICarouselInstance).getCurrentIndex();

            const otherCurrent = carouselBottom.current;

            if (otherCurrent !== null) {
              (otherCurrent as ICarouselInstance).scrollTo({
                index: index,
                animated: true
              });
            }
          }
        }}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        width={width}
        height={topHeight}
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
          return item.top;
        }}
      />

      {/* Pagination Bar */}
      <PaginationBar animationValue={progressValue}
                     count={components.length}
                     defaultActiveColor={"white"}
                     defaultInactiveColor={"black"}
                     style={{ paddingVertical: barPadding }}
                     radius={10}
                     gap={5} />

      {/* Bottom component */}
      <Carousel
        enabled={false}

        ref={carouselBottom}
        width={width}
        height={height - topHeight - 2 * barPadding}
        pagingEnabled={true}
        snapEnabled={true}
        mode="horizontal-stack"
        modeConfig={{}}
        data={components}
        renderItem={({item}) => {
          return item.bottom;
        }}
      />
    </ScrollView>
  );
};

export default HomeCarousel;
