import { Component, OnInit,Input,OnChanges,SimpleChange } from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { BOMsService } from './../../../../_services/boms.service';
import { GridOptions, IDatasource } from "ag-grid";
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent extends BaseBomSearchComponentComponent {
  private rowHeight= 30;
  private headerHeight= 30;
  constructor(private bomService: BOMsService) {
    super();
  }

  createColDefs(){
    let _self = this;
    var bomUploadId = _self.bomUploadId;
    var bomListId =_self.bomListId;
    var bomId:number;
    if(bomUploadId){
      bomId=bomUploadId;
    }
    else if(bomListId){
      bomId= bomListId;
    }
    return [
      {
        headerName: "Purchase Order Date",
        field: "poDate",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Vendor",
        field: "vendor",
        headerClass: "grid-header",
        width: 130
      },
      {
        headerName: "Manufacturer PartNumber",
        field: "partNumber",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width: 50
      },
      {
        headerName: "Quantity Ordered",
        field: "qtyOrdered",
        headerClass: "grid-header",
        width: 120,
        cellStyle: { 'text-align': "right" }
      },
     
      {
        headerName: "Po Cost",
        field: "poCost",
        headerClass: "grid-header",
        width: 120,
        cellStyle: { 'text-align': "right" }
      },
      
      {
        headerName: "Buyer",
        field: "buyer",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Received Date",
        field: "receivedDate",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Received Quantity",
        field: "receivedQty",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Order Status",
        field: "orderStatus",
        headerClass: "grid-header",
        width: 80
      },
      {
        headerName: "Purchase Order ID",
        field: "purchaseOrderID",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Po Line ID",
        field: "poLineID",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Bom Qty",
        field: "bomQty",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "Bom Price",
        field: "bomPrice",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "Price Delta",
        field: "priceDelta",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "Pontential",
        field: "pontential",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "Bom PartNumber",
        field: "bomPartNo",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "BomIntPartNumber",
        field: "bomIntPartNo",
        headerClass: "grid-header",
        hide: bomId? false:true,
        width: 100
      },
      {
        headerName: "Bom Manufacturer",
        field: "bomMfg",
        headerClass: "grid-header",
        hide: bomId? false:true,
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

createRow(po) {
  
  return {
    poDate:	po.poDate,
    vendor: po.vendor,
    partNumber: po.mfgPartNumber,
    manufacturer: po.mfg,
    qtyOrdered: po.qtyOrdered? po.qtyOrdered.toLocaleString() : po.qtyOrdered,
    poCost: po.poCost? po.poCost.toLocaleString() :po.poCost,
    buyer: po.buyer,
    receivedDate: po.receivedDate,
    receivedQty: po.receivedQty? po.receivedQty.toLocaleString() : po.receivedQty,
    orderStatus: po.orderStatus,
    purchaseOrderID: po.purchaseOrderId,
    poLineID: po.poLineId,
    dateCode: po.dateCode,
    itemId: po.itemId,
    bomQty:po.bomQty,
    priceDelta:po.priceDelta,
    pontential:po.pontential,
    bomPartNo:po.bomPartNo,
    bomIntPartNo:po.bomIntPartNo,
    bomMfg:po.bomMfg,
    bomPrice:po.bomPrice
  }
}

getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params)
{

    this.bomService.getBomResultPO(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
            this.gridOptions.api.sizeColumnsToFit();
          })
}
setHeightOfGrid(recordsCount)
{
  let height = (recordsCount * (this.rowHeight )) + this.headerHeight;
  document.getElementById('bomResultPOGrid').style.height = height+'px';
}

}
