import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService } from './../../_services/httpService';
import { ContactsService} from './../../_services/contacts.service';
import { SalesOrdersService} from './../../_services/sales-orders.service';
import { PermissionService } from './../../_services/permissions.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { AgGridModule } from 'ag-grid-angular/main';
import { fakeBackEndProvider } from '../../_helpers/quotes-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { QuoteDetailsMasterComponent } from './quote-details-master/quote-details-master.component';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { QuoteDetailsComponent } from './quote-details/quote-details.component';
import { QuotePartsComponent } from './quote-parts/quote-parts.component';
import { QuoteEmailComponent } from './quote-email/quote-email.component';
import { QuoteExtraItemsComponent } from './quote-extra-items/quote-extra-items.component';
import { QuoteService } from './../../_services/quotes.service';
import {SharedService } from './../../_services/shared.service';
import { ItemsService } from './../../_services/items.service';
import { RfqsService } from './../../_services/rfqs.service';
import { DatePickerEditorComponent } from './../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { QuotesGridComponent } from './quotes-grid/quotes-grid.component';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ErrorManagementService } from './../../_services/errorManagement.service';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { Ng2CompleterModule, CompleterService } from 'ng2-completer';
import { UsersService } from './../../_services/users.service';
import { ItemTypeaheadGridComponent } from './../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { InputComService } from './../../_coms/input-com.service';
import { ComoditySelectComponent } from './../_sharedComponent/comodity-select/comodity-select.component';
import { MfrInputComponent } from './../_sharedComponent/mfr-input/mfr-input.component';
import { ColumnFilterComponent } from './../_sharedComponent/column-filter/column-filter.component';
import { LeadtimeEditorComponent } from './../_sharedComponent/leadtime-editor/leadtime-editor.component';
import { AccountsContactsService } from '../../_services/accountsContacts.service';
import { CellMenuRendererComponent } from '../../_utilities/cellMenuGrid/cell-menu-renderer.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'quote-details',component:QuoteDetailsMasterComponent,data:{breadcrumb:'quote-details'}},
  { path:'',component:QuotesGridComponent,data:{breadcrumb:'quotes-grid'}} 
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( [ColumnFilterComponent]),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    SplitPaneModule,
    ReadonlyFieldModule,
    Ng2CompleterModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }),
  ],
  declarations: [
    QuoteDetailsMasterComponent,
    QuoteDetailsComponent,
    QuotePartsComponent,
    QuoteExtraItemsComponent,
    QuotesGridComponent,
    QuoteEmailComponent    
  ],
  providers:[HttpService, QuoteService, SharedService, ContactsService, ItemsService, SalesOrdersService,
    fakeBackEndProvider, MockBackend, BaseRequestOptions, ErrorManagementService, PermissionService,
    CompleterService, UsersService, RfqsService, AccountsContactsService],
  entryComponents:[SelectEditorComponent, CommentsComponent, CustomHeaderComponent, NumericInputComponent,DatePickerEditorComponent, 
    ItemTypeaheadGridComponent,ComoditySelectComponent, MfrInputComponent, LeadtimeEditorComponent, CellMenuRendererComponent]
})

export class QuotesModule { }
