import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { File, FileEntry } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Md5 } from 'md5-typescript';

declare var window: any;

@Injectable()
export class FileCacheProvider {
  private downloads: string[];
  constructor(private file: File, private fileTransfer: FileTransfer, private domSanitizer: DomSanitizer) {
    this.downloads = new Array();
  }

  /**
   * It downloads the files from given url and cache it into local file system.
   * It returns local file url if already cached, otherwise return the given url, and start caching behind.
   * It return the url cached by `domSanitizer.bypassSecurityTrustUrl()`
   * @param url The web url that need to be cached.
   */
  public async getCachedFile(url: string): Promise<SafeUrl> {
    return this.getFileEntry(url)
      .then(fileEntry => {
        const fileUrl = window.Ionic.WebView.convertFileSrc(fileEntry.nativeURL);
        return this.domSanitizer.bypassSecurityTrustUrl(fileUrl);
      })
      .catch(err => {
        if (err.name === 'inprogress') {
          return url;
        } else {
          throw err;
        }
      });
  }

  /**
   * it just downloads the given urls and cache it locally. We can use this method if you want cache the files for later use.
   * @param urls Array of web urls that needs to be cached.
   */
  public cacheFiles(urls: string[]) {
    urls.forEach(url => {
      const fileKey = Md5.init(url);
      const path = this.file.cacheDirectory;
      this.cache(url, path, fileKey);
    });
  }

  /**
   * The respective local file of given web url will be deleted.
   * @param url The web url.
   */
  public deleteCache(url: string) {
    const fileKey = Md5.init(url);
    const path = this.file.cacheDirectory;
    this.file.removeFile(path, fileKey);
  }

  /**
   * It deletes all files from device cache directory.
   */
  public async clearCache() {
    return this.file.removeDir(this.file.cacheDirectory, '').then(result => {
      return result.success;
    });
  }

  private async getFileEntry(url: string) {
    try {
      const fileKey = Md5.init(url);

      const path = this.file.cacheDirectory;
      const isCached = await this.isCached(path, fileKey);
      if (isCached) {
        return await this.getCache(path, fileKey);
      } else {
        return await this.cache(url, path, fileKey);
      }
    } catch (error) {
      throw error;
    }
  }

  private async getCache(path: string, fileKey: string) {
    try {
      const dirEntry = await this.file.resolveDirectoryUrl(path);
      return await this.file.getFile(dirEntry, fileKey, {});
    } catch (error) {
      throw error;
    }
  }

  private async cache(url: string, path: string, fileKey: string) {
    const index = this.downloads.indexOf(fileKey);
    if (index === -1) {
      this.downloads.push(fileKey);
      const fileTansferObject = this.fileTransfer.create();
      return fileTansferObject.download(url, path + fileKey, true).then((fileEntry: FileEntry) => {
        this.downloads.splice(index, 1);
        return fileEntry;
      });
    } else {
      const error = new Error();
      error.message = 'Download already started for this file: ' + fileKey;
      error.name = 'inprogress';
      throw error;
    }
  }

  private async isCached(path: string, fileKey: string) {
    return this.file
      .checkFile(path, fileKey)
      .then(bool => {
        return bool;
      })
      .catch(err => {
        return false;
      });
  }
}
