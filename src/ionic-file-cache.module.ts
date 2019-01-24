import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { IonicModule } from 'ionic-angular';
import { IonicFileCacheService } from './ionic-file-cache.service';
@NgModule({
  imports: [IonicModule, BrowserModule],
})
export class IonicFileCacheModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonicFileCacheModule,
      providers: [File, FileTransfer, IonicFileCacheService],
    };
  }
}
