import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  WithSpringConfig
} from "react-native-reanimated";
import { Button, ButtonProps } from "react-native-paper";

/**
 * Prop-type for the spring button.
 *
 * - expandBy?: percentage of expansion of the button, default is 0.1 (10%);
 */
type Properties = ButtonProps & {
  expandBy?: number
};

/**
 * RN-Paper Button that springs on click
 *
 * @param props RN-Paper Button properties
 * @constructor
 */
const SpringButton = (props: Properties) => {
  const scaleValue = useSharedValue(1);
  const springConfig: WithSpringConfig = {};
  const expandBy = props.expandBy ?? 0.1;

  // Animated style for the button
  const animationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }]
    };
  });

  // Handler for expanding and collapsing
  const handlePress = () => {
    scaleValue.value = withSequence(
      withSpring(1 + expandBy, springConfig),
      withDelay(30, withSpring(1, springConfig))
    );
  };

  return (
    <Animated.View style={[animationStyle]}>
      <Button {...props} onPress={(e) => {
        handlePress();

        const temp = props.onPress;

        if (temp !== undefined) {
          return temp(e);
        }
      }} />
    </Animated.View>
  );
};

export default SpringButton;
