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

  public async getCachedFile(url: string): Promise<SafeUrl> {
    return this.getFileEntry(url).then(fileEntry => {
      const fileUrl = window.Ionic.WebView.convertFileSrc(fileEntry.nativeURL);
      return this.domSanitizer.bypassSecurityTrustUrl(fileUrl);
    });
  }
  public cacheFiles(urls: string[]) {
    urls.forEach(url => {
      const fileKey = Md5.init(url);
      const path = this.file.cacheDirectory;
      this.cache(url, path, fileKey);
    });
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
        return await this.cache(url, path, fileKey);
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
      throw new Error('Download already started for this file: ' + fileKey);
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
