import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {LicenseManager} from "ag-grid-enterprise/main";

if (environment.production) {
  enableProdMode();
}

LicenseManager.setLicenseKey("Sourceability_NA_LLC_SourcePortal_1Devs17_July_2018__MTUzMTc4MjAwMDAwMA==3bb5eb73df7f6a9f5a0b45b62480ee03");
platformBrowserDynamic().bootstrapModule(AppModule);
