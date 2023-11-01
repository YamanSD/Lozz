import { StyleProp, View, ViewStyle } from "react-native";
import * as React from "react";
import Animated from "react-native-reanimated";
import PaginationDot from "./PaginationDot";

/**
 * Prop-type for the PaginationBar component.
 *
 * - animationValue: animation speed of the transition.
 *
 * - count: number of dots to be displayed.
 *
 * - radius: radius of the dots to be displayed in pixels.
 *
 * - gap: gap in pixels between each dot.
 *   If present in the style, it is overridden.
 *
 * - defaultActiveColor?: hex-string representing the default
 *   active color for each dot.
 *
 * - defaultInactiveColor?: hex-string representing the default
 *   inactive color for each dot.
 *
 * - activeColors?: array of hex-strings for the active color of each dot.
 *   The colors are displayed in order.
 *   Has precedence over the default color.
 *
 * - inactiveColors?: array of hex-string for the inactive color of each dot.
 *   The colors are displayed in order.
 *  Has precedence over the default color.
 *
 * - isVertical?: if true, the bar is displayed vertically.
 */
type Properties = {
  animationValue: Animated.SharedValue<number>,
  count: number,
  radius: number,
  gap?: number,
  style?: StyleProp<ViewStyle>,
  defaultActiveColor?: string,
  defaultInactiveColor?: string,
  activeColors?: string[],
  inactiveColors?: string[],
  isVertical?: boolean,
};


const PaginationBar = ({
                         animationValue, count,
                         activeColors, inactiveColors,
                         isVertical, radius, style,
                         defaultActiveColor, gap,
                         defaultInactiveColor
                       }: Properties) => {
  let colors = inactiveColors !== undefined ? inactiveColors : activeColors;

  if (colors === undefined) {
    colors = Array(count).fill(null);
  }

  if (style === undefined) {
    style = {};
  }

  if (gap === undefined) {
    gap = 0;
  }

  style = {
    gap: gap,
    ...(style as Object),
    flexDirection: isVertical ? "column" : "row",
    justifyContent: "space-between",
    alignSelf: "center"
  };

  return (
    <View style={style}>
      {colors.map((_, index) => {
        return (
          <PaginationDot
            activeColor={activeColors?.at(index) ?? defaultActiveColor}
            inactiveColor={inactiveColors?.at(index) ?? defaultInactiveColor}
            animationValue={animationValue}
            index={index}
            key={index}
            isRotate={isVertical}
            length={count}
            radius={radius}
          />
        );
      })}
    </View>
  );
};

/**
 * Function that modifies the progressValue using the absolute progress.
 *
 * @param progressValue instance to be modified
 * @param absoluteProgress new progressValue
 * @returns the new progress value
 */
export function modifyProgress(progressValue: Animated.SharedValue<number>,
                               absoluteProgress: number): number {
  return progressValue.value = absoluteProgress;
}

export default PaginationBar;
