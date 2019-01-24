import { ModuleWithProviders, NgModule } from "@angular/core";
import { File } from "@ionic-native/file";
import { FileTransfer } from "@ionic-native/file-transfer";
import { IonicFileCacheService } from "./ionic-file-cache.service";
@NgModule({
    imports: [IonicFileCacheModule.forRoot()]
})
export class IonicFileCacheModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: IonicFileCacheModule,
            providers: [IonicFileCacheService, File, FileTransfer]
        }
    }
}