import { SpringButton } from "../../components";
import React from "react";

/**
 * Prop-type for the time interval button.
 *
 * - timeInterval: time interval value
 *
 * - onPress: function triggered on press
 */
type Properties = {
  timeInterval: string,
  onPress: () => any
};

/**
 * Time interval changing button
 * @constructor
 */
const TimeIntervalButton = ({ timeInterval, onPress }: Properties) => {
  return (
    <SpringButton rippleColor={"#FFFFFF"}
                  mode={'contained-tonal'}
                  buttonColor={"#000080"}
                  style={{
                    borderRadius: 10,
                  }}
                  contentStyle={{
                    height: 30,
                    width: 130,
                    flexDirection: "row-reverse"
                  }}
                  labelStyle={{
                    fontWeight: "700",
                    height: "65%",
                    width: "50%"
                  }}
                  icon={"chevron-down"}
                  expandBy={0.05}
                  onPress={() => {onPress()}}
    >
      {timeInterval}
    </SpringButton>
  );
}

export default TimeIntervalButton;
