import { NgModule } from '@angular/core';
import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { AgGridModule} from 'ag-grid-angular/main';
import { fakeBackEndProvider} from '../../_helpers/order-fulfillment-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { OrderFulfillmentGridComponent } from './order-fulfillment-grid/order-fulfillment-grid.component';
import { LinkCreator } from './../../_utilities/linkCreaator';
import { OrderFulfillmentService } from './../../_services/order-fulfillment.service';
import { BusyModule } from 'angular2-busy';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { SalesOrdersService } from './../../_services/sales-orders.service';
import { PoSoUtilities } from './../../_utilities/po-so-utilities/po-so-utilities'; 
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';


export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'', component: OrderFulfillmentGridComponent, data: { breadcrumb:'Order Fulfilment'}} 
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
    BusyModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    SplitPaneModule
  ],
  declarations: [ OrderFulfillmentGridComponent],
  providers:[HttpService, fakeBackEndProvider, MockBackend, BaseRequestOptions, OrderFulfillmentService, ItemsService, 
    QuoteService, SalesOrdersService, LinkCreator, PoSoUtilities],
  entryComponents: [ CommentsComponent, CustomHeaderComponent, NumericInputComponent]
})

export class OrderFulfillmentModule { }
