import * as React from "react";
import { View } from "react-native";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useTheme as usePaperTheme } from "react-native-paper";


/**
 * Prop-type for the PaginationDot component.
 *
 * - index: index of the component in the pagination bar.
 *
 * - activeColor?: hex-string representing the color of the
 *   dot after it being selected.
 *   If not provided, use the secondary theme color.
 *
 * - inactiveColor?: hex-string representing the color of the
 *   dot if it is not selected.
 *
 * - length: total number of dots in the pagination bar.
 *
 * - animationValue: animation speed of the transition.
 *
 * - isRotate?: if true, the animation is done vertically.
 *   Otherwise, animation is done from horizontally.
 *
 * - radius: radius of the dot in pixels.
 */
type Properties = {
  index: number,
  length: number,
  animationValue: Animated.SharedValue<number>,
  radius: number,
  isRotate?: boolean,
  activeColor?: string,
  inactiveColor?: string
};

/**
 * Pagination dot used in a pagination bar.
 *
 * @param props for the dot.
 * @constructor
 */
const PaginationDot = ({
                         animationValue, index, length,
                         activeColor, inactiveColor,
                         radius, isRotate
                       }: Properties) => {
  /* application theme */
  const theme = usePaperTheme();
  const borderRadius = radius / 2;

  if (activeColor === undefined) {
    activeColor = theme.colors.secondary;
  }

  if (inactiveColor === undefined) {
    inactiveColor = theme.colors.primary;
  }

  const animationStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-radius, 0, radius];

    if (index === 0 && length - 1 < animationValue?.value) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-radius, 0, radius];
    }

    return {
      transform: [{
        translateX: interpolate(
          animationValue?.value,
          inputRange,
          outputRange,
          Extrapolate.CLAMP
        )
      }]
    };
  }, [animationValue, index, length]);

  return (
    <View
      style={{
        backgroundColor: inactiveColor,
        width: radius,
        height: radius,
        borderRadius: borderRadius,
        overflow: "hidden",
        transform: [{
          rotateZ: isRotate ? "90deg" : "0deg"
        }]
      }}
    >
      <Animated.View
        style={[{
          borderRadius: borderRadius,
          backgroundColor: activeColor,
          flex: 1
        }, animationStyle]}
      />
    </View>
  );
};

export default PaginationDot;
