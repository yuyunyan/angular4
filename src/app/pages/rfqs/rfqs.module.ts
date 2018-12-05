import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService} from './../../_services/httpService';
import { UsersService } from './../../_services/users.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { AgGridModule} from 'ag-grid-angular/main';
import { RolesService} from './../../_services/roles.service';
import { fakeBackEndProvider} from '../../_helpers/rfqs-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { RfqDetailsMasterComponent } from './rfq-details/rfq-details-master/rfq-details-master.component';
import { RfqDetailsHeaderComponent } from './rfq-details/rfq-details-header/rfq-details-header.component';
import { RfqLinesComponent } from './rfq-details/rfq-lines/rfq-lines.component';
import { RfqResponsesComponent } from './rfq-details/rfq-responses/rfq-responses.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { RfqsService } from './../../_services/rfqs.service';
import { SharedService } from './../../_services/shared.service';
import { ContactsService } from './../../_services/contacts.service';
import { SourcingService } from './../../_services/sourcing.service';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { ContactsModule} from './../contacts/contacts.module';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { SelectEditorComponent} from './../_sharedComponent/select-editor/select-editor.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { RfqListComponent } from './rfq-list/rfq-list.component';
import { ErrorManagementService } from './../../_services/errorManagement.service';
import { PermissionService } from './../../_services/permissions.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { ItemTypeaheadGridComponent } from './../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { InputComService } from './../../_coms/input-com.service';
import { ComoditySelectComponent } from './../_sharedComponent/comodity-select/comodity-select.component';
import { MfrInputComponent } from './../_sharedComponent/mfr-input/mfr-input.component';
import { ColumnFilterComponent } from './../_sharedComponent/column-filter/column-filter.component';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';

export const routes = [
  //{path:'', component:RfqDetailsComponent, data:{breadcrumb:'Rfqs'}},
  { path:'rfq-details', component:RfqDetailsMasterComponent, data:{breadcrumb:'Rfqs'} },
  { path:'', component:RfqListComponent, data:{breadcrumb:'Rfqs'} }
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,  
    WidgetDirectivesModule,  
    RouterModule.forChild(routes),
    HttpModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    SplitPaneModule,
    SharedComponentModule,
    ReadonlyFieldModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }),
    Ng2CompleterModule
  ],
  declarations: [
    
  RfqDetailsMasterComponent,
  RfqDetailsHeaderComponent,
  RfqLinesComponent,
  RfqResponsesComponent,
  RfqListComponent
  ],
  
  providers:[HttpService,RfqsService, SharedService, ContactsService, ItemsService, QuoteService,
    fakeBackEndProvider, MockBackend, BaseRequestOptions, SourcingService, ErrorManagementService, PermissionService, InputComService],
  entryComponents:[SelectEditorComponent, CustomHeaderComponent, NumericInputComponent, ItemTypeaheadGridComponent, ComoditySelectComponent, MfrInputComponent,
    ColumnFilterComponent]
})

export class RFQsModule { }
