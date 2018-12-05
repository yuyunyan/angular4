import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
import { SalesOrdersService} from './../../../_services/sales-orders.service';
import {GridOptions} from 'ag-grid';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'az-sales-order-line-history-grid',
  templateUrl: './sales-order-line-history-grid.component.html',
  styleUrls: ['./sales-order-line-history-grid.component.scss']
})
export class SalesOrderLineHistoryGridComponent implements OnInit {
  private salesOrderGrid:GridOptions;
  private rowDataSet = [];
  @Input() accountId: number;
  @Input() contactId: number;

  constructor(private router: Router,private sopoUtilties: PoSoUtilities,private salesOrdersService:SalesOrdersService,private gpUtilities: GPUtilities) { 
    this.salesOrderGrid={
      pagination: true,
      enableColResize: true,
      rowSelection: 'multiple',
      enableSorting:true,
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      defaultColDef: { suppressMenu: true }
    };
  }

  ngOnChanges(changes: SimpleChanges){}

  ngOnInit() {
    this.populateSalesOrderData();
  }

  refreshGrid(){
    this.populateSalesOrderData();
  }

  populateSalesOrderData(){
    const _self= this;
    this.salesOrdersService.getSalesOrderLineByAccountId(this.accountId,this.contactId).subscribe(
      data=>{
        _self.createSalesOrderLineGrid();
        _self.populateSalesOrderGrid(data);
      }
    )
  }

  floatColComparator(valueA, valueB){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  populateSalesOrderGrid(salesOrders){
    const _self = this;
    _self.rowDataSet = _.map(salesOrders,salesOrder=> _self.createSalesOrderLineRow(salesOrder));
    _self.salesOrderGrid.api.setRowData(_self.rowDataSet);
    _self.salesOrderGrid.api.sizeColumnsToFit();
   }

   createSalesOrderLineRow(salesOrder){
    let gpm =0;
    if(salesOrder.price !=0){
      gpm=(salesOrder.price- salesOrder.cost) / salesOrder.price;
    }
    let row={
      contactName:salesOrder.contact,
      versionId: salesOrder.versionId,
      salesOrderID:salesOrder.salesOrderID,
      displayId: this.sopoUtilties.DisplayOrderId(salesOrder.soExternalId, salesOrder.salesOrderID) + "-" + salesOrder.lineNum,
      partNumber:salesOrder.partNumber,
      manufacturer:salesOrder.manufacturer,
      qty:salesOrder.qty,
      price:salesOrder.price.toFixed(2),
      cost:salesOrder.cost.toFixed(2),
      gpm: !isNaN(gpm) ? (gpm *100).toFixed(2)+ '%' :'',
      orderDate:salesOrder.orderDate,
      shipDate:salesOrder.shipDate,
      dateCode:salesOrder.dateCode,
      packaging:salesOrder.packaging,
      owner:salesOrder.owners,
      status:salesOrder.status
    }
    return row;
  }

  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  ngAfterViewInit(): void {
    jQuery(".salesHistoryGrid .quotePartsButton").appendTo(".salesHistoryGrid .ag-paging-panel");
  }

  orderIdLinkClicked(SalesOrderID, versionId) {
    return () => this.router.navigate(['pages/sales-orders/sales-order-details', { soId: SalesOrderID, soVersionId: versionId}]);
  }

  createSalesOrderLineGrid(){
    const _self = this;
    let columnDefs=[
      {
        headerName: "SO-LN",
        field: "displayId",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.createLink(params.data.displayId, _self.orderIdLinkClicked(params.data.salesOrderID, params.data.versionId))
        },
        width:90
      },
      {
        headerName: "Contact Name",
        field: "contactName",
        headerClass: "grid-header",
        hide:this.contactId?true:false,
        width:120
      },
      {
        headerName: "Status",
        field: "status",
        headerClass: "grid-header",
        width:90

      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width:150
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width:150
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
        width:90
      },
      {
        headerName: "Price",
        field: "price",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        width:90
      },
      {
        headerName: "Cost",
        field: "cost",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        width:90
      },
      {
        headerName: "GP(%)",
        field: "gpm",
        headerClass: "grid-header",
        width:90
      },
      {
        headerName: "GP(USD)",
        headerClass: "grid-header",
        comparator: _self.floatColComparator,
        valueGetter: function(params){
          if(params.data){   
          if((params.data.qty * params.data.price) == 0){
            return "";
          }
        let val= _self.gpUtilities.GrossProfit(params.data.qty, params.data.cost, params.data.price);
        return val}},
        width:90
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width:110
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width:110
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        width:110
      },
      {
        headerName: "Owner",
        field: "owner",
        headerClass: "grid-header",
        width:150
      }
    ]
    this.salesOrderGrid.api.setColumnDefs(columnDefs);
  }

}
