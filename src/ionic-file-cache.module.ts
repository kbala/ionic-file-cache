import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { IonicModule } from 'ionic-angular';
@NgModule({
  imports: [IonicModule, BrowserModule],
})
export class IonicFileCacheModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonicFileCacheModule,
      providers: [File, FileTransfer],
    };
  }
}
