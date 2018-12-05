import { Component, OnInit, Input, Output,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { ItemsService} from './../../../_services/items.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'az-item-inventory',
  templateUrl: './item-inventory.component.html',
  styleUrls: ['./item-inventory.component.scss']
})
export class ItemInventoryComponent implements OnInit,AfterViewInit {
  @Input() itemId: number;
  private rowData = [];
  private agGridOptions: GridOptions;
  private glbDataSource : IDatasource;
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 0;
  public sortBy: string = '';
  constructor(
    private itemservice: ItemsService,
    private sopoUtilities: PoSoUtilities,
    private router:Router
  ) {
    var _self = this;
    this.agGridOptions = {
      enableServerSideSorting: true,
      enableServerSideFilter: true,
      context : _self,
      enableColResize: true,
      rowDeselection: true,
      suppressContextMenu:true,
      rowModelType: 'serverSide',
      pagination:true,
      cacheBlockSize: _self.rowLimit,
      maxBlocksInCache:1,
      toolPanelSuppressSideButtons: true,
      paginationPageSize: _self.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      headerHeight: 30,
      suppressRowClickSelection: true,
      suppressCellSelection: true,
      defaultColDef: {
        suppressMenu: true
      },
      //enableFilter:true,
      columnDefs: _self.CreateParentColDefs(),
    };
  }

  ngOnInit() {
  }
  
  ngAfterViewInit(): void {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource());
  }
  
  PopulateGridDataSource() {
    let self = this;

    var dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;
        
        let sortCol = '';
        let sortOrder = '';
        let DescSort = false;
        let ExcludePo = true;
        //Sort detected
        if (params.request.sortModel[0]) {
          sortCol = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort;
          switch (sortOrder) {
              case "asc":
                  DescSort = false;
                  break;
  
              case "desc":
                  DescSort = true;
                  break;
          }
          if (sortCol == "Status" || sortCol == "Description") {
            console.log('Item Inventory Grid - sort column not supported: ' + sortCol)
          }
  
          else {
            console.log('Item Inventory Grid - sort by: ' + sortCol + ', ' + sortOrder);
          }
        }
  
        console.log('Item Inventory grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
        self.itemservice.GetItemInventory(self.itemId,ExcludePo, rowOffset, rowLimit, sortCol, DescSort).subscribe(
          data => {
            let items = data.results;
  
            //Total Rows
            self.totalRowCount = data.totalRowCount;
             console.log('Item grid total rows: ' + self.totalRowCount);
            let itemDataService = [];
            items.ForEach(element => {
              itemDataService.push({
                displayId: self.sopoUtilities.DisplayOrderId(element.externalId, element.purchaseOrderId),
                warehouseId: element.warehouseId,
                warehouseName: element.warehouseName,
                accountId: element.accountId,
                accountName: element.accountName,
                origQty: element.origQty,
                availableQty: element.availableQty,
                reservedQty: element.origQty - element.availableQty,
                purchaseOrderId: element.purchaseOrderId,
                poVersionId: element.poVersionId,
                externalId: element.externalId,
                buyers: element.buyers,
                cost: element.cost,
                soId: element.allocated[0]? element.allocated[0].salesOrderID : '',
                soVersionId:  element.allocated[0]? element.allocated[0].soVersionId : '',
                displaySalesOrderId: element.allocated && element.allocated.length > 0 ? self.sopoUtilities.DisplayOrderId(element.allocated[0].externalID, element.allocated[0].salesOrderID) : 'Available',
                dateCode: element.dateCode,
                packagingName: element.packagingName,
                conditionName: element.packageCondition,
                shipDate: element.shipDate
              })
  
              //Callback return total row count
              params.successCallback(itemDataService, data.totalRowCount);
            })
            if (items.Count() == 0) {
              params.successCallback(itemDataService, data.totalRowCount);
            }
          
          }
        )}
  
    }
    
     return dataSource;
  }

  VendorRenderer(params, _self){
    let a = document.createElement("a");
    if (params.data) {
      let displayText = params.data.accountName;
      let accountId= params.data.accountId;
      a.style.textDecoration = 'underline';
      a.href = 'javascript:void(0)';
      a.addEventListener("click", (e) => {
        _self.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
      })
      a.innerText = displayText;
    }

    return a;
  }
  AllocationRenderer(params, _self){
    let div = document.createElement("div");
    if (params.data) {
      let soId = params.data.soId;
      let soVersionId = params.data.soVersionId;
      let displayText =  params.data.displayOrderId;
      if(soId && soVersionId){
        let a = document.createElement("a");
        a.href =  'javascript:void(0)';
        a.style.textDecoration = 'underline';
        a.addEventListener("click", (e) => {
          e.preventDefault();
          window.open(`/pages/sales-orders/sales-order-details;soId=${soId};soVersionId=${soVersionId}`, "_blank")
        })
        a.innerText = displayText;
        div.appendChild(a);
        return div;
      }
      div.innerHTML = params.data.displaySalesOrderId;
    }
    return div;
  }

  CreateParentColDefs() {
    let _self = this;
    return [
      {
        headerName: "Vendor",
        field: "accountName",
        headerClass: "grid-header",
        width: 325,
        cellRenderer: function (params) {
          return _self.VendorRenderer(params, _self)
        },
      },
      {
        headerName: "Buyers",
        field: "buyers",
        headerClass: "grid-header",
        width: 230
      },
      {
        headerName: "Qty",
        field: "origQty",
        headerClass: "grid-header",
        width: 155
      },
      
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 155
      },
      {
        headerName: "Packaging",
        field: "packagingName",
        headerClass: "grid-header",
        width: 155
      },
      {
        headerName: "Package Condition",
        field: "conditionName",
        headerClass: "grid-header",
        width: 129
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width: 129
      },
      {
        headerName: "Allocated",
        field: "displayId",
        headerClass: "grid-header",
        width: 129,
        cellRenderer: function(params)  {
          return _self.AllocationRenderer(params, _self) },
      },
      {
        headerName: "Cost (USD)",
        field: "cost",
        headerClass: "grid-header",
        width: 129
      }
    ]
  }
  POAnchorRenderer(params, self){
    let a = document.createElement('a');
    a.text = params.value;
      a.href = 'javascript:void(0)',
      a.onclick = function () {
        self.router.navigate(['pages/purchase-orders/purchase-order-details',{purchaseOrderId: params.data.purchaseOrderId, versionId: params.data.poVersionId}]);
      }
    return a;
  }
  
}
