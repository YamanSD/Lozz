import React from "react";
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withDelay, WithSpringConfig
} from "react-native-reanimated";
import { ButtonProps, Button } from "react-native-paper";

/**
 * RN-Paper Button that springs on click
 *
 * @param props RN-Paper Button properties
 * @constructor
 */
const SpringButton = (props: ButtonProps) => {
  const scaleValue = useSharedValue(1);
  const springConfig: WithSpringConfig = {
  };

  // Animated style for the button
  const animationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  // Handler for expanding and collapsing
  const handlePress = () => {
    scaleValue.value = withSequence(withSpring(1.1, springConfig),
      withDelay(30, withSpring(1, springConfig)));
  };

  return (
      <Animated.View style={[animationStyle]}>
        <Button {...props} onPress={handlePress} />
      </Animated.View>
  );
};

export default SpringButton;
