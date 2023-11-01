import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { persistor, reduxStorage, store } from "./store";
import database from "@react-native-firebase/database";
import ApplicationNavigator from "./navigators/Application";
import "./translations";
import auth from "@react-native-firebase/auth";
import ReduxParameters from "./ReduxParameters";
import { NotAuthorizedError } from "./services/controller/Errors";
import CollectionNames from "./CollectionInfo";
import DependencyTree from "./services/controller/DependencyTree";

/* better performance, uses native views */
import { enableScreens } from "react-native-screens";

enableScreens();


const App = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    reduxStorage.setItem(
      ReduxParameters.testing,
      ReduxParameters.testingValue
    );

    return auth().onAuthStateChanged(async (user) => {
      if (initializing) {
        setInitializing(false);
      }

      if (user !== null) {
        const userId = user.phoneNumber;

        if (userId === null) {
          throw new NotAuthorizedError();
        }

        const employee = await DependencyTree.Employees.get(userId);

        reduxStorage.setItem(
          ReduxParameters.currentEmployee,
          employee.data
        );

        const reference = database().ref(
          `/${CollectionNames.online_detection}/${userId}`
        );

        // Set the /users/:userId value to true
        reference.set(true).then(
          () => {
            setLogged(true);
          }
        );

        // Remove the node whenever the client disconnects
        reference.onDisconnect()
          .remove()
          .then();
      } else if (reduxStorage.getItem(ReduxParameters.testing)) {
        setLogged(true);
      }
    });
  }, []);

  if (initializing) {
    return null;
  }

  // TODO when working on frontend, add the login page
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
