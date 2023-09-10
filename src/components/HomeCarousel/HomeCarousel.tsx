import React, {
  JSXElementConstructor,
  ReactElement,
  useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { ScreenDimensions } from "../../theme/Variables";
import { PaginationBar } from "../index";
import { modifyProgress } from "../PaginationBar/PaginationBar";
import { useTheme as usePaperTheme } from 'react-native-paper';
import { View } from "react-native";

/**
 * Type of top & bottom elements.
 */
type ElementType = ReactElement<any, string | JSXElementConstructor<any>>;

/**
 * - bottom: Component to be displayed under the pagination dots.
 *
 * - top: Component to be displayed above the pagination dots.
 */
export type CarouselProps = {
  top: ElementType,
  bottom: ElementType,
};

/**
 * Prop-type for the HomeCarousel component
 *
 * - topHeight: Height of the top component in pixels
 *
 * - setBottom: Setter for the bottom index, when the top changes
 *
 * - components: Components list to be rendered
 *
 * - padHTop?: Horizontal padding to be added to the top components
 */
type Properties = {
  topHeight: number,
  padHTop?: number
  setBottom: (index: number) => any,
  components: CarouselProps[],
};

/**
 * Carousel used in the home screen to display components.
 * @constructor
 */
const HomeCarousel = ({ components, topHeight,
                        setBottom, padHTop }: Properties) => {
  const theme = usePaperTheme();

  // Create refs for both carousels
  const carouselTop = useRef<ICarouselInstance>(null);

  // Used by the bar
  const progressValue = useSharedValue<number>(0);

  const barPadding = 10;
  const width = ScreenDimensions.width;

  return (
    <>
      {/* Top component */}
      <Carousel
        ref={carouselTop}
        onSnapToItem={() => {
          const current = carouselTop.current;

          if (current !== null) {
            setBottom(
              (current as ICarouselInstance).getCurrentIndex()
              % components.length
            );
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
        modeConfig={{
          stackInterval: (padHTop ?? 0) * 40,
        }}
        data={components}
        renderItem={({item}) => {
          return (
            <View style={{paddingHorizontal: padHTop ?? 0}}>
              {item.top}
          </View>
          );
        }}
      />

      {/* Pagination Bar */}
      <PaginationBar animationValue={progressValue}
                     count={components.length}
                     defaultActiveColor={theme.colors.secondary}
                     defaultInactiveColor={theme.colors.tertiary}
                     style={{ paddingVertical: barPadding }}
                     radius={10}
                     gap={5} />
    </>
  );
};

export default HomeCarousel;
