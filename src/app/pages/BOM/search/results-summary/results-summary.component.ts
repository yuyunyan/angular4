import { Component, OnInit, EventEmitter, Output, ViewEncapsulation, Input } from '@angular/core';
import { GridOptions, ColumnApi, RowNode } from "ag-grid";
import { BOMsService } from './../../../../_services/boms.service';
import { ResultSummary } from './../../../../_models/bom/resultSummary';
import { BaseBomSearchComponentComponent } from './../base-bom-search-component/base-bom-search-component.component';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';

@Component({
  selector: 'az-results-summary',
  templateUrl: './results-summary.component.html',
  styleUrls: ['./results-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class ResultsSummaryComponent  extends BaseBomSearchComponentComponent  implements OnInit {
  private resultId: number;
  private rowHeight= 30;
  private headerHeight= 30;
  @Output() partNumberOutPut = new EventEmitter();
  @Output() filterPartNoOutPut = new EventEmitter();
  private gridName = 'results-summary';
  //private resultgridOptions: GridOptions;
  //private resultGridData = [];
  
  constructor(private bomService: BOMsService, private agGridSettings: AGGridSettingsService) {
    super();
  }
 
   createColDefs(){
    let _self = this;
    return [
      {
        headerName: "Part number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 325
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width: 320
      },
      {
        headerName: "Sales Orders",
        field: "salesOrders",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Inventory",
        field: "inventory",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Purchase Orders",
        field: "purchaseOrders",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Vendor Quotes",
        field: "vendorQuotes",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Customer Quotes",
        field: "customerQuotes",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Customer RFQs",
        field: "customerRfqs",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "Outside Offers",
        field: "outsideOffers",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "BOM/EMS Lists",
        field: "bomEms",
        headerClass: "grid-header",
        width: 120
      },
      {
        headerName: "",
        field: "",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.filterIcon(_self, params, params.data.resultId, params.data.partNumber);
        },
        width: 50,
        maxWidth: 50,
        lockPinned: true,
        pinned: "right"
      },
      {
        headerName: "",
        field: "",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.flagIcon(_self, params);
        },
        width: 50,
        maxWidth: 50,
        lockPinned: true,
        pinned: "right"
        
      }
    ];
  }

  filterIcon(_self, params, resultId, partNumber) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.setAttribute('aria-hidden', 'true');
    i.className = 'fa fa-filter';
    anchor.appendChild(i);
    anchor.addEventListener("click", function () {
      _self.resultId = resultId;
      _self.filterPartNoOutPut.emit(partNumber);
      console.log("partNo RS",partNumber);
      console.log("filterIcon",_self.filterPartNoOutPut);
    }
    )
    return anchor;
  }

  createRow(element) {
    
    return {
      resultId: element.resultId,
      partNumber: element.partNumber,
      manufacturer: element.mfr,
      salesOrders: element.salesOrder,
      inventory: element.inventory,
      purchaseOrders: element.purchaseOrders,
      vendorQuotes: element.vendorQuotes,
      customerQuotes: element.customerQuotes,
      customerRfqs: element.customerRfqs,
      outsideOffers: element.outsideOffer,
      bomEms: element.bomEms,
      itemId: element.itemId
    }
  }

  getDataForGrid(searchId, partNumber, rowOffset, rowLimit, sortCol, DescSort, params) {
    this.bomService.getResultSummaryGrid(searchId, rowOffset, rowLimit, sortCol, DescSort).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
        if(data.totalRowCount == 0){
          this.gridOptions.api.showNoRowsOverlay();
        }
      })
  }
  setHeightOfGrid(recordsCount)
  {
    let height = (recordsCount * (this.rowHeight )) + this.headerHeight;
    document.getElementById('resultsSummaryGrid').style.height = height+'px';
  }
}
