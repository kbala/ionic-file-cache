# ionic-file-cache

Ionic File Cache, is for all kind of files (images, videos, docs, etc) to cache it into the device's local cache directory. 

# Installation

### Install the ionic file cache

```bash
npm install ionic-file-cache@1 --save
```

### Install the additional dependencies

This module requires ionic native plugins and latest ionic webview, Please install the following plugins
+ [File](https://ionicframework.com/docs/v3/native/file/)
+ [File Transfer](https://ionicframework.com/docs/v3/native/file-transfer/)


# Usage

app.module.ts

```ts
import { FileCacheProvider } from "ionic-file-cache";
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';


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

    public imageUrl: string = "assets/imgs/loading.gif";

    constructor(private fileCachePvdr:FileCacheProvider){
        // Cache a live url
        this.getCachedFile('image url')
    }

    async getCachedFile(url: string) {
        // It returns the cached url
        this.imageUrl = await this.fileCachePvdr.cachedFile(url);
    }
}
```

MediaComponent.html
```html
<div class="thumbnail">
    <img class="image" [src]="imageUrl">
</div>
```