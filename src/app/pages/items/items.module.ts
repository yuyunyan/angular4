import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {AgGridModule} from 'ag-grid-angular/main';
import {fakeBackEndProvider} from '../../_helpers/items-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ItemsGridComponent } from './items-grid/items-grid.component';
import { ItemsDetailComponent } from './items-detail/items-detail.component';
import { ItemsDetailMasterComponent } from './items-detail-master/items-detail-master.component';
import { ItemPurchaseOrderComponent } from './item-purchaseorders/item-purchaseorders.component';
import { ItemTechnicalDetailsComponent } from './items-technical-details/items-technical-details.component';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { ItemsService} from './../../_services/items.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { PermissionService } from './../../_services/permissions.service';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { BusyModule } from 'angular2-busy';
import { Ng2CompleterModule, CompleterService } from 'ng2-completer';
import { ItemInventoryComponent } from './item-inventory/item-inventory.component';
import { ItemAvailabilityComponent } from './item-availability/item-availability.component';
import { ItemSalesOrdersComponent } from './item-salesorders/item-salesorders.component';
import { ItemQuotesComponent } from './item-quotes/item-quotes.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'item-details',component:ItemsDetailMasterComponent,data:{breadcrumb:'item-details'}} ,
  { path:'',component:ItemsGridComponent,data:{breadcrumb:'items-grid'}} ,
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    BusyModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    ReadonlyFieldModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }),
    SharedComponentModule
  ],
  declarations: [
    ItemsDetailMasterComponent,
    ItemsGridComponent,
    ItemsDetailComponent,
    ItemPurchaseOrderComponent,
    ItemTechnicalDetailsComponent,
    ItemInventoryComponent,
    ItemAvailabilityComponent,
    ItemSalesOrdersComponent,
    ItemQuotesComponent
  ],
  providers:[HttpService,
  MockBackend, BaseRequestOptions, ItemsService, PermissionService,CompleterService]
})

export class ItemsModule { }
