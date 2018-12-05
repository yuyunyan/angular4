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
import { SimpleNotificationsModule } from 'angular2-notifications';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { RequestToPurchaseGridComponent } from './request-to-purchase-grid/request-to-purchase-grid.component';
import { LinkCreator } from './../../_utilities/linkCreaator';
import { OrderFulfillmentService } from './../../_services/order-fulfillment.service';
import { BusyModule } from 'angular2-busy';
import { ItemsService } from './../../_services/items.service';
import { UsersService } from './../../_services/users.service';
import { QuoteService } from './../../_services/quotes.service';
import { SalesOrdersService } from './../../_services/sales-orders.service';
import { Ng2CompleterModule, CompleterService } from "ng2-completer";
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { CommentsComponent } from './../_sharedComponent/comments/comments.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { RequestToPurchaseService } from './../../_services/request-to-purchase.service';
import { LocationService } from './../../_services/locations.service';
import { AddToCartMasterComponent } from './add-to-cart-master/add-to-cart-master.component';
import {AddToCartItemComponent} from './add-to-cart-item/add-to-cart-item.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: '', component: RequestToPurchaseGridComponent, data: { breadcrumb:'Request To Purchase'}} 
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
    Ng2CompleterModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents([]),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    SplitPaneModule
  ],
  declarations: [RequestToPurchaseGridComponent,AddToCartMasterComponent,AddToCartItemComponent],
  providers:[HttpService, OrderFulfillmentService, ItemsService, QuoteService, SalesOrdersService,
    LinkCreator, UsersService, CompleterService, RequestToPurchaseService, LocationService],
  entryComponents: [ CommentsComponent, CustomHeaderComponent, NumericInputComponent]
})

export class RequestToPurchaseModule { }
