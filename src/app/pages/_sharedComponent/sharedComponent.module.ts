import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PartSourcesComponent } from './part-sources/part-sources.component';
import { AgGridModule } from 'ag-grid-angular/main';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SelectEditorComponent } from './select-editor/select-editor.component';
import { DatePickerEditorComponent } from './date-picker-editor/date-picker-editor.component';
import { OwnershipAssignmentComponent } from './ownership-assignment/ownership-assignment.component';
import { OwnershipViewComponent } from './ownership-view/ownership-view.component';
import { CommentsComponent } from './comments/comments.component';
import { Timezone } from './timezone/timezone.component';
import { CommentLineComponent } from './comments/comment-line/comment-line.component';
import { CommentsFullComponent } from './comments/comments-full/comments-full.component';
import { CommentsReplyComponent } from './comments/comments-reply/comments-reply.component';
import { CommentHoverComponent } from './comments/comment-hover/comment-hover.component';
import { CustomHeaderComponent } from './az-custom-header/az-custom-header.component';
import { UsersService } from './../../_services/users.service';
import { OrderFulfillmentService } from './../../_services/order-fulfillment.service';
import { ContactsService } from './../../_services/contacts.service';
import { LocationService } from './../../_services/locations.service';
import { SharedService } from './../../_services/shared.service';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { DocumentsService } from './../../_services/documents.service';
import { OwnershipService } from './../../_services/ownership.service';  
import { SourcingService } from './../../_services/sourcing.service';
import { CommentsService } from './../../_services/comments.service';
import { PurchaseOrdersService } from './../../_services/purchase-orders.service';
import { DirectivesModule } from '../../theme/directives/directives.module';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { NumericInputComponent } from './numeric-input/numeric-input.component';
import { AvailabilityComponent } from './availability/availability.component';
import { AllocationListComponent } from './availability/allocation-list/allocation-list.component';
import { QtyChangeModalComponent } from './availability/qty-change-modal/qty-change-modal.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { BusyModule } from 'angular2-busy';
import { AccountDetailsChildComponentComponent} from './../contacts/account-details-child-component/account-details-child-component.component';
import { LocationsComponent} from './../contacts/locations-component/locations.component';
import { DocumentsComponent } from './documents/documents.component';
import { FileDropModule } from 'ngx-file-drop/lib/ngx-drop';
import { CheckRowComponent } from './check-row/check-row.component';
import { CheckRowService } from './check-row/check-row.service';
import { RadioSelectComponent } from './radio-select/radio-select.component';
import { RadioSelectService } from './radio-select/radio-select.service';
import { RouteToModalComponent } from './route-to-modal/route-to-modal.component';
import { ItemTypeaheadGridComponent } from './item-typeahead-in-grid/item-typeahead-grid.component';
import { Ng2CompleterModule, CompleterService } from 'ng2-completer';
import { NgxPermissionsModule } from 'ngx-permissions';
import { InputComService } from './../../_coms/input-com.service';
import { ColumnFilterComponent } from './column-filter/column-filter.component';
import { ComoditySelectComponent } from './comodity-select/comodity-select.component';
import { MfrInputComponent } from './mfr-input/mfr-input.component';
import { ReportModalComponent } from './report-modal/report-modal.component';
import { FocusObjectTypeComponent } from './focus-object-type/focus-object-type.component';
import { SupplierTypeaheadGridComponent } from './supplier-typeheader-in-grid/supplier-typeheader-grid.component';
import { ContactEditorComponent } from './contact-input/contact-input.component';
import { FocusNameComponent } from './focus-name/focus-name.component'
import { AccountTypeaheadGridComponent } from './account-typeheader-in-grid/account-typeheader-grid.component';
import { QuoteSourcesComponent } from './quote-sources/quote-sources.component';
import { SourcingRfqsComponent } from './sourcing-rfqs/sourcing-rfqs.component';
import { LeadtimeEditorComponent } from './leadtime-editor/leadtime-editor.component';
import { SourceToPurchaseorderComponent } from './source-to-purchaseorder/source-to-purchaseorder.component';
import { AllocationPOWindowComponent } from './allocation-po-window/allocation-po-window.component';
import { AllocationInvWindowComponent } from './allocation-inv-window/allocation-inv-window.component';
import { SourceService } from './../sourcing/source.service';
import { ObjectTypeService } from './../../_services/object-type.service';
import { PurchaseSourceComponent } from './purchase-source-grid/purchase-source-grid.component';
import {CarrierService} from './../../_services/carrier.service';
import { PoSoUtilities } from './../../_utilities/po-so-utilities/po-so-utilities'; 
import { GPUtilities } from './../../_utilities/gp-utilities/gp-utilities'; 
import { KPIDetailsComponent } from './kpi-details/kpi-details.component';
import { CellMenuRendererComponent } from '../../_utilities/cellMenuGrid/cell-menu-renderer.component';

export const routes = [
  { path: '', redirectTo: 'googlemaps', pathMatch: 'full'}, 
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2CompleterModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AgGridModule.withComponents( [ColumnFilterComponent]),
    SimpleNotificationsModule.forRoot(),
    DirectivesModule,
    WidgetDirectivesModule,
    BusyModule,
    ReadonlyFieldModule,
    FileDropModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true, 
      rolesIsolate: true})
  ],
  exports: [
    PartSourcesComponent,
    OwnershipAssignmentComponent,
    CommentsComponent,
    CommentLineComponent,
    CommentsFullComponent,
    CommentsReplyComponent,
    CommentHoverComponent,
    CustomHeaderComponent,
    AvailabilityComponent,
    AllocationListComponent,
    QtyChangeModalComponent,
    NewAccountComponent,
    AccountDetailsChildComponentComponent,
    LocationsComponent,
    DocumentsComponent,
    CheckRowComponent,
    RadioSelectComponent,
    RouteToModalComponent,
    OwnershipViewComponent,
    ColumnFilterComponent,
    ReportModalComponent,
    SupplierTypeaheadGridComponent,
    ContactEditorComponent,
    AccountTypeaheadGridComponent,
    FocusNameComponent,
    QuoteSourcesComponent,
    SourcingRfqsComponent,
    LeadtimeEditorComponent,
    SourceToPurchaseorderComponent,
    AllocationPOWindowComponent,
    FocusObjectTypeComponent,
    AllocationInvWindowComponent,
    Timezone,
    PurchaseSourceComponent,
    KPIDetailsComponent
  ],
  declarations: [
    PartSourcesComponent,
    SelectEditorComponent,
    DatePickerEditorComponent,
    OwnershipAssignmentComponent,
    CommentsComponent,
    CommentLineComponent,
    CommentsFullComponent,
    CommentsReplyComponent,
    CommentHoverComponent,
    CustomHeaderComponent,
    Timezone,
    NewAccountComponent,
    NumericInputComponent,
    AvailabilityComponent,
    AllocationListComponent,
    QtyChangeModalComponent,
    AccountDetailsChildComponentComponent,
    LocationsComponent,
    DocumentsComponent,
    CheckRowComponent,
    RadioSelectComponent,
    RouteToModalComponent,
    ItemTypeaheadGridComponent,
    ComoditySelectComponent,
    OwnershipViewComponent,
    ColumnFilterComponent,
    MfrInputComponent,
    ReportModalComponent,
    FocusObjectTypeComponent,
    SupplierTypeaheadGridComponent,
    ContactEditorComponent,
    AccountTypeaheadGridComponent,
    FocusNameComponent,
    QuoteSourcesComponent,
    SourcingRfqsComponent,
    LeadtimeEditorComponent,
    SourceToPurchaseorderComponent,
    AllocationPOWindowComponent,
    AllocationInvWindowComponent,
    PurchaseSourceComponent,
    KPIDetailsComponent,
    CellMenuRendererComponent
  ],
  providers: [
    UsersService,
    ContactsService,
    OwnershipService,
    SourcingService,
    CommentsService,
    PurchaseOrdersService,
    OrderFulfillmentService,
    LocationService,
    RadioSelectService,
    CheckRowService,
    SharedService,
    ItemsService,
    QuoteService,
    DocumentsService,
    CompleterService,
    SourceService,
    ObjectTypeService,
    CarrierService,
    InputComService,
    PoSoUtilities,
    GPUtilities
  ],
  entryComponents: [CommentsReplyComponent, ItemTypeaheadGridComponent]
})
export class SharedComponentModule { }
