import { LineChart } from "react-native-chart-kit";
import { ScreenDimensions } from "../../../theme/Variables";
import { View } from "react-native";
import { Surface, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { addAlpha, formattedNumber, LatestTimeUnit, Statistics, Timescale } from "../../../services";
import { useEffect, useState } from "react";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

/* type used for the generateData function */
type DataGenerator = (init?: boolean) => LineChartData;

/**
 * Prop-type for the Sales slide bottom component.
 *
 * - timescale: current timescale
 */
type Properties = {
  timescale: Timescale,
  setStatistics: React.Dispatch<React.SetStateAction<Statistics>>,
  setPercentage: React.Dispatch<React.SetStateAction<number>>
};

/**
 * Top component for the total sales
 *
 * @param timescale to get the data for
 * @param setStatistics setter for the top component statistics
 * @param setPercentage percentage setter for the top component
 * @constructor
 */
const SalesBottom = ({
                       timescale,
                       setStatistics,
                       setPercentage
                     }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  const timescaleToUnit = {
    [Timescale.Y]: LatestTimeUnit.year,
    [Timescale.M]: LatestTimeUnit.month,
    [Timescale.W]: LatestTimeUnit.week,
    [Timescale.D]: LatestTimeUnit.day,
    [Timescale.H]: LatestTimeUnit.hour
  };

  /* net profit state variable */
  const [totalStats, setTotalStats] = useState<Statistics>(
    Statistics.noValue("")
  );

  /* update top component statistics */
  useEffect(() => {
    setStatistics(totalStats);
  }, [totalStats]);

  /**
   * @param date to be formatted
   * @param position of the block in the tags array
   * @param n the total number of blocks
   * @returns a label string based on the date and the current timescale
   */
  const mapDate = (date: Date, position: number, n: number) => {
    if (timescale === Timescale.H
      || timescale === Timescale.W
      || (position !== 0
        && position !== n
        && position !== Math.floor(n / 2))) {
      switch (timescale) {
        case Timescale.H:
          const hours = date.getHours();
          return (position <= n - 1)
          && (position === n - 1
            || (position + 1) % 5 === 0
            || position === 0)
            ? `${(hours + 11) % 12 + 1}:00${hours < 12 ? "A" : "P"}M`
            : "";
        case Timescale.W:
          const dateStr = date.toDateString();
          return dateStr.substring(0, dateStr.length - 5);
      }
    }

    // Weeks & hours handled above
    switch (timescale) {
      case Timescale.D:
        return date.toDateString().substring(0, 4);
      case Timescale.M:
        return date.toDateString().substring(4, 7);
      case Timescale.Y:
        return date.getFullYear().toString();
    }
  };

  /**
   * Generates the statistics data based on the current timescale
   *
   * @param init if true, returns initial data values
   * @returns the data to be displayed in graph
   */
  const generateData: DataGenerator = (init?: boolean) => {
    if (init) {
      return {
        labels: ["Loading..."],
        datasets: [{ data: [0] }]
      };
    }

    const temp = Statistics.getLatestStatistics(
      timescaleToUnit[timescale],
      (block) => {
        return block.profit.data;
      },
      mapDate
    );

    setTotalStats(temp.data.pop());

    const n = temp.data.length - 1;
    const values = [temp.data[n - 1], temp.data[n]];

    if (values.indexOf(0) === -1) {
      setPercentage((values[1] - values[0]) / values.length);
    } else {
      setPercentage(0);
    }

    return {
      labels: temp.tags,
      datasets: [{ data: temp.data }]
    };
  };

  /* data to be displayed in the chart */
  const [data, setData] = useState<LineChartData>(generateData(true));

  useEffect(() => {
    setData(generateData());
  }, [timescale]);

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
        Layout.justifyContentAround,
        {
          height: 300,
          borderRadius: 10,
          marginBottom: 20
        }
      ]}
      elevation={elevation}
    >
      {/* Net value header */}
      <View style={[
        Layout.row,
        Layout.rowHCenter,
        Layout.justifyContentBetween,
        { padding: 25, paddingTop: 35, paddingBottom: 45 }
      ]}>
        <Text style={{
          fontWeight: "600",
          fontSize: 30
        }}>
          Net Profit
        </Text>

        <Text style={{
          fontWeight: "800",
          fontSize: 30
        }}>
          ${formattedNumber(totalStats.profit.data, true)}
        </Text>
      </View>
      <LineChart
        data={data}
        height={220}
        width={width}
        yAxisLabel="$"
        yAxisInterval={1} // optional, defaults to 1
        xLabelsOffset={0}
        fromZero={true}
        // withVerticalLines={false}
        withOuterLines={false}
        style={{
          marginBottom: 20
        }}
        chartConfig={{

          decimalPlaces: 0,
          propsForBackgroundLines: {
            strokeDasharray: [],
            opacity: 0.2
          },
          propsForLabels: {
            fontWeight: "bold",
            fontSize: 10
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
