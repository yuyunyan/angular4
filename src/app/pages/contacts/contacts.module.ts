import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import {HttpService} from './../../_services/httpService';
import { ContactsService} from './../../_services/contacts.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {AgGridModule} from 'ag-grid-angular/main';
import {fakeBackEndProvider} from '../../_helpers/contactAccountFB';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { BusyModule } from 'angular2-busy';
import { LocationService } from './../../_services/locations.service';
import { UsersService } from './../../_services/users.service';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { OwnershipAssignmentComponent } from './../_sharedComponent/ownership-assignment/ownership-assignment.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { LinkCreator } from './../../_utilities/linkCreaator';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  {path:'account-details',component:AccountDetailsComponent,data:{breadcrumb:'account-details'}},
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    BusyModule,
    ReactiveFormsModule,
    WidgetDirectivesModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,

    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    ReadonlyFieldModule
  ],
  declarations: [
    AccountDetailsComponent
   
  ],
  providers:[HttpService,LinkCreator,ContactsService, LocationService,
  fakeBackEndProvider, MockBackend, BaseRequestOptions, UsersService],
  entryComponents: [OwnershipAssignmentComponent, CustomHeaderComponent]
})

export class ContactsModule { }
