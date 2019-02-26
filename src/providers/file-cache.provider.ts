import { Injectable } from '@angular/core';
import { File, FileEntry, RemoveResult } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Md5 } from 'md5-typescript';

declare var window: any;

@Injectable()
export class FileCacheProvider {
  private downloads: string[];
  private ttl: number = 60 * 60;
  constructor(private file: File, private fileTransfer: FileTransfer) {
    this.downloads = new Array();
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
   * It downloads the files from given url and cache it into local file system.
   * It returns local file url if already cached, otherwise return the given url, and start caching behind.
   * @param url The web url that need to be cached.
   */
  public async cachedFile(url: string): Promise<string> {
    try {
      return await this.getCachedFile(url);
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
  public async deleteCache(url: string): Promise<RemoveResult> {
    const fileKey = Md5.init(url);
    const path = this.file.cacheDirectory;
    return await this.file.removeFile(path, fileKey);
  }

  /**
   * It deletes all files from device cache directory.
   */
  public async clearCache(): Promise<RemoveResult> {
    try {
      return await this.file.removeDir(this.file.cacheDirectory, '');
    } catch (error) {
      throw error;
    }
  }

  private async getCachedFile(url: string): Promise<string> {
    try {
      const fileKey = Md5.init(url);

      const path = this.file.cacheDirectory;
      const isCached = await this.isCached(path, fileKey);
      if (isCached) {
        return path + fileKey;
      } else {
        return await this.cache(url, path, fileKey);
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
        const fileTansferObject = this.fileTransfer.create();
        const fe: FileEntry = await fileTansferObject.download(url, path + fileKey, true);
        setTimeout(() => {
          this.updateMeta(fe);
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
    try {
      const files = await this.file.listDir(this.file.cacheDirectory, '/');
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
      throw error;
    }
  }
}
