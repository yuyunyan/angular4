import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { retry } from 'rxjs/operator/retry';
import { BOMsService } from './../../../_services/boms.service';
 import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities';

@Component({
  selector: 'az-part-availability',
  templateUrl: './part-availability.component.html',
  styleUrls: ['./part-availability.component.scss']
})
export class PartAvailabilityComponent implements OnInit {
  private partAvailabililityGrid: GridOptions;
  @Input() itemId: number;
  constructor(private bomService: BOMsService,private poSoUtilities:PoSoUtilities) {
    this.partAvailabililityGrid = {
      pagination: true,
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      defaultColDef: { suppressMenu: true },
      columnDefs: this.createGrid()
    }
  }

  ngOnInit() {

  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (this.itemId) {
      this.populateGrid();
    }
  }


  createGrid() {
    return [
      {
        headerName: "Location",
        field: "location",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Type",
        field: "type",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Supplier",
        field: "supplier",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Allocated",
        field: "allocated",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Package Condition",
        field: "packageCondition",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Buyer",
        field: "buyer",
        headerClass: "grid-header",
        width: 175
      }
    ]
  }

  populateGrid() {
    let _self= this;
    this.bomService.getAvailability(this.itemId).subscribe(data => {
      let dataSource = [];
      data.forEach(element => {
        let salesOrderDisplayIds = element.allocated.map(so =>{ return _self.poSoUtilities.DisplayOrderId(so.externalID, so.salesOrderID)}); 
        
        dataSource.push({
          location: element.location,
          type: element.type,
          supplier: element.supplier,
          allocated:salesOrderDisplayIds.join(','),
          qty: element.qty,
          dateCode: element.dateCode,
          packaging: element.packaging,
          packageCondition: element.packagingCondition,
          buyer: element.buyer,
          cost:element.cost
        })
      });
      this.partAvailabililityGrid.api.setRowData(dataSource);
      this.partAvailabililityGrid.api.sizeColumnsToFit();
    })
  }




}
