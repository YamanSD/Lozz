import BaseController, { ControllerFlag } from "./BaseController";
import { Generic, properties } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";

export default class InformationController extends BaseController<properties> {
  private static readonly flag: number = ControllerFlag.can_update;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.information.name,
      CollectionNames.information.id,
      server ?? firestore,
      InformationController.flag
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  public async create(_?: Generic) {

  }
}
