import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicRestock, restock, RestockSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Restock from "../model/restock";
import { IdDoesNotExistError, IllegalStateError, NoDeleteError, NoUpdateError } from "./Errors";
import BaseModel from "../model/BaseModel";


export default class RestockController extends BaseController<restock> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.restock.name,
      CollectionNames.restock.id,
      server ?? firestore,
      RestockController.flag,
      RestockSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @param id of the restock to be fetched
   * @returns restock data
   * @throws IdDoesNotExistError if the id does not belong to a restock
   */
  public async get(id: string) {
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Restock(data);
  }

  /**
   * @param data basic raw data to create a restock
   * @throws IdAlreadyExistsError if the name of the restock is taken
   */
  public async create(data: basicRestock) {
    await this.createServer(BaseModel.getRandomTimestamp(2),
      this.fillDataGaps(data));
    await this.uploadIds();
  }

  public activateListener() {
    this.collection.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async (change) => {
        const document = change.doc;
        const data: restock = document.data() as restock;
        const id = document.id;

        if (change.type === "added") {

          this.setCache(id, data);
        } else if (change.type === "removed") {
          // TODO finish when ProductsController is done
          this.removeCache(id);
        } else {
          throw new IllegalStateError();
        }
      });
    });
  }

  /**
   * @param model new model of the restock
   * @throws IdDoesNotExistError if the restock does not exist
   */
  public async update(model: Restock) {
    throw new NoUpdateError();
  }

  /**
   * @param id to be deleted completely and its effects revoked
   * @throws NoDeleteError if the restock is not deletable
   */
  public async revock(id: string) {
    const restock = await this.get(id);

    if (!restock.deletable) {
      throw new NoDeleteError();
    }

    await this.removeServer(id);
  }

  /**
   * @param data basic restock data
   * @returns restock data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicRestock): restock {
    return super.fillDataGaps({
      trail: this.generateInitialTrail()
    });
  }
}
