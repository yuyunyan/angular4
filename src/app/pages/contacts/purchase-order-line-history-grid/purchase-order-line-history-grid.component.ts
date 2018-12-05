import { Component, OnInit,Input } from '@angular/core';
import {GridOptions} from 'ag-grid';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import { PurchaseOrdersService} from '../../../_services/purchase-orders.service';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'az-purchase-order-line-history-grid',
  templateUrl: './purchase-order-line-history-grid.component.html',
  styleUrls: ['./purchase-order-line-history-grid.component.scss']
})
export class PurchaseOrderLineHistoryGridComponent implements OnInit {
  private purchaseOrderGrid:GridOptions;
  private rowDataSet = [];
  @Input() accountId: number;
  @Input() contactId: number;


  constructor(private router: Router,private sopoUtilties: PoSoUtilities,private linkCreator: LinkCreator,private purchaseOrdersService:PurchaseOrdersService,private gpUtilities: GPUtilities) {
    this.purchaseOrderGrid={
      pagination: true,
      enableSorting:true,
      enableColResize:true,
      rowSelection: 'multiple',
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      defaultColDef: { suppressMenu: true }
    }
   }

  ngOnInit() {
    this.populatePurchaseOrderData();
  }

  refreshGrid(){
    this.populatePurchaseOrderData();
  }

  populatePurchaseOrderData(){
    const _self = this;
    this.purchaseOrdersService.getPurchaseOrderLineByAccountId(this.accountId,this.contactId).subscribe(
      data=>{
        _self.createPurchaseOrderLineGrid();
        _self.populatePurchaseOrderGrid(data);
      }
    )
  }

  populatePurchaseOrderGrid(purchaseOrders){
    const _self = this;
    _self.rowDataSet = _.map(purchaseOrders,po=> _self.createPOLineRow(po));
    _self.purchaseOrderGrid.api.setRowData(_self.rowDataSet);
    _self.purchaseOrderGrid.api.sizeColumnsToFit();
  
  }

  createPOLineRow(po){
    let row={
      contactName:po.contactName,
      itemId:po.itemId,
      purchaseOrderId: po.purchaseOrderId,
      displayId: this.sopoUtilties.DisplayOrderId(po.poExternalId, po.purchaseOrderId) + "-" + this.combineLineNumAndRev(po.lineNum,po.lineRev),
      versionId: po.versionId,
      buyer:po.buyer,
      partNumber:po.partNumber,
      manufacturer:po.manufacturer,
      location:po.location,
      orderDate:po.orderDate,
      qty:po.qty,
      cost:po.cost.toFixed(2),
      dataCode:po.dataCode,
      packaging:po.packaging,
      status:po.status
    }
    return row;
  }

  combineLineNumAndRev(lineNum,lineRev){
    return lineNum + "." + lineRev;
  }

  ngAfterViewInit(): void {
    jQuery(".purchaseHistoryGrid .quotePartsButton").appendTo(".purchaseHistoryGrid .ag-paging-panel");
  }

  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  orderIdLinkClicked(purchaseOrderId, versionId) {
    return () => this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: purchaseOrderId, versionId: versionId}]);
  }

  floatColComparator(valueA, valueB){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  createPurchaseOrderLineGrid(){
    const _self = this;
    let poColumnDefs=[
      {
        headerName: "PO-LN",
        field: "displayId",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.createLink(params.data.displayId, _self.orderIdLinkClicked(params.data.purchaseOrderId, params.data.versionId))
        },
        width:90
      },
      {
        headerName: "Buyer",
        field: "buyer",
        headerClass: "grid-header",
        width:150
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        cellRenderer: (params) => {
          let itemUrl = `pages/items/items/item-details;itemId=${params.node.data.itemId}`;
          return this.linkCreator.createItemLink(params.node.data.itemId, params.node.data.partNumber)
        },
        width:150
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        headerClass: "grid-header",
        width:150
      },
      {
        headerName: "Location",
        field: "location",
        headerClass: "grid-header",
        width:150
      },
      {
        headerName: "Order Date",
        field: "orderDate",
        headerClass: "grid-header",
        width:120
      },
      {
        headerName: "Contact Name",
        field: "contactName",
        headerClass: "grid-header",
        hide:this.contactId?true:false,
        width:150
      },
      {
        headerName: "Qty",
        field: "qty",
        headerClass: "grid-header",
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
        headerName: "Date Code",
        field: "dataCode",
        headerClass: "grid-header",
        width:120
      },
      {
        headerName: "Status",
        field: "status",
        headerClass: "grid-header",
        width:110
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        width:110
      }
    ]
    this.purchaseOrderGrid.api.setColumnDefs(poColumnDefs);
  }

}
