import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import {HttpService} from './../../_services/httpService';
import { UsersService } from './../../_services/users.service';
import { HttpModule } from '@angular/http';
import { UserManagementComponent } from './user-management.component';
import {BrowserModule} from "@angular/platform-browser";
import {AgGridModule} from "ag-grid-angular/main";
import {ClickableParentComponent} from "./clickable.parent.component";
import {ClickableComponent} from "./clickable.component";

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: '', component: UserManagementComponent, data: { breadcrumb: 'Ckeditor' } }
 
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    AgGridModule.withComponents( []),
    
  ],
  declarations: [
    UserManagementComponent,
    ClickableParentComponent,
    ClickableComponent
  ],
  providers:[UsersService,HttpService],
   entryComponents: [
        ClickableParentComponent,
        ClickableComponent
    ]
})

export class UserManagementModule { }
