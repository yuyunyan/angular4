import 'pace-progress';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { PapaParseModule } from 'ngx-papaparse';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { routing } from './app.routing';
import { AppConfig } from './app.config';

import { AppComponent } from './app.component';
import { ErrorComponent } from './pages/error/error.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalErrorHandler } from './_errorhandler/globalErrorHandler';
import { HttpService } from './_services/httpService';
import { HttpModule } from '@angular/http';
import { ErrorManagementService } from './_services/errorManagement.service';
import { NgxPermissionsModule } from 'ngx-permissions';

import { NgIdleModule } from '@ng-idle/core';
import { LoginTimerService } from './../app/_services/loginTimer.service';
import { PermissionService } from './_services/permissions.service';
import { ImageUtilities } from './../app/_utilities/images/image-utilities'
@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDe_oVpi9eRSN99G4o6TwVjJbFBNr58NxE'
    }),
    routing,
    HttpModule,
    BrowserAnimationsModule,
    NgxPermissionsModule.forRoot(),
    NgIdleModule.forRoot(),
    PapaParseModule
  ],
  providers: [
    AppConfig,
    HttpService,
    LoginTimerService,
    PermissionService,
    ErrorManagementService,
    ImageUtilities,
     {
      provide: ErrorHandler, 
      useClass: GlobalErrorHandler
    },
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
