import 'react-native-gesture-handler';
import React, { useEffect } from "react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor, reduxStorage } from "./store";
import database from '@react-native-firebase/database';
import ApplicationNavigator from './navigators/Application';
import './translations';
import auth from "@react-native-firebase/auth";
import ReduxParameters from "./ReduxParameters";
import { NotAuthorizedError } from "./services/modules/controller/Errors";
import CollectionNames from "./CollectionInfo";

const App = () => {
  useEffect(() => {
    // Assuming user is logged in
    const userId = auth().currentUser?.uid;

    if (userId !== undefined) {
      const reference = database().ref(
        `/${CollectionNames.online_detection}/${userId}`
      );

      // Set the /users/:userId value to true
      reference.set(true).then();

      // Remove the node whenever the client disconnects
      reference.onDisconnect()
        .remove()
        .then();
    } else if (!reduxStorage.getItem(ReduxParameters.testing)) {
      throw new NotAuthorizedError();
    }
  }, []);

  return (
    <Provider store={store}>
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate loading={null} persistor={persistor}>
        <ApplicationNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
