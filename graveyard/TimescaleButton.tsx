import { SpringButton } from "../src/components";
import React from "react";

/**
 * Prop-type for the time interval button.
 *
 * - timescale: timescale value
 *
 * - onPress: function triggered on press
 */
type Properties = {
  timescale: string,
  onPress: () => any
};

/**
 * Time interval changing button
 * @constructor
 */
const TimescaleButton = ({ timescale, onPress }: Properties) => {
  return (
    <SpringButton rippleColor={"#FFFFFF"}
                  mode={"contained-tonal"}
                  buttonColor={"#000080"}
                  style={{
                    borderRadius: 10
                  }}
                  contentStyle={{
                    height: 30,
                    width: 140,
                    flexDirection: "row-reverse"
                  }}
                  labelStyle={{
                    fontWeight: "700",
                    height: "65%"
                  }}
                  icon={"chevron-down"}
                  expandBy={0.05}
                  textColor={"white"}
                  onPress={() => {
                    onPress();
                  }}>
      {timescale}
    </SpringButton>
  );
};

export default TimescaleButton;
