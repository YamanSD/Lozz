import RNFS from "react-native-fs";
import { CheckDirError, ImageDownloadError, ImageNameExistsError, NoConnectionError } from "../controller/Errors";
import { firebase } from "@react-native-firebase/storage";
import CollectionInfo from "../../CollectionInfo";
import BaseController from "../controller/BaseController";

/**
 * Class responsible for the retrieving images and saving.
 */
export default class ImagesManager {
  /* path for the directory */
  private static directory =
    `${RNFS.DocumentDirectoryPath}/${CollectionInfo.app_name}/images/`;

  /**
   * @returns the firebase storage
   */
  public static get storage() {
    return firebase.app().storage(`gs://${CollectionInfo.app_name}`);
  }

  /**
   * This method is useful for determining the upload progress
   *
   * @param src local path to the image to be uploaded
   * @returns the upload task and the download URL
   */
  public static async uploadImage(src: string) {
    if (!BaseController.isConnected) {
      throw new NoConnectionError();
    }

    const reference = this.storage.ref(src);
    const url = await reference.getDownloadURL();

    await this.setCache(src, url);

    return {
      task: reference.putFile(this.getPath(url)),
      url: url
    };
  }

  /**
   * Retrieves an image from cache or downloads and caches it if not found.
   *
   * @param imageUrl - The URL of the image to retrieve.
   * @returns Promise that resolves to the local path of the cached image.
   */
  public static async get(imageUrl: string): Promise<string | undefined> {
    /* check the images directory */
    await this.checkDirectory();

    const imagePath = this.getPath(imageUrl);

    if (!(await RNFS.exists(imagePath))) {
      await this.downloadImage(imageUrl);
    }

    return imagePath;
  }

  /**
   * @param url of the image to be deleted completely from database
   */
  public static async deleteImage(url: string) {
    const reference = this.storage.refFromURL(url);
    const path = this.getPath(url);

    if (await RNFS.exists(path)) {
      await reference.delete();
      await RNFS.unlink(path);
    }
  }

  /**
   * Clears the directory containing the images
   */
  public static async clear() {
    if (await RNFS.exists(this.directory)) {
      await RNFS.unlink(this.directory);
    }
  }

  /**
   * Check the cache directory, if it exists do nothing.
   * Otherwise, create it.
   */
  private static async checkDirectory() {
    try {
      if (await RNFS.exists(this.directory)) {
        return;
      }

      await RNFS.mkdir(this.directory);
    } catch (error) {
      throw new CheckDirError();
    }
  }

  /**
   * @param url to generate the local path for
   * @returns local path for the URL
   */
  private static getPath(url: string): string {
    return `${this.directory}${url.split("/").pop()}`;
  }

  /**
   * Downloads an image from the provided URL and stores it in cache.
   * @param imageUrl - The URL of the image to download.
   * @returns Promise that resolves to the local path of the downloaded image.
   */
  private static async downloadImage(imageUrl: string): Promise<string | undefined> {
    if (!BaseController.isConnected) {
      throw new ImageDownloadError();
    }

    /* check the images directory */
    await this.checkDirectory();

    const imagePath = this.getPath(imageUrl);
    const response = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: imagePath
    }).promise;

    if (response.statusCode === 200) {
      return imagePath;
    }

    return undefined;
  }

  /**
   * Copies the image from "dest" to "src".
   *
   * @param src source path for the image
   * @param dest destination path for the image
   * @private
   */
  private static async setCache(src: string, dest: string) {
    const imagePath = this.getPath(dest);

    if (await RNFS.exists(imagePath)) {
      throw new ImageNameExistsError();
    }

    await RNFS.copyFile(src, imagePath);
  }
}
