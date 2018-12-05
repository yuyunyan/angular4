import { Component, OnInit,Input,OnChanges,SimpleChange} from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { BOMsService } from './../../../../_services/boms.service';
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-vendor-quotes',
  templateUrl: './vendor-quotes.component.html',
  styleUrls: ['./vendor-quotes.component.scss']
})
export class VendorQuotesComponent extends BaseBomSearchComponentComponent {
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
        headerName: "Vendor Date",
        field: "offerDate",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Vendor",
        field: "vendorName",
        headerClass: "grid-header",
        width: 130
      },
      {
        headerName: "Manufacturer Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Manufacturer",
        field: "mfg",
        headerClass: "grid-header",
        width: 50
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        hide: true,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Buyer",
        field: "buyer",
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
        headerName: "Lead Time",
        field: "leadTimeDays",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "MOQ",
        field: "moq",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "SQP",
        field: "sqp",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Note",
        field: "note",
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
      },
    ];
  }

  createRow(vq) {    
    return {
      offerDate: vq.offerDate,
      vendorName: vq.vendorName,
      partNumber: vq.partNumber,
      mfg: vq.mfg,
      qty: vq.qty? vq.qty.toLocaleString() :vq.qty,
      cost: vq.cost? vq.cost.toLocaleString() : vq.cost,
      buyer: vq.buyer,
      dateCode: vq.dateCode,
      leadTimeDays: vq.leadTimeDays,
      itemId: vq.itemId,
      note:vq.note,
      sqp:vq.sqp,
      moq:vq.mop,
      bomQty:vq.bomQty,
      priceDelta:vq.priceDelta,
      pontential:vq.pontential,
      bomPartNo:vq.bomPartNo,
      bomIntPartNo:vq.bomIntPartNo,
      bomMfg:vq.bomMfg,
      bomPrice:vq.bomPrice
    }
  }  

  getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params){
    this.bomService.getBomResultVendorQuotes(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
    });
  }
  setHeightOfGrid(recordsCount)
  {
    let height = (recordsCount * (this.rowHeight )) + this.headerHeight;
    document.getElementById('vendorQuotesGrid').style.height = height+'px';
  }

}
