import { Component, OnInit,Input,OnChanges,SimpleChange } from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { BOMsService } from './../../../../_services/boms.service';
import { GridOptions, IDatasource } from "ag-grid";
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-customer-quotes',
  templateUrl: './customer-quotes.component.html',
  styleUrls: ['./customer-quotes.component.scss']
})
export class CustomerQuotesComponent extends BaseBomSearchComponentComponent {
  private customerQuoteResults;
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
        headerName: "Quote",
        field: "quoteId",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Quote Date",
        field: "quoteDate",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Customer",
        field: "customer",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Contact",
        field: "contact",
        headerClass: "grid-header",
        minWidth: 120,
        width: 120
      },
      {
        headerName: "Manufacturer Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        minWidth: 130,
        width: 130
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        minWidth: 120,
        width: 120
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Target Price",
        field: "targetPrice",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Sales Rep",
        field: "owners",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Int Part Number",
        field: "customerPartNum",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        minWidth: 100,
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
        hide:bomId? false:true, 
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

  createRow(rfq) {
    return {
      quoteId: rfq.quoteId,
      quoteDate: rfq.quoteDate,
      customer: rfq.customer,
      contact: rfq.contact,
      itemId: rfq.itemsId,
      owners: rfq.owners,
      dateCode: rfq.dateCode,
      partNumber: rfq.partNumber,
      customerPartNum: rfq.customerPartNum,
      manufacturer: rfq.manufacturer,
      qty: rfq.qty? rfq.qty.toLocaleString() :rfq.qty,
      targetPrice: rfq.targetPrice? rfq.targetPrice.toLocaleString() :rfq.targetPrice,
      bomQty:rfq.bomQty,
      bomPrice:rfq.bomPrice,
      priceDelta:rfq.priceDelta,
      Pontential:rfq.Pontential,
      bomPartNo:rfq.bomPartNo,
      BomIntPartNumber:rfq.BomIntPartNumber,
      bomMfg:rfq.bomMfg
    }
  }

  getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params){
    this.bomService.getBomResultCustomerQuotes(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
    document.getElementById('bomResultCustomerQuoteGrid').style.height = height+'px';
  }

}
