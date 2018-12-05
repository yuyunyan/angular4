import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RolesMasterComponent } from './roles-master/roles-master.component';
import { RolesPermissionsComponent } from './roles-permissions/roles-permissions.component';
import { RolesFieldsComponent } from './roles-fields/roles-fields.component';
import { HttpService} from './../../_services/httpService';
import { UsersService } from './../../_services/users.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';

import {AgGridModule} from 'ag-grid-angular/main';
import {RolesService} from './../../_services/roles.service';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { CheckRowComponent } from './../_sharedComponent/check-row/check-row.component';
import { CheckRowService } from './../_sharedComponent/check-row/check-row.service';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { RadioSelectComponent } from './../_sharedComponent/radio-select/radio-select.component';
import { RadioSelectService } from './../_sharedComponent/radio-select/radio-select.service';
import { RolesNavLinksComponent } from './roles-nav-links/roles-nav-links.component';
import { TreeModule } from 'angular-tree-component';

export const routes = [
  { path:'', component: RolesMasterComponent, data:{ breadcrumb:'Roles'}}
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    TreeModule,
    ReadonlyFieldModule,
    SharedComponentModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot()
    
  ],
  declarations: [
    RolesMasterComponent,
    RolesListComponent,
    RolesPermissionsComponent,
    RolesFieldsComponent,
    RolesNavLinksComponent
  ],
  providers:[UsersService,HttpService,RolesService, MockBackend, BaseRequestOptions,
    RadioSelectService, CheckRowService],
  entryComponents: [CheckRowComponent, CustomHeaderComponent, RadioSelectComponent]
})

export class RolesModule { }
