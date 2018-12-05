import { Component, OnInit,Input,SimpleChange, Renderer,OnChanges,SimpleChanges, ViewEncapsulation} from '@angular/core';
import { GridOptions,ColumnApi } from "ag-grid";
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-sales-order-line-allocations',
  templateUrl: './sales-order-line-allocations.component.html',
  styleUrls: ['./sales-order-line-allocations.component.scss'],
  providers: [AGGridSettingsService]

})

export class SalesOrderLineAllocationsComponent implements OnInit,OnChanges {
@Input() infoSoLineId;
private ngUnsubscribe: Subject<void> = new Subject<void>();
private soLineAssociationsGrid: GridOptions;
private rowHeight = 30;
private headerHeight = 30;
  constructor(private salesOrdersService: SalesOrdersService,private agGridSettings: AGGridSettingsService,){

    }

    createGrid(){
        let _self = this;
        this.soLineAssociationsGrid = {  
            suppressContextMenu:true,   
            suppressMenuHide: true,
            paginationPageSize: 5,
            suppressDragLeaveHidesColumns: true,
            enableSorting: true,
            enableColResize:true,
            toolPanelSuppressSideButtons:true,
            columnDefs:  this.createLinesGrid(),
            rowHeight: _self.rowHeight,
            headerHeight: _self.headerHeight
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
        this.salesOrdersService.GetSaleOrderLineAllocations(soIdProp).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
            data => {
                this.soLineAssociationsGrid.api.setRowData(data);
            });
    }

    createLinesGrid(){
        let columnDefs =  [
          {
            headerName:"PO",
            field: "PurchaseOrderID",
            headerClass:"grid-header",
            minWidth: 60,
          },
          {
            headerName:"Ln",
            field: "LineNum",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Warehouse",
            field: "WarehouseName",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Pre-Allocated",
            field: "PreAllocated",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Received",
            field: "Received",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"From Stock",
            field: "FromStock",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Transfer Required",
            field: "TransferType",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Transfer Date",
            field: "TransferDate",
            headerClass:"grid-header",
            minWidth: 65,
          },
          {
            headerName:"Transfer Status",
            field: "TransferStatus",
            headerClass:"grid-header",
            minWidth: 65,
          },
        ];
        return columnDefs;
    }

}