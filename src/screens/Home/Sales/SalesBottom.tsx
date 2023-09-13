import {
  LineChart,
} from "react-native-chart-kit";
import { ScreenDimensions } from "../../../theme/Variables";
import { View } from "react-native";
import { Surface } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme, Text } from "react-native-paper";
import {
  addAlpha,
  formatMonetary,
  Statistics,
  Timescale,
  LatestTimeUnit
} from "../../../services";

/**
 * Prop-type for the Sales slide bottom component.
 *
 * - timescale: current timescale
 */
type Properties = {
  timescale: Timescale,
};

/**
 * Top component for the total sales
 *
 * @param timescale to get the data for
 * @constructor
 */
const SalesBottom = ({ timescale }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  const timescaleToUnit = {
    [Timescale.Y]: LatestTimeUnit.year,
    [Timescale.M]: LatestTimeUnit.month,
    [Timescale.W]: LatestTimeUnit.week,
    [Timescale.D]: LatestTimeUnit.day,
    [Timescale.H]: LatestTimeUnit.hour
  };

  const { tags, data } = Statistics.getLatestStatistics(
    timescaleToUnit[timescale]
  );

  /* given to the graph */
  const dataObject = {
    labels: tags,
    datasets: [
      {
        data: data
      }
    ],
  };

  /* elevation value of the surface */
  const elevation = 4;

  /* width of graphs */
  const width = ScreenDimensions.width;

  /* background color for the graphs */
  const backgroundColor = theme.colors.elevation[`level${elevation}`];

  /* inner color for the graph components */
  const color = theme.colors.secondary;

  /* color of the graph labels */
  const labelColor = theme.colors.secondary;

  /* color function used in the graph */
  const colorFunction = (ignored: number) => {
    return addAlpha(color, 1);
  };

  /* color function for the label used in the graph */
  const labelColorFunction = (opacity: number) => {
    return addAlpha(labelColor, opacity);
  };

  return (
    <Surface
      style={[
      // Layout.colHCenter,
      Layout.justifyContentAround,
        {
          height: 300,
          borderRadius: 10,
          marginBottom: 20,
        }
    ]}
      elevation={elevation}
    >
      {/* Net value header */}
      <View style={[
        Layout.row,
        Layout.rowHCenter,
        Layout.justifyContentBetween,
        { padding: 25, paddingBottom: 35}
      ]}>
        <Text style={{
          fontWeight: "600",
          fontSize: 30,
        }}>
          Net Profit
        </Text>

        <Text style={{
          fontWeight: "800",
          fontSize: 30,
        }}>
          ${formatMonetary(10828, true)}
        </Text>
      </View>
      <LineChart
        data={dataObject}
        height={220}
        width={width}
        yAxisLabel="$"
        yAxisInterval={1} // optional, defaults to 1
        xLabelsOffset={0}
        fromZero={true}
        withVerticalLines={false}
        withOuterLines={false}
        style={{
          marginRight: 20,
          marginBottom: 20,
        }}
        chartConfig={{
          propsForBackgroundLines: {
            strokeDasharray: [],
            opacity: 0.2,
          },
          propsForLabels: {
            fontWeight: "bold",
            fontSize: 11,
          },
          backgroundGradientFrom: backgroundColor,
          backgroundGradientTo: backgroundColor,
          color: colorFunction,
          labelColor: labelColorFunction,
          propsForDots: {
            fill: theme.colors.primary,
            r: "3",
            strokeWidth: "1",
            stroke: theme.colors.secondary
          }
        }}
        bezier
      />
    </Surface>
  );
};

export default SalesBottom;
