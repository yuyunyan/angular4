import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { BOMsService } from './../../../../_services/boms.service';
import { GridOptions } from "ag-grid";
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-bom-ems',
  templateUrl: './bom-ems.component.html',
  styleUrls: ['./bom-ems.component.scss']
})
export class BomEmsComponent extends BaseBomSearchComponentComponent{
  private EMSResults;
  private rowHeight= 30;
  private headerHeight= 30;

  constructor(private bomService: BOMsService) {
    super();
  }

  createColDefs(){
    let _self = this;
    var bomUploadId = _self.bomUploadId;
    var bomListId =_self.bomListId;
    var bomId;
    if(bomUploadId){
      bomId=bomUploadId;
    }
    else if(bomListId){
      bomId= bomListId;
    }
    return [
      {
        headerName: "Manufacturer Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        minWidth: 170,
        width: 170
      },
      {
        headerName: "BOM Date",
        field: "created",
        headerClass: "grid-header",
        minWidth: 100,
        width: 100
      },
      {
        headerName: "Customer",
        field: "customerName",
        headerClass: "grid-header",
        minWidth: 120,
        width: 120
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        minWidth: 130,
        width: 130
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
        headerName: "BOM Uploaded By",
        field: "createdBy",
        headerClass: "grid-header",
        minWidth: 200,
        width: 200
      },
      {
        headerName: "Int Part Number",
        field: "customerPartNum",
        headerClass: "grid-header",
        minWidth: 170,
        width: 170
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
        hide: bomId?false:true,
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

  createRow(ems) {
    var retValue= {
      created: ems.created,
      customerName: ems.customerName,
      partNumber: ems.partNumber,
      manufacturer: ems.manufacturer,
      qty: ems.qty? ems.qty.toLocaleString() :ems.qty,
      targetPrice: ems.targetPrice? ems.targetPrice.toLocaleString():ems.targetPrice,
      createdBy: ems.createdBy,
      customerPartNum: ems.customerPartNum,
      itemId: ems.itemId,
      bomQty:ems.bomQty,
      bomPrice:ems.bomPrice,
      priceDeltaL:ems.priceDelta,
      pontential:ems.pontential,
      bomPartNo:ems.bomPartNo,
      bomIntPartNo:ems.bomIntPartNo,
      bomMfg:ems.bomMfg
    };
    return retValue;
  }

  getDataForGrid(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort, params) {
    this.bomService.getBomResultEMS(searchId, partNumber,rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        let rowData = data.results.map(this.createRow);
        if(data.totalRowCount && data.totalRowCount > 0){
          console.log('row count', data.totalRowCount);
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
    document.getElementById('bomResultEMSGrid').style.height = height+'px';
  }
}
