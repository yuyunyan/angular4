import { Component, OnInit,Input,OnChanges,SimpleChange} from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { BOMsService } from './../../../../_services/boms.service';
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-outside-offers',
  templateUrl: './outside-offers.component.html',
  styleUrls: ['./outside-offers.component.scss']
})
export class OutsideOffersComponent extends BaseBomSearchComponentComponent {
 private totalRowCount;
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
        headerName: "Offer Date",
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
        width: 100,
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

  createRow(oo) {    
    return {
      offerDate: oo.offerDate,
      vendorName: oo.vendorName,
      partNumber: oo.partNumber,
      mfg: oo.mfg,
      qty: oo.qty? oo.qty.toLocaleString() : oo.qty,
      cost: oo.cost? oo.cost.toLocaleString() :oo.cost,
      buyer: oo.buyer,
      dateCode: oo.dateCode,
      leadTimeDays: oo.leadTimeDays,
      priceDelta: oo.priceDelta? oo.priceDelta.toLocaleString() :oo.priceDelta,
      potential: oo.potential? oo.potential.toLocaleString() :oo.potential,
      bomPartNo: oo.bomPartNumber,
      bomIntPartNo: oo.bomIntPartNumber,
      bomMfg: oo.bomMfg,
      bomQty: oo.bomQty? oo.bomQty.toLocaleString() :oo.bomQty,
      bomPrice: oo.bomPrice? oo.bomPrice.toLocaleString() :oo.bomPrice,
      itemId: oo.itemId
    }
  }  

  getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params)
  {
    console.log(searchId, partNumber);
    this.bomService.getOutsideOffersGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
    document.getElementById('outsideOffersGrid').style.height = height+'px';
  }

}
