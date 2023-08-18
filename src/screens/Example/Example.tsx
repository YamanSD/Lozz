import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Brand } from "../../components";
import { useTheme } from "../../hooks";
import { useLazyFetchOneQuery } from "../../services/modules/users";
import { changeTheme, ThemeState } from "../../store/theme";
import i18next from "i18next";
import { reduxStorage, store } from "../../store";
import ReduxParameters from "../../ReduxParameters";
import DependencyTree from "../../services/modules/controller/DependencyTree";
import { EmployeeRole, InformationType } from "../../services/modules/model/types";


enum test {
  a = 0,
  b
}

const Example = () => {
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

  const [fetchOne, { data, isSuccess, isLoading, isFetching }] =
    useLazyFetchOneQuery();

  useEffect(() => {
    if (isSuccess && data?.name) {
      Alert.alert(t('example:helloUser', { name: data.name }));
    }
  }, [isSuccess, data]);

  useEffect(() => {
    reduxStorage.setItem(ReduxParameters.testing, true);
  }, []);

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
            onPress={() => fetchOne(`${Math.ceil(Math.random() * 10 + 1)}`)}
          >
            {isFetching || isLoading ? (
              <ActivityIndicator />
            ) : (
              <Image
                source={Images.icons.send}
                style={{ tintColor: isDark ? '#A6A4F0' : '#44427D' }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[Common.button.circle, Gutters.regularBMargin]}
            onPress={async () => {
              onChangeTheme({ darkMode: !isDark });

              // let controller = DependencyTree.Restocks;
              let pController = DependencyTree.Products;

              // pController.removeCache("88");

              // await controller.create({
              //   to_inventory: false,
              //   note: "Restock Display only Test",
              //   quantities: {
              //     "88_red_s": 100
              //   }
              // });

              // await controller.revoke("2023071819154525281", null);


              // for (let id of controller.idSet) {
              //   console.log((await controller.get(id)).data);
              // }

              // console.log((await pController.get("88")).quantities);
              // console.log((await pController.get("88")).inventory_quantities)

              // await controller.create({
              //   [InformationType.provinces]: {
              //     names: ["Beirut", "Outside-Beirut"]
              //   },
              //   [InformationType.rate]: {
              //     buyUsdRate: 89_000,
              //     sellUsdRate: 90_000,
              //     roundToNearestLbp: 5_000,
              //     roundToNearestUsd: 0.01
              //   }
              // });

              // await controller.create({
              //   name: "Bravo",
              //   shipping_fees: {
              //     "Beirut": [1.5, 0],
              //     "Outside-Beirut": [2, 0]
              //   }
              // });

              // await controller.create({
              //   name: "Bravo",
              // });

              // await controller.create({
              //   name: "Cotton",
              //   description: "100% Cotton Pyjama, made in turkey",
              //   discount: {
              //     "red_s": [0.5, 0]
              //   },
              //   instructions: {
              //     "Washing": "Do not boil over 150 degrees C"
              //   },
              //   id: "88",
              //   cost: [2.5, 0],
              //   price: [5, 0],
              //   quantities: {
              //     red_s: 20,
              //     red_m: 15,
              //     red_l: 10,
              //     green_s: 20,
              //     green_m: 15,
              //     green_l: 0,
              //     blue_s: 20,
              //     blue_m: 15,
              //     blue_l: 10,
              //   },
              //   added_price: {
              //     green_l: [2, 0]
              //   },
              //   vendor_id: "Saleh",
              //   category_id: "Pyjamas",
              //   images: {
              //     red_s: ["http://dreamicus.com/red.html"],
              //     green_s: ["https://imageonline.co/downloading.php?imagename=B21.png&color=green"],
              //   }
              // });

              // console.log(await controller.getLocalProperties());
              // await controller.pushUpdateProperties();
              // let controller = DependencyTree.Vendors;
              //
              // let Saleh = await controller.get("Saleh");
              // console.log(Saleh.data);
              // controller.triggerHook();
              // const mohamad = await controller.get("Mohamad");
              // mohamad.emails = ["yamansirajbs@gmail.com"];
              //
              // await controller.update(mohamad);
              //
              // // setI(i + 1);
              // // console.log(controller.idSet);
              console.log((await pController.get("88")).data);
              Alert.alert("DONE");
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
                onChangeLanguage(i18next.language === 'fr' ? 'en' : 'fr');
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
