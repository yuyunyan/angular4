import { Component, OnInit, Input } from '@angular/core';
import { GridOptions } from 'ag-grid';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import { SourcingService } from '../../../_services/sourcing.service';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { DatePickerEditorComponent } from './../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import * as _ from 'lodash';


@Component({
  selector: 'az-sources-history-grid',
  templateUrl: './sources-history-grid.component.html',
  styleUrls: ['./sources-history-grid.component.scss']
})
export class SourcesHistoryGridComponent implements OnInit {
  private sourcesGrid: GridOptions;
  private rowDataSet = [];
  @Input() accountId: number;
  @Input() contactId: number;

  constructor(private sourcingService: SourcingService,private linkCreator: LinkCreator) {
    this.sourcesGrid = {
      pagination: true,
      enableSorting:true,
      rowSelection: 'multiple',
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu: true,
      defaultColDef: { suppressMenu: true }
    }
  }

  ngOnInit() {
    this.populateSourcesData();
  }


  populateSourcesData() {
    const _self = this;
    this.sourcingService.getSourceLineByAccountId(this.accountId,this.contactId).subscribe(
      data => {
        _self.createSourceGrid();
        _self.populateSourceGrid(data);
      }
    )

  }

  populateSourceGrid(sources) {
    const _self = this;
    _self.rowDataSet = _.map(sources, source => _self.createSourceLineRow(source));
    _self.sourcesGrid.api.setRowData(_self.rowDataSet);
    _self.sourcesGrid.api.sizeColumnsToFit();
  }

  ngAfterViewInit(): void {
    jQuery(".sourceHistoryGrid .quotePartsButton").appendTo(".sourceHistoryGrid .ag-paging-panel");
  }

  floatColComparator(valueA, valueB){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  refreshGrid(){
    this.populateSourcesData();
  }

  createSourceLineRow(source) {
    let row = {
      contactName: source.contactName,
      type: source.type,
      partNumber: source.partNumber,
      itemId: source.itemId,
      manufacturer: source.manufacturer,
      date: source.date,
      buyer: source.buyer,
      qty: source.qty,
      cost: source.cost.toFixed(2),
      dateCode: source.dateCode,
      packaging: source.packaging,
      leadTime: source.leadTime
    }
    return row;
  }

  createSourceGrid() {
    let columnDefs = [
      {
        headerName: "Type",
        field: "type",
        headerClass: "grid-header",
        width: 90,
      },
      {
        headerName: "Contact Name",
        field: "contactName",
        headerClass: "grid-header",
        hide: this.contactId ? true : false,
        minwidth: 100,
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        cellRenderer: (params) => {
          if(!params.node.data.itemId){
            return params.node.data.partNumber;
          }else{
          return this.linkCreator.createItemLink(params.node.data.itemId, params.node.data.partNumber)
          }
        },
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        minwidth: 100,
      },
      {
        headerName: "Date",
        field: "date",
        headerClass: "grid-header",
        minwidth: 80,
      },
      {
        headerName: "Buyer",
        field: "buyer",
        headerClass: "grid-header",
        minwidth: 100,
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        width: 90,
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        comparator: this.floatColComparator,
        width: 90,
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 120,
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        width: 90,
      }
    ]
    this.sourcesGrid.api.setColumnDefs(columnDefs);
  }

}
