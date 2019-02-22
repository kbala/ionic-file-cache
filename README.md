# ionic-file-cache

Ionic File Cache, is for all kind of files (images, videos, docs, etc) to cache it into the device's local cache directory. 

# Installation

### Install the ionic file cache

For Ionic v3, Click [here](https://github.com/amindia/ionic-file-cache/tree/ionicv3)

```bash
npm install ionic-file-cache --save
```

### Install the additional dependencies

This module requires ionic native plugins and latest ionic webview, Please install the following plugins
+ [File](https://ionicframework.com/docs/native/file)
+ [File Transfer](https://ionicframework.com/docs/native/file-transfer)
+ [Ionic Webview](https://github.com/ionic-team/cordova-plugin-ionic-webview) version >=3.0.0


# Usage

app.module.ts

```ts
import { FileCacheProvider } from "ionic-file-cache";
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

@NgModule({
  .
  .
  .
  providers: [
    File,
    FileTransfer,
    FileCacheProvider    
  ]
})
export class AppModule { }
```

MediaComponent.ts
```ts
import { FileCacheProvider } from 'ionic-file-cache';

@Injectable()
export class MediaComponent {

    public imageUrl: SafeUrl = "assets/imgs/loading.gif";

    constructor(private fileCachePvdr:FileCacheProvider){
        // Cache a live url
        this.getCachedFile('image url')
    }

    async getCachedFile(url: string) {
        // It returns the cached url which is sanitized by `domSanitizer.bypassSecurityTrustUrl()`
        this.imageUrl = await this.fileCachePvdr.getCachedFile(url);
    }
}
```

MediaComponent.html
```html
<div class="thumbnail">
    <img class="image" [src]="imageUrl">
</div>
```