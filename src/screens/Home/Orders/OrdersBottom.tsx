import { ProgressChart } from "react-native-chart-kit";
import { ScreenDimensions } from "../../../theme/Variables";
import { View } from "react-native";
import { Surface, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { addAlpha, LatestTimeUnit, Statistics, Timescale } from "../../../services";
import { useEffect, useState } from "react";
import { ProgressChartData } from "react-native-chart-kit/dist/ProgressChart";
import { Generic, OrderStatus } from "../../../services/model/types";
import GraphLabel from "./GraphLabel";
import OrderCountIsland from "./OrderCountIsland";

/* type used for the generateData function */
type DataGenerator = (init?: boolean) => ProgressChartData;

/**
 * Map of order statuses to be used in statistical display.
 *
 * - Confirmed: Confirmed and Packaged orders.
 *
 * - Sent: SentToCourier Orders.
 *
 * - Canceled: Canceled and ReceivedFromCourier orders.
 *
 * - Unreceived: CanceledAtCourier orders.
 *
 * - Paid: Paid orders.
 */
const OrderStatusMapping: Generic = {
  "Confirmed": {
    represented: [OrderStatus.confirmed, OrderStatus.packaged],
    color: "rgb(255, 255, 30)"
  },
  "Sent": {
    represented: [OrderStatus.packaged],
    color: "rgb(128, 0, 128)"
  },
  "Paid": {
    represented: [OrderStatus.canceled, OrderStatus.received_from_courier],
    color: "rgb(0, 168, 107)"
  },
  "Canceled": {
    represented: [OrderStatus.canceled_at_courier],
    color: "rgb(255, 36, 0)"
  },
  "Unreceived": {
    represented: [OrderStatus.paid],
    color: "rgb(255, 128, 0)"
  }
}

/**
 * @param block to calculate based on
 * @returns the total count for the label
 */
function countLabelPercentage(block: Statistics): number[] {
  let result: number[] = [];

  for (let label of Object.keys(OrderStatusMapping)) {
    const statusList: OrderStatus[] = OrderStatusMapping[label].represented;
    let temp = 0;

    for (let status of statusList) {
      temp += block.getActualOrderCount(status);
    }

    result.push(temp);
  }

  return result;
}

/**
 * @param block to calculate based on
 * @returns the percentage for the label
 */
function calculateLabelPercentage(block: Statistics): number[] {
  let result: number[] = [];
  const count = block.order_counts;

  for (let label of Object.keys(OrderStatusMapping)) {
    const statusList: OrderStatus[] = OrderStatusMapping[label].represented;
    let temp = 0;

    for (let status of statusList) {
      temp += block.getActualOrderCount(status);
    }

    result.push(count !== 0 ? temp / count : 0);
  }

  return result;
}

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
 * Top component for the total orders
 *
 * @param timescale to get the data for
 * @param setStatistics setter for the top component statistics
 * @param setPercentage percentage setter for the top component
 * @constructor
 */
const OrdersBottom = ({ timescale,
                       setStatistics,
                       setPercentage }: Properties) => {
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

  /* used for status count presentation */
  const [statusCounts, setStatusCounts] = useState<number[]>([]);

  /* update top component statistics */
  useEffect(() => {
    setStatistics(totalStats);
  }, [totalStats]);

  const loadingLabel = "Loading...";

  /**
   * Generates the statistics data based on the current timescale
   *
   * @param init if true, returns initial data values
   * @returns the data to be displayed in graph
   */
  const generateData: DataGenerator = (init?: boolean) => {
    if (init) {
      return {
        labels: [loadingLabel],
        data: new Array(Object.keys(OrderStatusMapping).length)
      };
    }

    const temp = Statistics.getLatestStatistics(
      timescaleToUnit[timescale],
      (block) => {
        return block.order_counts;
      },
    );

    const totalStats: Statistics = temp.data.pop();
    setTotalStats(totalStats);

    const n = temp.data.length - 1;
    const values = [temp.data[n - 1], temp.data[n]];

    if (values.indexOf(0) === -1) {
      setPercentage((values[1] - values[0]) / values.length);
    } else {
      setPercentage(0);
    }

    const mappingList = Object.keys(OrderStatusMapping);
    setStatusCounts(countLabelPercentage(totalStats));

    return {
      labels: mappingList,
      data: calculateLabelPercentage(totalStats),
    };
  };

  /* data to be displayed in the chart */
  const [data, setData] = useState<ProgressChartData>(generateData(true));

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
  const colorFunction = (opacity: number, index?: number) => {
    if (index === undefined) {
      return color;
    }

    const label = Object.keys(OrderStatusMapping)[index];
    return addAlpha(OrderStatusMapping[label].color, opacity);
  };

  /* color function for the label used in the graph */
  const labelColorFunction = (opacity: number) => {
    return addAlpha(labelColor, opacity);
  };

  return (
    <>
      <Surface
        style={[
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
          { padding: 25, paddingVertical: 35}
        ]}>
          <Text style={{
            fontWeight: "600",
            fontSize: 30,
          }}>
            Status Distribution
          </Text>
        </View>
        <View style={[Layout.fullWidth, Layout.row, Layout.rowHCenter]}>
          <ProgressChart
            data={data}
            height={220}
            width={width - 120}
            radius={36}
            hideLegend={true}
            strokeWidth={10}
            style={{
              padding: 0,
              margin: 0,
              marginBottom: 20,
            }}
            chartConfig={{
              backgroundGradientFrom: backgroundColor,
              backgroundGradientTo: backgroundColor,
              color: colorFunction,
              labelColor: labelColorFunction,
            }}
          />
          <View style={[
            Layout.colVCenter,
            Layout.justifyContentBetween,
            {
              height: 120,
            }
          ]}>
            {
              Object.keys(OrderStatusMapping).map((value, index) => {
                return (
                  <GraphLabel key={value}
                              color={Object.values(OrderStatusMapping)[index].color}
                              label={value} />
                );
              })
            }
          </View>
        </View>
      </Surface>
      <View style={[
        Layout.fullSize,
        {
          paddingBottom: 20,
        }
      ]}>
        <View>
          {
            // @ts-ignore
            data.labels.map((_, i) => {
              // @ts-ignore
              return i % 2 === 0 ? data.labels.slice(i, i + 2) : null;
            }).filter((val: string) => val).map((labels: string[],
                                                 majorIndex: number) => {
              if (labels[0] === loadingLabel) {
                return null;
              }

              return (
                <View style={[
                  Layout.row,
                  Layout.justifyContentBetween,
                  Layout.fullWidth,
                  {
                    marginBottom: 20
                  }
                  ]}>
                  {
                    // @ts-ignore
                    labels.map((label, index) => {
                      if (label === loadingLabel) {
                        return null;
                      }

                      return <OrderCountIsland
                        key={label}
                        color={OrderStatusMapping[label].color}
                        label={label + " Orders"}
                        // @ts-ignore, this works but IDE does not detect
                        count={statusCounts[labels.length * majorIndex + index]}
                        noShrink={labels.length === 1}
                      />;
                    })
                  }
                </View>
              );
            })
          }
        </View>
      </View>
    </>
  );
};

export default OrdersBottom;
