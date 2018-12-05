
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import {HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {AgGridModule} from 'ag-grid-angular/main';
import {fakeBackEndProvider} from '../../_helpers/contactAccountFB';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { UsersService } from './../../_services/users.service';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { OwnershipAssignmentComponent } from './../_sharedComponent/ownership-assignment/ownership-assignment.component';
import { AccountsListComponent } from './accounts-list/accounts-list.component';
import { AccountsContactsService } from './../../_services/accountsContacts.service';
import { ContactDetailsComponent } from './../contacts/contact-details/contact-details.component';
import { CarrierService} from './../../_services/carrier.service';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { AccountContactsComponent} from './../contacts/account-contacts/account-contacts.component';
import { ContactProjectsGridComponent} from './../contacts/contact-projects-grid/contact-projects-grid.component';
import { ContactFocusesGridComponent } from './../contacts/contact-focuses-grid/contact-focuses-grid.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { PermissionService } from './../../_services/permissions.service';
import {ColumnFilterComponent} from './../_sharedComponent/column-filter/column-filter.component';
import { SupplierLineCardComponent } from './supplier-line-card/supplier-line-card.component';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { FocusObjectTypeComponent } from './../_sharedComponent/focus-object-type/focus-object-type.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { AccountGroupComponent } from './account-group-master/account-group-master.component';
import { AccountGroupListComponent } from './account-group-list/account-group-list.component';
import { GroupLineComponent } from './group-lines/group-lines.component';
import { AccountTypeaheadGridComponent } from './../_sharedComponent/account-typeheader-in-grid/account-typeheader-grid.component';
import { ContactEditorComponent } from './../_sharedComponent/contact-input/contact-input.component';
import { AccountsContactsSupplierComponent } from './accounts-contacts-supplier/accounts-contacts-supplier.component';
import { AccountsContactsCustomerComponent } from './accounts-contacts-customer/accounts-contacts-customer.component';
import { BusyModule } from 'angular2-busy';
import { FocusNameComponent } from './../_sharedComponent/focus-name/focus-name.component';
import { FreightForwarderComponent } from './freight-forwarder/freight-forwarder.component';
import { IsDefaultCheckboxComponent } from './freight-forwarder/is-default-checkbox/is-default-checkbox.component';
import{ContactHistoryGridComponent} from './../contacts/contact-history-grid/contact-history-grid.component';
import { SalesOrdersService} from '../../_services/sales-orders.service';
import { PurchaseOrdersService} from '../../_services/purchase-orders.service';
import {QuoteLineHistoryGridComponent} from './../contacts/quote-line-history-grid/quote-line-history-grid.component';
import { SalesOrderLineHistoryGridComponent } from './../contacts/sales-order-line-history-grid/sales-order-line-history-grid.component';
import { SourcesHistoryGridComponent } from './../contacts/sources-history-grid/sources-history-grid.component';
import { PurchaseOrderLineHistoryGridComponent } from './../contacts/purchase-order-line-history-grid/purchase-order-line-history-grid.component';
import { LinkCreator } from './../../_utilities/linkCreaator';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  {path:'',component:AccountsListComponent,data: {breadcrumb:'Account List'}},
  { path: 'suppliers', component: AccountsContactsSupplierComponent, data: { breadcrumb: 'Suppliers' } },
  { path: 'customers', component: AccountsContactsCustomerComponent, data: { breadcrumb: 'Customers' } },
  {path:'account-details',component:AccountDetailsComponent,data:{breadcrumb:'account-details'}},
  {path:'contact-details',component:ContactDetailsComponent,data:{breadcrumb:'contact-details'}},
 

];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BusyModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( [ColumnFilterComponent]),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    ReadonlyFieldModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }).ngModule,
  ],
  declarations: [
    AccountsListComponent,
    AccountDetailsComponent,
    ContactDetailsComponent,
    AccountContactsComponent,
    ContactProjectsGridComponent,
    ContactFocusesGridComponent,
    ContactListComponent,
    SupplierLineCardComponent,
    AccountGroupComponent,
    AccountGroupListComponent,
    GroupLineComponent,
    AccountsContactsSupplierComponent,
    AccountsContactsCustomerComponent,
    FreightForwarderComponent,
    IsDefaultCheckboxComponent,
    ContactHistoryGridComponent,
    QuoteLineHistoryGridComponent,
    SalesOrderLineHistoryGridComponent,
    SourcesHistoryGridComponent,
    PurchaseOrderLineHistoryGridComponent
  ],
  providers:[HttpService,AccountsContactsService,LinkCreator, PermissionService,SalesOrdersService,PurchaseOrdersService,
  fakeBackEndProvider, MockBackend, BaseRequestOptions, UsersService,CarrierService],
  entryComponents: [OwnershipAssignmentComponent, ContactListComponent,SelectEditorComponent,
    FocusObjectTypeComponent, CustomHeaderComponent, AccountTypeaheadGridComponent, ContactEditorComponent,
    FocusNameComponent,IsDefaultCheckboxComponent
  ]
})

export class AccountsContactsModule { }
 