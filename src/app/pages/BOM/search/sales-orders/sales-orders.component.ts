import { Component, OnInit, Input, OnChanges, SimpleChange, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi, RowNode, IDatasource } from "ag-grid";
import { BOMsService } from './../../../../_services/boms.service';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-sales-orders',
  templateUrl: './sales-orders.component.html',
  styleUrls: ['./sales-orders.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SalesOrdersComponent extends BaseBomSearchComponentComponent {
  private rowHeight= 30;
  private headerHeight= 30;
  constructor(private bomService: BOMsService) {
    super();
    
  }

  createColDefs() {
    let _self = this;
    var bomUploadId = _self.bomUploadId;
    var bomListId =_self.bomListId;
    var bomId:number;
    if(bomUploadId){
      bomId= bomUploadId;
    }
    else if(bomListId){
      bomId= bomListId;
    }
    return [
      {
        headerName: "Order Number",
        field: "orderNumber",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "So Date",
        field: "soDate",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Customer",
        field: "customer",
        headerClass: "grid-header",
        width: 130
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width: 50
      },
      {
        headerName: "Qty Sold",
        field: "qtySold",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Sold Price",
        field: "soldPrice",
        headerClass: "grid-header",
        width: 80,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Unit Cost",
        field: "unitCost",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "GP",
        field: "gp",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Due Date",
        field: "dueDate",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Ship Qty",
        field: "shipQty",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Order Status",
        field: "orderStatus",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "SalesPerson",
        field: "salesPerson",
        headerClass: "grid-header",
        width: 100
      }, 
      {
        headerName: "Bom Qty",
        field: "bomQty",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "Bom Price",
        field: "bomPrice",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "Price Delta",
        field: "priceDelta",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "Pontential",
        field: "pontential",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "Bom PartNumber",
        field: "bomPartNo",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "BomIntPartNumber",
        field: "bomIntPartNo",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "Bom Manufacturer",
        field: "bomMfg",
        headerClass: "grid-header",
        hide: bomId?false:true,
        width: 100
      },
      {
        headerName: "",
        field: "",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.flagIcon(_self, params);
        },
        width: 30
      }
    ];
  }

  createRow(element) {

    return {
      orderNumber: element.soId,
      soDate: element.soDate,
      customer: element.customer,
      partNumber: element.partNumber,
      manufacturer: element.mfr,
      qtySold:element.qtySold?element.qtySold.toLocaleString() : element.qtySold,
      soldPrice:element.soldPrice ?element.soldPrice.toLocaleString() :element.soldPrice,
      dateCode: element.dateCode,
      unitCost: element.unitCost? element.unitCost.toLocaleString() :element.unitCost,
      gp: element.gp,
      dueDate: element.dueDate,
      shipQty:element.shipQty? element.shipQty.toLocaleString() :element.shipQty,
      orderStatus: element.orderStatus,
      salesPerson: element.salesPerson,
      itemId : element.itemId,
      bomQty:element.bomQty,
      priceDelta:element.priceDelta,
      pontential:element.pontential,
      bomPartNo:element.bomPartNo,
      bomIntPartNo:element.bomIntPartNo,
      bomMfg:element.bomMfg,
      bomPrice:element.bomPrice
    }
  }

  getDataForGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, DescSort, params) {
    this.bomService.getSalesOrderGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        let rowData = data.results.map(this.createRow);
        if(data.totalRowCount && data.totalRowCount > 0){
          let gridHeight = (data.totalRowCount > 25) ? 25 :data.totalRowCount ;
          this.setHeightOfGrid(gridHeight);
        }
        else{
          this.setHeightOfGrid(3);
        }
        params.successCallback(rowData, data.totalRowCount);
      })
  }
  
  setHeightOfGrid(recordsCount)
  {
    let height = (recordsCount * (this.rowHeight )) + this.headerHeight;
    document.getElementById('soGrid').style.height = height+'px';
  }

}
