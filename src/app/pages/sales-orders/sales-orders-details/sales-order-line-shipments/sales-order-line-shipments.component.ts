import { Component, OnInit,Input,SimpleChange, Renderer,OnChanges,SimpleChanges, ViewEncapsulation} from '@angular/core';
import { GridOptions,ColumnApi } from "ag-grid";
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-sales-order-line-shipments',
  templateUrl: './sales-order-line-shipments.component.html',
  styleUrls: ['./sales-order-line-shipments.component.scss'],
})

export class SalesOrderLineShipmentsComponent implements OnInit,OnChanges {
  @Input() infoSoLineId;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private soLineShipmentsGrid: GridOptions;
  private rowHeight = 30;
  private headerHeight = 30;
    constructor(private salesOrdersService: SalesOrdersService,private agGridSettings: AGGridSettingsService,){
  
      }
  
      createGrid(){
          let _self = this;
          this.soLineShipmentsGrid = {  
              suppressContextMenu:true,   
              suppressMenuHide: true,
              paginationPageSize: 5,
              suppressDragLeaveHidesColumns: true,
              enableSorting: true,
              enableColResize:true,
              toolPanelSuppressSideButtons:true,
              columnDefs:  this.createLinesGrid(),
              rowHeight: _self.rowHeight,
              headerHeight: _self.headerHeight,
          }
      }
  
      ngOnInit(){
          this.createGrid();
      }
  
      ngOnChanges(changes: { [propKey: string]: SimpleChange }){
          if(this.infoSoLineId){
          let soIdProp = changes['infoSoLineId'].currentValue;
          this.populateData(soIdProp); 
          }      
      }
  
      populateData(soIdProp){
          this.salesOrdersService.GetSaleOrderLineShipments(soIdProp).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
              data => {
                  this.soLineShipmentsGrid.api.setRowData(data);
              });
      }
  
      createLinesGrid(){
          let columnDefs =  [
            {
              headerName:"Shipment Date",
              field: "ShipmentDate",
              headerClass:"grid-header",
              minWidth: 100,
            },
            {
              headerName:"Qty Shipped",
              field: "QuantityShipped",
              headerClass:"grid-header",
              minWidth: 65,
            },
            {
              headerName:"Delivery ID",
              field: "DeliveryId",
              headerClass:"grid-header",
              minWidth: 65,
            },
            {
              headerName:"Carrier",
              field: "Carrier",
              headerClass:"grid-header",
              minWidth: 120,
            },
            {
              headerName:"Tracking Number",
              field: "TrackingNumber",
              headerClass:"grid-header",
              minWidth: 120,
            },
          ];
          return columnDefs;
      }

}