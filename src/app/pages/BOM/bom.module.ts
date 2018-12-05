import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from "angular2-datatable";
import { PipesModule } from '../../theme/pipes/pipes.module';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { BusyModule } from 'angular2-busy';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { AgGridModule} from 'ag-grid-angular/main';
import { BomListComponent } from './lists/lists.component';
import { BomMatchComponent } from './match/match.component';
import { BomSearchMasterComponent } from './search/bom-search-master/bom-search-master.component';
import { UploadFormComponent } from './upload/upload-form/upload-form.component';
import { UploadPreviewComponent } from './upload/upload-preview/upload-preview.component';
import { ResultsSummaryComponent } from './search/results-summary/results-summary.component';
import { SalesOrdersComponent } from './search/sales-orders/sales-orders.component';
import { InventoryComponent } from './search/inventory/inventory.component';
import { PurchaseOrdersComponent } from './search/purchase-orders/purchase-orders.component';
import { VendorQuotesComponent } from './search/vendor-quotes/vendor-quotes.component';
import { CustomerQuotesComponent } from './search/customer-quotes/customer-quotes.component';
import { CustomerRFQsComponent } from './search/customer-rfqs/customer-rfqs.component';
import { OutsideOffersComponent } from './search/outside-offers/outside-offers.component';
import { BomEmsComponent } from './search/bom-ems/bom-ems.component';
import { UploadService } from './../../_services/upload-service';
import { BOMsService } from './../../_services/boms.service';
import { ContactsService } from './../../_services/contacts.service';
import { HttpService} from './../../_services/httpService';
import { BuildCheckListService } from './../../_services/build-checklist.service';
import { ItemsService } from './../../_services/items.service';
import { ItemsFlaggedService } from './../../_services/items-flagged.service';
import { PurchaseOrdersService } from './../../_services/purchase-orders.service';
import { QuoteService } from './../../_services/quotes.service';
import { LocationService }  from './../../_services/locations.service';
import { SharedService }  from './../../_services/shared.service';
import { fakeBackEndProvider} from '../../_helpers/bomFb';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { ItemsFlaggedGridComponent } from './items-flagged/items-flagged-grid/items-flagged-grid.component';
import { ItemsFlaggedMasterComponent } from './items-flagged/items-flagged-master/items-flagged-master.component';
import { ItemsFlaggedPurchaseOrderComponent } from './items-flagged/items-flagged-purchase-order/items-flagged-purchase-order.component';
import { ItemsFlaggedQuoteComponent } from './items-flagged/items-flagged-quote/items-flagged-quote.component';
import { ItemsFlaggedRFQComponent } from './items-flagged/items-flagged-rfq/items-flagged-rfq.component';
import { BaseBomSearchComponentComponent } from './search/base-bom-search-component/base-bom-search-component.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { RfqsService} from './../../_services/rfqs.service';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { PartSearchComponent } from './part-search/part-search.component';
import { PartSearchCreateQuote } from './part-search-create-quote/part-search-create-quote';
import { SalesOrdersService} from './../../_services/sales-orders.service';
import { PartAvailabilityComponent } from './part-availability/part-availability.component';


export const routes = [
  { path: '', redirectTo: 'lists', pathMatch: 'full'},
  { path: 'lists', component: BomListComponent, data: { breadcrumb: 'Lists' } },
  { path: 'match', component: BomMatchComponent, data: { breadcrumb: 'Match' } },
  { path: 'search', component: BomSearchMasterComponent, data: { breadcrumb: 'Search' } },
  { path: 'part-search', component: PartSearchComponent, data: { breadcrumb: 'Part Search' } }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    DataTableModule,
    PipesModule,
    WidgetDirectivesModule,
    HttpModule,
    DirectivesModule,
    BusyModule,
    AgGridModule.withComponents( []),
    RouterModule.forChild(routes),
    SharedComponentModule
  ],
  declarations: [
    BomListComponent,
    BomMatchComponent,
    BomSearchMasterComponent,
    UploadFormComponent,
    UploadPreviewComponent,
    ResultsSummaryComponent,
    SalesOrdersComponent,
    InventoryComponent,
    PurchaseOrdersComponent,
    VendorQuotesComponent,
    CustomerQuotesComponent,
    CustomerRFQsComponent,
    OutsideOffersComponent,
    BomEmsComponent,
    ItemsFlaggedGridComponent,
    ItemsFlaggedMasterComponent,
    ItemsFlaggedPurchaseOrderComponent,
    ItemsFlaggedQuoteComponent,
    ItemsFlaggedRFQComponent,
    BaseBomSearchComponentComponent,
    PartSearchComponent,
    PartSearchCreateQuote,
    PartAvailabilityComponent
  ],
  providers: [HttpService,fakeBackEndProvider, MockBackend,BaseRequestOptions, UploadService,
    BOMsService, BuildCheckListService, ItemsService, ContactsService, ItemsFlaggedService,
    QuoteService, PurchaseOrdersService, LocationService, SharedService, CompleterService, RfqsService,SalesOrdersService],
  entryComponents: [SelectEditorComponent, CustomHeaderComponent]
})
export class BomModule { }
