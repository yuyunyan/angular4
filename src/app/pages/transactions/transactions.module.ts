import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionsComponent} from './transactions.component';
import {AgGridModule} from 'ag-grid-angular/main';
import { TransactionsService} from './../../_services/transactions.service';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';


// used to create fake backend
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {fakeBackEndProvider} from '../../_helpers/fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';

import {NgIdleModule} from '@ng-idle/core';
import {LoginTimerService} from './../../../app/_services/loginTimer.service';
export const routes = [
  { path: '', component: TransactionsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    WidgetDirectivesModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
     HttpModule,
     NgIdleModule,  
     AgGridModule.withComponents( []),

  ],
  declarations: [TransactionsComponent],
   providers: [ LoginTimerService,
    TransactionsService,
    // providers used to create fake backend
    fakeBackEndProvider,
    MockBackend,
    BaseRequestOptions
],

})

export class TransactionsModule { }