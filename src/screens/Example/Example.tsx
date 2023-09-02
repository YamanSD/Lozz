import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Brand } from "../../components";
import { useTheme } from "../../hooks";
// import { useLazyFetchOneQuery } from "../../services/modules/users";
import { changeTheme, ThemeState } from "../../store/theme";
import i18next from "i18next";
import { store } from "../../store";
import DependencyTree from "../../services/controller/DependencyTree";
import StatisticsBlock from "../../services/local_model/StatisticsBlock";
import { OrderStatus } from "../../services/model/types";

const Example = () => {
  const [url, setUrl] = useState("");
  const [hook, setHook] = useState(false);
  const b = "https://cdn.wallpapersafari.com/18/9/eviHxF.jpg";
  const r = "https://wallpapertag.com/wallpaper/full/8/4/8/793922-red-color-wallpaper-2048x1536-for-phones.jpg";
  const g = "https://getwallpapers.com/wallpaper/full/c/1/f/108144.jpg";

  useEffect(() => {
    // ImageManager.get(r).then(s => {
    //   setUrl(s);
    // })
    setUrl(r);
  }, []);

  useEffect(() => {
    console.log("UPDATED");
  }, [hook]);

  const { t } = useTranslation(['example', 'welcome']);
  const {
    Common,
    Fonts,
    Gutters,
    Layout,
    Images,
    darkMode: isDark,
  } = useTheme();
  const dispatch = useDispatch();

  let [i, setI] = useState(0);

  // const [fetchOne, { data, isSuccess, isLoading, isFetching }] =
    // useLazyFetchOneQuery();

  const onChangeTheme = ({ theme, darkMode }: Partial<ThemeState>) => {
    store.dispatch(changeTheme({ theme, darkMode }));
  };

  const onChangeLanguage = (lang: 'fr' | 'en') => {
    i18next.changeLanguage(lang);
  };

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[
        Layout.fullSize,
        Layout.fill,
        Layout.colCenter,
        Layout.scrollSpaceBetween,
      ]}
    >
      <View
        style={[
          Layout.fill,
          Layout.relative,
          Layout.fullWidth,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter,
        ]}
      >
        <View
          style={[
            Layout.absolute,
            {
              height: 250,
              width: 250,
              backgroundColor: isDark ? '#000000' : '#DFDFDF',
              borderRadius: 140,
            },
          ]}
        />
        <Image
          style={[
            Layout.absolute,
            {
              bottom: '-30%',
              left: 0,
            },
          ]}
          source={Images.sparkles.bottomLeft}
          resizeMode={'contain'}
        />
        <View
          style={[
            Layout.absolute,
            {
              height: 300,
              width: 300,
              transform: [{ translateY: 40 }],
            },
          ]}
        >
          <Brand height={300} width={300} />
        </View>
        <Image
          style={[
            Layout.absolute,
            Layout.fill,
            {
              top: 0,
              left: 0,
            },
          ]}
          source={Images.sparkles.topLeft}
          resizeMode={'contain'}
        />
        <Image
          style={[
            Layout.absolute,
            {
              top: '-5%',
              right: 0,
            },
          ]}
          source={Images.sparkles.top}
          resizeMode={'contain'}
        />
        <Image
          style={[
            Layout.absolute,
            {
              top: '15%',
              right: 20,
            },
          ]}
          source={Images.sparkles.topRight}
          resizeMode={'contain'}
        />
        <Image
          style={[
            Layout.absolute,
            {
              bottom: '-10%',
              right: 0,
            },
          ]}
          source={Images.sparkles.right}
          resizeMode={'contain'}
        />

        <Image
          style={[
            Layout.absolute,
            {
              top: '75%',
              right: 0,
            },
          ]}
          source={Images.sparkles.bottom}
          resizeMode={'contain'}
        />
        <Image
          style={[
            Layout.absolute,
            {
              top: '60%',
              right: 0,
            },
          ]}
          source={Images.sparkles.bottomRight}
          resizeMode={'contain'}
        />
      </View>
      <View
        style={[
          Layout.fill,
          Layout.justifyContentBetween,
          Layout.alignItemsStart,
          Layout.fullWidth,
          Gutters.regularHPadding,
        ]}
      >
        <View>
          <Text style={[Fonts.titleRegular]}>{t('welcome:title')}</Text>
          <Text
            style={[Fonts.textBold, Fonts.textRegular, Gutters.regularBMargin]}
          >
            {t('welcome:subtitle')}
          </Text>
          <Text style={[Fonts.textSmall, Fonts.textLight]}>
            {t('welcome:description')}
          </Text>
        </View>

        <View
          style={[
            Layout.row,
            Layout.justifyContentBetween,
            Layout.fullWidth,
            Gutters.smallTMargin,
          ]}
        >
          <TouchableOpacity
            style={[Common.button.circle, Gutters.regularBMargin]}
            onPress={async () => {
              let controller = DependencyTree.Products;

              for (let id of ["22"]) {
                controller.get(id).then((p) => {
                  console.log("ID:  ", id);
                  console.log("INV: ", p.inventory_quantities);
                  console.log("DIS: ", p.quantities);
                });
              }

              console.log("--------------------------------------------\n");
            }}
          >
            {/*{isFetching || isLoading ? (*/}
            {/*  <ActivityIndicator />*/}
            {/*) : (*/}
            {/*  <Image*/}
            {/*    source={Images.icons.send}*/}
            {/*    style={{ tintColor: isDark ? '#A6A4F0' : '#44427D' }}*/}
            {/*  />*/}
            {/*)}*/}
          </TouchableOpacity>

          <TouchableOpacity
            style={[Common.button.circle, Gutters.regularBMargin]}
            onPress={async () => {
              let controller = DependencyTree.Orders;
              let rController = DependencyTree.Restocks;
              let eController = DependencyTree.Employees;
              let pController = DependencyTree.Products;
              let exController = DependencyTree.Expenses;
              // await rController.revoke("2023073022171093374");

              // exController.hook = [hook, setHook];

              // await rController.create({
              //   quantities: {
              //     "22_xl_black": -100,
              //     "22_xl_black_INV": -100,
              //     "11_xl_black": -100,
              //     "11_xl_black_INV": -100,
              //     "11_xl_red": -100,
              //     "11_xl_red_INV": -100,
              //     "11_s_black": -100,
              //     "11_s_black_INV": -100,
              //     "11_s_green": -100,
              //     "11_s_green_INV": -100,
              //   }
              // });

              // controller.hook = useState(false);

              // StatisticsBlock.clear();

              // let p22 = await pController.get("22");
              // let p11 = await pController.get("11");

              // await controller.create({
              //   zone: "Beirut",
              //   customer_id: "+96176182206",
              //   province: 2,
              //   phone_number: "+96176182206",
              //   address: "Beirut, Haret Al-Kilab, Al-Hamir Building 1st floor",
              //   note: "Good customer",
              //   courier_id: "Aramex",
              //   status: OrderStatus.confirmed,
              //   products: {
              //     "22_xl_black": {
              //       quantity: -5,
              //       price: p22.getTotalPrice("xl_black").data,
              //       cost: p22.getTotalCost("xl_black").data
              //     }
              //   }
              // });

              // await controller.receive("9");

              // await exController.create({
              //   value: 10,
              //   date: new Date(),
              //   description: "Cash withdraw",
              //   employee_id: CollectionInfo.testing_id
              // });

              // StatisticsBlock.clear();

              // console.log(StatisticsBlock.getYearStatistics("2023"))

              // await eController.create({
              //   phone_number: CollectionInfo.testing_id,
              //   salary: 0,
              //   role: EmployeeRole.owner,
              //   first_name: "Yaman",
              //   last_name: "Seraj",
              //   birthday: new Date(2003, 4, 3),
              //   gender: true,
              //   commission_percent: 0.10
              // });

              // await controller.cancel("1");

              // await controller.create({
              //   zone: "Beirut",
              //   province: 6,
              //   phone_number: "+96172222222",
              //   customer_id: "+96172222222",
              //   status: OrderStatus.pending,
              //   products: {
              //     "99_blue_l": {
              //       quantity: -5,
              //       cost: p99.getTotalCost("blue_l").data,
              //       price: p99.getTotalPrice("blue_l").data
              //     },
              //     "88_blue_l": {
              //       quantity: -5,
              //       cost: p88.getTotalCost("blue_l").data,
              //       price: p88.getTotalPrice("blue_l").data
              //     },
              //   }
              // });

              // let o1p = await controller.get("pending_3");
              // await controller.confirm("pending_3");
              Alert.alert("DONE 2");
            }}
          >
            <Image
              source={Images.icons.colors}
              style={{ tintColor: isDark ? '#A6A4F0' : '#44427D' }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[Common.button.circle, Gutters.regularBMargin]}
            onPress={async () => {
                StatisticsBlock.clear();

                Alert.alert("DONE 3");
              }
            }
          >
            <Image
              source={Images.icons.translate}
              style={{ tintColor: isDark ? '#A6A4F0' : '#44427D' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Example;
