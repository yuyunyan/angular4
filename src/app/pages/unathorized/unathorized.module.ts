import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnathorizedComponent } from './unathorized.component';


// used to create fake backend
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {fakeBackEndProvider} from '../../_helpers/fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import {HttpService} from './../../_services/httpService';
import { SimpleNotificationsModule } from 'angular2-notifications';

export const routes = [
  { path: '', component: UnathorizedComponent, pathMatch: 'full' }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ UnathorizedComponent ],
   providers: [ 
    HttpService
    ]
})
export class UnathorizedModule { }
