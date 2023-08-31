import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../hooks';
import { Brand } from '../../components';
import { setDefaultTheme } from '../../store/theme';
import { ApplicationScreenProps } from '../../../@types/navigation';
import DependencyTree from "../../services/modules/controller/DependencyTree";
import NetInfo from "@react-native-community/netinfo";
import { reduxStorage } from "../../store";
import ReduxParameters from "../../ReduxParameters";

const Startup = ({ navigation }: ApplicationScreenProps) => {
  const { Layout, Gutters } = useTheme();

  const init = async () => {
    /* activate connection listener */
    NetInfo.addEventListener(state => {
      reduxStorage.setItem(ReduxParameters.connectionType, state.type);
      reduxStorage.setItem(ReduxParameters.isConnected,
        state.isConnected == true && state.isInternetReachable === true
      );
    });

    await DependencyTree.loadControllers();

    /* Artificial timeout */
    await new Promise(resolve =>
      setTimeout(() => {
        resolve(true);
      }, 2000),
    );

    await setDefaultTheme({ theme: 'default', darkMode: null });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
      <Brand />
      <ActivityIndicator size={'large'} style={[Gutters.largeVMargin]} />
    </View>
  );
};

export default Startup;
