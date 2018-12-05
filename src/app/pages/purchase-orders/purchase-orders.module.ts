import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { AgGridModule} from 'ag-grid-angular/main';
import { fakeBackEndProvider} from '../../_helpers/purchase-orders-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { PurchaseOrdersGridComponent } from './purchase-orders-grid/purchase-orders-grid.component';
import { PurchaseOrdersMasterComponent } from './purchase-orders-details/purchase-orders-master/purchase-orders-master.component';
import { PurchaseOrdersService } from './../../_services/purchase-orders.service';
import { PurchaseOrderDetailsComponent } from './purchase-orders-details/purchase-order-details/purchase-order-details.component';
import { PurchaseOrdersHeaderComponent } from './purchase-orders-details/purchase-orders-header/purchase-orders-header.component';
import { PurchaseOrdersExtraComponent } from './purchase-orders-details/purchase-orders-extra/purchase-orders-extra.component';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { PurchaseOrdersPartsComponent } from './purchase-orders-details/purchase-orders-parts/purchase-orders-parts.component';
import { LocationService } from './../../_services/locations.service';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import {SharedService} from './../../_services/shared.service';
import { ErrorManagementService } from './../../_services/errorManagement.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { PermissionService } from './../../_services/permissions.service';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { ItemSpecBuyComponent } from './purchase-orders-details/purchase-orders-parts/item-spec-buy/item-spec-buy.component';
import { UnallocatedSoLinesComponent } from './purchase-orders-details/purchase-orders-parts/unallocated-so-lines/unallocated-so-lines.component';
import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { ItemTypeaheadGridComponent } from './../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { MfrInputComponent } from './../_sharedComponent/mfr-input/mfr-input.component';
import { ComoditySelectComponent } from './../_sharedComponent/comodity-select/comodity-select.component';
import { BusyModule } from 'angular2-busy';
import { LinkCreator } from './../../_utilities/linkCreaator';
import { OrderFulfillmentService } from './../../_services/order-fulfillment.service';
import { CarrierService } from './../../_services/carrier.service';
import { CellMenuRendererComponent } from '../../_utilities/cellMenuGrid/cell-menu-renderer.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: 'purchase-order-details', component: PurchaseOrdersMasterComponent, data:{ breadcrumb:'purchase-orders'}},
  { path:'', component: PurchaseOrdersGridComponent, data: { breadcrumb:'purchases-grid'}} 
];

@NgModule({
  imports: [                                                                                                                                                                                    
    CommonModule,
    FormsModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    ReadonlyFieldModule,
    SharedComponentModule,
    SplitPaneModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }),
    BusyModule
  ],
  declarations: [
    PurchaseOrdersGridComponent,
    PurchaseOrdersMasterComponent,
    PurchaseOrdersExtraComponent,
    PurchaseOrderDetailsComponent,
    PurchaseOrdersHeaderComponent,
    PurchaseOrdersExtraComponent,
    PurchaseOrdersPartsComponent,
    ItemSpecBuyComponent,
    UnallocatedSoLinesComponent
  ],
  providers:[HttpService, fakeBackEndProvider, MockBackend, BaseRequestOptions, PurchaseOrdersService, ItemsService,
    QuoteService, LocationService, SharedService, OrderFulfillmentService, ErrorManagementService, PermissionService, CompleterService,LinkCreator,CarrierService],
  entryComponents: [SelectEditorComponent, CommentsComponent, DatePickerEditorComponent, CustomHeaderComponent, NumericInputComponent,
                    CustomHeaderComponent,ItemTypeaheadGridComponent, MfrInputComponent, ComoditySelectComponent, CellMenuRendererComponent]
})

export class PurchaseOrdersModule { }
