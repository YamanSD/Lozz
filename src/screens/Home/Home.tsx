import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../hooks";
import { useTheme as usePaperTheme } from 'react-native-paper';
import { CarouselProps } from "./HomeCarousel";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useSharedValue,
  withTiming,
  Easing
} from "react-native-reanimated";
import { CacheImage } from "../../components";
import CollectionInfo from "../../CollectionInfo";
import { addAlpha, Statistics, Timescale } from "../../services";
import HomeCarousel from "./HomeCarousel";
import SalesTop from "./Sales/SalesTop";
import SalesBottom from "./Sales/SalesBottom";
import OrdersTop from "./Orders/OrdersTop";
import OrdersBottom from "./Orders/OrdersBottom";
import ExpensesBottom from "./Expenses/ExpensesBottom";
import ExpensesTop from "./Expenses/ExpensesTop";
import ProductsTop from "./Products/ProductsTop";
import ProductsBottom from "./Products/ProductsBottom";
import { Dropdown } from 'react-native-element-dropdown';

/**
 * Home screen component.
 * @constructor
 */
const Home = () => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* Current selected time interval */
  const [timescale, setTimescale] =
    useState<Timescale>(Timescale.H);

  /* horizontal padding for all components */
  const horizontalPadding = 10;

  /* animation opacity variable used for the bottom components */
  const animationOpacity = useSharedValue(1);

  /* index of the current selected bottom component */
  const [bottomIndex, setBottomIndex] = useState(0);

  /* combined statistics to used for top component */
  const [combinedStatistics, setCombinedStatistics] =
    useState(Statistics.noValue(""));

  /* percentage change to be displayed */
  const [percentageChange, setPercentageChange] = useState(0);

  /* toggles animation and changes the current index */
  const setBottom = (index: number) => {
    // Reduce old bottom component
    animationOpacity.value = withTiming(0,
      {
        easing: Easing.out(Easing.exp)
      });

    /*
     * Expand the new one.
     * Cannot use withSequence and withDelay due to the setBottomIndex.
     */
    setTimeout(() => {
      setBottomIndex(index);
      animationOpacity.value = withTiming(1);
    }, 150);
  }

  const components: CarouselProps[] = [
    {
      top: <SalesTop statistics={combinedStatistics}
                     percentage={percentageChange} />,
      bottom: <SalesBottom timescale={timescale}
                           setStatistics={setCombinedStatistics}
                           setPercentage={setPercentageChange} />
    },
    {
      top: <OrdersTop statistics={combinedStatistics}
                      percentage={percentageChange} />,
      bottom: <OrdersBottom timescale={timescale}
                            setStatistics={setCombinedStatistics}
                            setPercentage={setPercentageChange} />
    },
    {
      top: <ExpensesTop statistics={combinedStatistics} />,
      bottom: <ExpensesBottom timescale={timescale}
                            setStatistics={setCombinedStatistics} />
    },
    {
      top: <ProductsTop statistics={combinedStatistics}
                     percentage={percentageChange} />,
      bottom: <ProductsBottom timescale={timescale}
                           setStatistics={setCombinedStatistics}
                           setPercentage={setPercentageChange} />
    },
  ];

  return (
    <SafeAreaView style={[
      Layout.fullSize,
    ]}>
      <ScrollView
        contentContainerStyle={{
          ...Layout.center,
          ...Layout.scrollSpaceBetween,
          ...Layout.selfStretch,
          backgroundColor: theme.colors.primary
        }}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        {/* app name bar */}
        <View style={[
          Layout.fullWidth,
          Layout.rowHCenter,
          {
          padding: 20,
          height: 90,
          backgroundColor: theme.colors.primary
        }]}>
          <CacheImage
            source={{uri: "https://www.research-andme.com/wp-content/uploads/2018/03/3840x2160-dark-red-solid-color-background.jpg"}}
            style={{
              height: 45,
              width: 45,
              borderRadius: 8
            }}
          />
          <Text style={{
            fontWeight: "800",
            fontSize: 22,
            paddingLeft: 15
          }}>
            {CollectionInfo.app_name}
          </Text>
        </View>

        {/* separator */}
        <LinearGradient style={[
          Layout.fullWidth,
          { height: 5 }
        ]}
        colors={[
          addAlpha(theme.colors.secondary, 0.7),
          addAlpha(theme.colors.secondary, 0),
        ]}
        />

        {/* dashboard header */}
        <View style={[
          Layout.row,
          Layout.fullWidth,
          Layout.rowHCenter,
          Layout.justifyContentBetween,
          {
            paddingVertical: 2 * horizontalPadding,
            paddingHorizontal: horizontalPadding,
          }
        ]}>
          <Text style={[{
            fontSize: 34,
            fontWeight: "800"
          }]}>
            Dashboard
          </Text>

          <Dropdown
            data={[
              { value: Timescale.H },
              { value: Timescale.D },
              { value: Timescale.W },
              { value: Timescale.M },
              { value: Timescale.Y },
            ]}
            placeholder={Timescale.H}
            style={{
              height: 30,
              width: 140,
              paddingLeft: 10,
              paddingRight: 5,
              borderRadius: 5,
              backgroundColor: "#000080"
            }}
            labelField={"value"}
            valueField={"value"}
            value={timescale}
            iconColor={"white"}
            selectedTextStyle={{
              fontSize: 14,
              fontWeight: "700",
              color: "white"
            }}
            itemContainerStyle={{
              backgroundColor: theme.colors.primary
            }}
            itemTextStyle={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.secondary
            }}
            onChange={({ value }) => {
              setTimescale(value);
            }}
          />
        </View>

        {/* Top component with pagination bar */}
        <HomeCarousel setBottom={setBottom}
                      topHeight={180}
                      components={components}
                      padHTop={horizontalPadding} />

        {/* Bottom component */}
        <Animated.View
          style={{
            ...Layout.fullWidth,
            opacity: animationOpacity,
            // paddingHorizontal: horizontalPadding,
          }}
        >
          {components[bottomIndex].bottom}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
