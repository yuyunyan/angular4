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
import { SourcingPartsComponent } from './sourcing-parts/sourcing-parts.component';
import { SourcingMasterComponent } from './sourcing-master/sourcing-master.component';
import { SourcingGridComponent } from './sourcing-grid/sourcing-grid.component';
import { QuoteService } from './../../_services/quotes.service';
import { ContactsService} from './../../_services/contacts.service';
import { SourcingService } from './../../_services/sourcing.service';
import { ItemsService } from './../../_services/items.service';
import { CommentsService } from './../../_services/comments.service';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { SourcesDialogComponent } from './sources-dialog/sources-dialog.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import {RfqsService} from './../../_services/rfqs.service';
import { SharedService } from './../../_services/shared.service';
import { SourcingRfqDialogComponent } from './sourcing-rfq-dialog/sourcing-rfq-dialog.component';
import { AGGridSettingsService } from './../../_services/ag-grid-settings.service';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { RfqGenerateComponent } from './rfq-generate/rfq-generate.component';
import { ItemTypeaheadGridComponent } from './../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { ComoditySelectComponent } from './../_sharedComponent/comodity-select/comodity-select.component';
import { MfrInputComponent } from './../_sharedComponent/mfr-input/mfr-input.component';
import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { SupplierTypeaheadGridComponent } from './../_sharedComponent/supplier-typeheader-in-grid/supplier-typeheader-grid.component';
import { ContactEditorComponent } from './../_sharedComponent/contact-input/contact-input.component';
import {ColumnFilterComponent} from './../_sharedComponent/column-filter/column-filter.component';
export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'',component:SourcingMasterComponent,data:{breadcrumb:'sourcing'}}
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
    AgGridModule.withComponents( [ColumnFilterComponent]),
    SimpleNotificationsModule.forRoot(),    
    SharedComponentModule,
    SplitPaneModule
  ],
  exports: [
    
  ],
  declarations: [
    SourcingPartsComponent,
    SourcingMasterComponent,
    SourcingGridComponent,
    SourcesDialogComponent,
    SourcingRfqDialogComponent,
    RfqGenerateComponent
  ],
  providers: [HttpService, fakeBackEndProvider, MockBackend, BaseRequestOptions,AGGridSettingsService,
    QuoteService, ContactsService, ItemsService, SourcingService, CommentsService, RfqsService, SharedService, CompleterService],
  entryComponents: [CommentsComponent, CustomHeaderComponent, ItemTypeaheadGridComponent,
    ComoditySelectComponent, MfrInputComponent, NumericInputComponent, SupplierTypeaheadGridComponent,
    ContactEditorComponent]
})

export class SourcingModule { }
