import { Component, OnInit } from '@angular/core';
import { TransactionsService } from './../../_services/transactions.service';
import { GridOptions, ColumnApi } from "ag-grid";

@Component({
  selector: 'az-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  private transactionsGridOptions: GridOptions;
  private dataSource = [];
  private error: string;
  private payload: string;

  constructor(private transactionsService: TransactionsService) {
    let _self = this;
    this.transactionsGridOptions = {
      rowHeight: 30,
      headerHeight: 30,
      rowSelection: "single",
      suppressContextMenu:true,
      pagination:true,
      paginationPageSize:25,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    };
    this.creatGridColumnDefs();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.populateGrid();
  }
  
  populateGrid() {
    this.transactionsService.getTransactions().subscribe(transactions => {
      transactions.forEach(element => {
        this.dataSource.push({
          dateTime: element.dateTime,
          direction: element.direction,
          objectType: element.objectType,
          owners: element.owners,
          creator: element.creator,
          errors: element.errors,
          payload: element.payload,
          transactionId: element.transactionId
        })
      });
      this.transactionsGridOptions.api.setRowData(this.dataSource);
      this.transactionsGridOptions.api.sizeColumnsToFit();
    })
  }

  creatGridColumnDefs() {
    let _self = this;
    _self.transactionsGridOptions.columnDefs = [
      {
        headerName: "TransactionId",
        field: "transactionId"
      },
      {
        headerName: "Date time",
        field: "dateTime"
      },
      {
        headerName: "Direction",
        field: "direction",
        width: 100
      },
      {
        headerName: "Object Type",
        field: "objectType"
      },
      {
        headerName: "owners",
        field: "owners"

      },
      {
        headerName: "creator",
        field: "creator"
      },
      {
        headerName: "errors",
        field: "errors",
        cellRenderer: function (params) { return _self.createLink(params.data.errors, () => { _self.errorLinkClicked(params.data.transactionId) }) }
      },
      {
        headerName: "payload",
        field: "payload",
        cellRenderer: function (params) { return _self.createLink(params.data.payload, () => { _self.payloadLinkClicked(params.data.transactionId) }) }
      }
    ]
  };

  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    anchor.text = text;
    return anchor;
  }

  errorLinkClicked(transactionId) {
    var dataPerTransactionId = this.dataSource.find(x => x.transactionId == transactionId);
    this.error = dataPerTransactionId.errors;
    jQuery("#errorsModal").modal('toggle');
  }

  payloadLinkClicked(transactionId) {
    var dataPerTransactionId = this.dataSource.find(x => x.transactionId == transactionId);
    this.payload = dataPerTransactionId.payload;
    jQuery("#payloadModal").modal('toggle');
  }
}
