import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import {HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import {AgGridModule} from 'ag-grid-angular/main';
import {fakeBackEndProvider} from '../../_helpers/sales-orders-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { AvailabilityComponent } from './../_sharedComponent/availability/availability.component';
import { SalesOrdersGridComponent } from './sales-orders-grid/sales-orders-grid.component';
import { SalesOrdersMasterComponent } from './sales-orders-details/sales-orders-master/sales-orders-master.component';
import { SalesOrdersDetailsComponent } from './sales-orders-details/sales-orders-details/sales-orders-details.component';
import { SalesOrdersPartsComponent } from './sales-orders-details/sales-orders-parts/sales-orders-parts.component';
import { SalesOrdersSourcesComponent } from './sales-orders-details/sales-orders-sources/sales-orders-sources.component';
import { SalesOrderLineInfoComponent } from './sales-orders-details/sales-orders-line-info/sales-orders-line-info.component';
import { SalesOrderLineAllocationsComponent } from './sales-orders-details/sales-order-line-allocations/sales-order-line-allocations.component';
import { SalesOrderLineShipmentsComponent } from './sales-orders-details/sales-order-line-shipments/sales-order-line-shipments.component';
import { SalesOrdersExtraComponent } from './sales-orders-details/sales-orders-extra/sales-orders-extra.component';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { OrderFulfillmentService } from './../../_services/order-fulfillment.service';
import { SalesOrdersService } from './../../_services/sales-orders.service';
import {CarrierService} from './../../_services/carrier.service';
import {SharedService } from './../../_services/shared.service';
import { ContactsService } from './../../_services/contacts.service';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ErrorManagementService } from './../../_services/errorManagement.service';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionService } from './../../_services/permissions.service';
import { ItemTypeaheadGridComponent } from './../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { MfrInputComponent } from './../_sharedComponent/mfr-input/mfr-input.component';
import { ComoditySelectComponent } from './../_sharedComponent/comodity-select/comodity-select.component';
import { BusyModule } from 'angular2-busy';
import { LinkCreator } from './../../_utilities/linkCreaator';
import { CellMenuRendererComponent } from '../../_utilities/cellMenuGrid/cell-menu-renderer.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'sales-order-details',component:SalesOrdersMasterComponent,data:{breadcrumb:'sales-orders'}},
  { path:'',component:SalesOrdersGridComponent,data:{breadcrumb:'sales-grid'}} 
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    BusyModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    SplitPaneModule,
    ReadonlyFieldModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    })
  ],
  declarations: [

  SalesOrdersGridComponent,
  SalesOrdersMasterComponent,
  SalesOrdersDetailsComponent,
  SalesOrdersPartsComponent,
  SalesOrdersSourcesComponent,
  SalesOrderLineInfoComponent,
  SalesOrderLineAllocationsComponent,
  SalesOrderLineShipmentsComponent,
  SalesOrdersExtraComponent],
  providers:[HttpService, fakeBackEndProvider, MockBackend, BaseRequestOptions, ItemsService, QuoteService,OrderFulfillmentService, SalesOrdersService,
    SharedService, ItemsService, ContactsService, ErrorManagementService, CompleterService, PermissionService, LinkCreator,CarrierService],
  entryComponents: [SelectEditorComponent, DatePickerEditorComponent, CommentsComponent, CustomHeaderComponent,  AvailabilityComponent, 
    ItemTypeaheadGridComponent, MfrInputComponent, ComoditySelectComponent, CellMenuRendererComponent]
})

export class SalesOrdersModule { }
