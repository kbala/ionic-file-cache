import { Injectable } from '@angular/core';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Md5 } from 'md5-typescript';

@Injectable()

/**
 * It caches the files into device's cache directory.
 * If no TTL set, then each file will get expired in an hour and deleted from the cache directory.
 */
export class FileCacheProvider {
  private downloads: string[];
  private ttl: number = 60 * 60 * 1000;
  private enableCache: boolean = true;
  private dirName: string = 'ifc_cam73c8cm9rpst8y';
  private appCacheDirectory: string = this.file.cacheDirectory + this.dirName + '/';
  constructor(private file: File) {
    this.downloads = new Array();
    this.createCacheDir(this.dirName);
    setTimeout(() => {
      this.deleteExpired();
    }, 1000);
  }

  /**
   * Set time to live for the files. The files will be deleted from cache if it stays longer than ttl.
   * @param ttl in milliseconds
   */
  public setDefaultTTL(ttl: number) {
    this.ttl = ttl;
  }

  /**
   * Enable or disable the caching feature. The caching is disabled by default.
   * @param bool true or false
   */
  public setEnableCache(bool: boolean) {
    this.enableCache = bool;
  }
  /**
   * It downloads the files from given url and cache it into local file system.
   * It returns local file url if already cached, otherwise return the given url, and start caching behind.
   * @param url The web url that need to be cached.
   */
  public async cachedFile(url: string): Promise<string> {
    try {
      if (!this.enableCache) {
        return url;
      } else {
        return await this.getCachedFile(url);
      }
    } catch (err) {
      if (err.name === 'inprogress') {
        return url;
      } else {
        throw err;
      }
    }
  }

  /**
   * it just downloads the given urls and cache it locally. We can use this method if you want cache the files for later use.
   * @param urls Array of web urls that needs to be cached.
   */
  public cacheFiles(urls: string[]) {
    if (!this.enableCache) {
      return;
    }
    urls.forEach(url => {
      const fileKey = Md5.init(url);
      this.cache(url, this.appCacheDirectory, fileKey);
    });
  }

  /**
   * The respective local file of given web url will be deleted.
   * @param url The web url.
   */
  public async deleteCache(url: string): Promise<void> {
    if (!this.enableCache) {
      return;
    }
    try {
      const fileKey = Md5.init(url);
      await this.file.removeFile(this.appCacheDirectory, fileKey);
    } catch (error) {
      throw error;
    }
  }

  /**
   * It deletes all files from device cache directory.
   */
  public async clearCache() {
    if (!this.enableCache) {
      return;
    }
    try {
      await this.file.removeRecursively(this.file.cacheDirectory, this.dirName);
      await this.createCacheDir(this.dirName);
    } catch (error) {
      throw error;
    }
  }

  private async getCachedFile(url: string): Promise<string> {
    try {
      const fileKey = Md5.init(url);
      const isCached = await this.isCached(this.appCacheDirectory, fileKey);
      if (isCached) {
        return this.appCacheDirectory + fileKey;
      } else {
        return await this.cache(url, this.appCacheDirectory, fileKey);
      }
    } catch (error) {
      throw error;
    }
  }

  // private async getCache(path: string, fileKey: string) {
  //   try {
  //     const dirEntry = await this.file.resolveDirectoryUrl(path);
  //     return await this.file.getFile(dirEntry, fileKey, {});
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  private async cache(url: string, path: string, fileKey: string): Promise<string> {
    try {
      const index = this.downloads.indexOf(fileKey);
      if (index === -1) {
        this.downloads.push(fileKey);
        const fe: FileEntry = await this.downloadAndSaveFile(url, path, fileKey);
        setTimeout(() => {
          // this.updateMeta(fe);
        }, 100);
        this.downloads.splice(index, 1);
        return path + fileKey;
      } else {
        const error = new Error();
        error.message = 'Download already started for this file: ' + fileKey;
        error.name = 'inprogress';
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  private async downloadAndSaveFile(fileUrl: string, path: string, fileName: string) {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', fileUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = async e => {
        if (xhr.status === 200) {
          // Note: .response instead of .responseText
          try {
            const blob = new Blob([xhr.response]);
            await this.file.createFile(path, fileName, true);
            const fe:FileEntry = await this.file.writeFile(path, fileName, blob, { replace: true });
            resolve(fe);
          } catch (error) {
            reject(error);
          }
        }
      };
      xhr.onerror = e => {
        reject(e);
      };
      xhr.send();
    });
  }

  private async isCached(path: string, fileKey: string): Promise<boolean> {
    try {
      return await this.file.checkFile(path, fileKey);
    } catch (error) {
      return false;
    }
  }

  private updateMeta(file: FileEntry) {
    file.getMetadata(meta => {
      meta.modificationTime = new Date();
      file.setMetadata(null, null, meta);
    });
  }

  private async deleteExpired() {
    if (!this.enableCache) {
      return;
    }
    try {
      const files = await this.file.listDir(this.file.cacheDirectory, this.dirName);
      files.forEach(file => {
        file.getMetadata(meta => {
          const now = new Date();
          const diff = now.getTime() - meta.modificationTime.getTime();
          if (diff >= this.ttl) {
            file.remove(null);
          }
        });
      });
    } catch (error) {
      return;
    }
  }

  private async createCacheDir(dirName: string) {
    if (!this.enableCache) {
      return;
    }
    try {
      return await this.file.createDir(this.file.cacheDirectory, dirName, false);
    } catch (error) {
      return null;
    }
  }
}
