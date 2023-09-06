import * as React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle
} from "react-native-reanimated";
import { useTheme as usePaperTheme } from 'react-native-paper';


/**
 * Prop-type for the Pagination Dot component.
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
 * - isRotate?: if true, the animation is done from top to bottom.
 *   Otherwise, animation is done from left to right.
 *
 * - width: width of the dot in pixels.
 */
type Properties = {
  index: number,
  length: number,
  animationValue: Animated.SharedValue<number>,
  width: number,
  isRotate?: boolean,
  activeColor?: string,
  inactiveColor?: string
};

/**
 * @param props
 * @constructor
 */
const PaginationDot = ({ animationValue, index, length,
                         activeColor, inactiveColor,
                         width, isRotate }: Properties) => {
  /* application theme */
  const theme = usePaperTheme();
  const borderRadius = 50;

  if (activeColor === undefined) {
    activeColor = theme.colors.secondary;
  }

  if (inactiveColor === undefined) {
    inactiveColor = theme.colors.primary;
  }

  const animationStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && length - 1 < animationValue?.value) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [{
          translateX: interpolate(
            animationValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
          ),
        }],
    };
  }, [animationValue, index, length]);

  // noinspection JSSuspiciousNameCombination
  return (
    <View
      style={{
        backgroundColor: inactiveColor,
        width: width,
        height: width,
        borderRadius: borderRadius,
        overflow: "hidden",
        transform: [{
            rotateZ: isRotate ? "90deg" : "0deg",
        }],
      }}
    >
      <Animated.View
        style={[{
            borderRadius: borderRadius,
            backgroundColor: activeColor,
            flex: 1,
          }, animationStyle]}
      />
    </View>
  );
};

export default PaginationDot;
