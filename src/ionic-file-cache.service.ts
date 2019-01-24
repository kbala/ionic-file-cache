import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { File, FileEntry } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import {Md5} from "md5-typescript";


declare var window: any;

@Injectable()
export class IonicFileCacheService {
  constructor(private file:File, private fileTransfer: FileTransfer, private domSanitizer: DomSanitizer) { }

  public async getCachedFile(url: string) {
    return this.getFileEntry(url).then(fileEntry => {
      const fileUrl = window.Ionic.WebView.convertFileSrc(fileEntry.nativeURL);
      return this.domSanitizer.bypassSecurityTrustUrl(fileUrl);
    });
  }
  public cacheFiles(urls: string[]) {
    urls.forEach(url => {
      const fileKey = Md5.init(url);
      const path = this.file.cacheDirectory;
      this.cache(url, path + fileKey)
    })
  }

  public deleteCache(url: string) {
    const fileKey = Md5.init(url);
    const path = this.file.cacheDirectory;
    this.file.removeFile(path, fileKey);
  }

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
        return await this.cache(url, path + fileKey);
      }
    } catch (error) {
      throw error;
    }
  }

    private async getCache(path: string, fileKey: string) {
    return this.file.resolveDirectoryUrl(path).then(async dirEntry => {
      return this.file.getFile(dirEntry, fileKey, {}).then(fileEntry => {
        return fileEntry;
      });
    });
  }

  private async cache(url: string, localFilePath: string) {
    const fileTansferObject = this.fileTransfer.create();
    return fileTansferObject.download(url, localFilePath, true).then((fileEntry: FileEntry) => {
      return fileEntry;
    });
  }

  private async isCached(path: string, fileKey: string) {
    return this.file.checkFile(path, fileKey).then(bool => {
      return bool;
    }).catch(err => {
      return false
    });
  }
}
