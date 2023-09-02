import RNFS from 'react-native-fs';
import { Platform } from "react-native";
import { CheckDirError, ImageDownloadError, NoConnectionError } from "../controller/Errors";
import { firebase } from '@react-native-firebase/storage';
import CollectionInfo from "../../CollectionInfo";
import BaseController from "../controller/BaseController";


/**
 * Class responsible for the retrieving images and saving.
 */
export default class ImagesManager {
  /* path for the directory */
  private static directory =
    `file://+${
    Platform.OS === 'android' 
      ? RNFS.DocumentDirectoryPath 
      : RNFS.MainBundlePath
  }/${CollectionInfo.app_name}/images/`;

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
    return `${this.directory}${url}`;
  }

  /**
   * Downloads an image from the provided URL and stores it in cache.
   * @param imageUrl - The URL of the image to download.
   * @returns Promise that resolves to the local path of the downloaded image.
   */
  private static async downloadImage(imageUrl: string): Promise<string> {
    if (!BaseController.isConnected) {
      throw new NoConnectionError();
    }

    /* check the images directory */
    await this.checkDirectory();

    const imagePath = this.getPath(imageUrl);
    const response = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: imagePath,
    }).promise;

    if (response.statusCode === 200) {
      return imagePath;
    }

    throw new ImageDownloadError();
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

    await RNFS.copyFile(src, imagePath);
  }

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
  public static async get(imageUrl: string): Promise<string> {
    /* check the images directory */
    await this.checkDirectory();

    const imagePath = this.getPath(imageUrl);

    if (await RNFS.exists(imagePath)) {
      return imagePath;
    } else {
      return await this.downloadImage(imageUrl);
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
}
