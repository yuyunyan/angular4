import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonInput } from './../../../../_models/bom/commonInput';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { BOMsService } from './../../../../_services/boms.service';
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';

@Component({
  selector: 'az-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent extends BaseBomSearchComponentComponent {

  private rowHeight= 30;
  private headerHeight= 30;
  private agGridOptions: GridOptions;
  constructor(private bomService: BOMsService) {
    super();

  }

  createColDefs() {
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
        headerName: "Warehouse",
        field: "warehouseId",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Manufacturer Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width: 130
      },
      {
        headerName: "Inventory Qty",
        field: "inventoryQty",
        headerClass: "grid-header",
        width: 120,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        width: 50,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Reserved Qty",
        field: "reservedQty",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Available Qty",
        field: "availableQty",
        headerClass: "grid-header",
        width: 100,
        cellStyle: { 'text-align': "right" }
      },
      {
        headerName: "Purchase Order",
        field: "purchaseOrder",
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

  createRow(inv) {
    return {
      warehouseId: inv.warehouseId,
      partNumber: inv.mfgPartNumber,
      manufacturer: inv.mfg,
      inventoryQty: inv.inventoryQty? inv.inventoryQty.toLocaleString():inv.inventoryQty,
      cost: inv.cost? inv.cost.toLocaleString() :inv.cost,
      reservedQty:inv.reservedQty?  inv.reservedQty.toLocaleString() : inv.reservedQty,
      availableQty: inv.availableQty? inv.availableQty.toLocaleString() :inv.availableQty,
      purchaseOrder: inv.purchaseOrder,
      dateCode: inv.dateCode,
      priceDelta: inv.priceDelta? inv.priceDelta.toLocaleString():inv.priceDelta,
      potential: inv.potential? inv.potential.toLocaleString():inv.potential,
      bomPartNo: inv.bomPartNumber,
      bomIntPartNo: inv.bomIntPartNumber,
      bomMfg: inv.bomMfg,
      bomQty: inv.bomQty != null? inv.bomQty: inv.bom.Qty.toLocaleString(), //Check with Barry if != null statement is right. (JS throws undefined inv.bom.Qty if inv.BomQty is equal to 0)
      bomPrice: inv.bomPrice? inv.bomPrice.toLocaleString() :inv.bomPrice,
      itemId: inv.itemId
    }
  }

  getDataForGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, DescSort, params) {
    this.bomService.getInventoryGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
    document.getElementById('inventoryGrid').style.height = height+'px';
  }

}
