# ionic-file-cache

Ionic File Cache, is for all kind of files (images, videos, docs, etc) to cache it into the device's local cache directory. 

# Installation

### Install the ionic file cache

```bash
npm install ionic-file-cache --save
```

### Install the additional dependencies

This module requires ionic native plugins and latest ionic webview, Please install the following plugins
+ [File](https://ionicframework.com/docs/v3/native/file/)
+ [File Transfer](https://ionicframework.com/docs/v3/native/file-transfer/)
+ [Ionic Webview](https://github.com/ionic-team/cordova-plugin-ionic-webview)


# Usage

app.module.ts

```ts
import { FileCacheProvider } from "ionic-file-cache";


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
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
        this.getCachedFile('image url')
    }

    async getCachedFile(url: string) {
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