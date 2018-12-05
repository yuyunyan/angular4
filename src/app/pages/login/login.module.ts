import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

// used to create fake backend
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {fakeBackEndProvider} from '../../_helpers/fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import {NgIdleModule} from '@ng-idle/core';
import {LoginTimerService} from './../../../app/_services/loginTimer.service';
export const routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
     HttpModule,
     NgIdleModule
  ],
  declarations: [LoginComponent],
   providers: [ LoginTimerService],

})

export class LoginModule { }
