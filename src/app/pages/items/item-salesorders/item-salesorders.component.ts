import { Component, OnInit, AfterViewInit, Input, Output } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { ItemsService} from './../../../_services/items.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import { Router } from '@angular/router';


@Component({
  selector: 'az-item-salesorders',
  templateUrl: './item-salesorders.component.html',
  styleUrls: ['./item-salesorders.component.scss']
})
export class ItemSalesOrdersComponent implements OnInit {
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
    private router: Router, 

  ) {
    var _self = this;
    this.agGridOptions = {
      enableServerSideSorting: true,
      enableServerSideFilter: true,
      context : _self,
      enableColResize: true,
      rowDeselection: true,
      rowModelType: 'serverSide',
      suppressContextMenu:true,
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
             console.log('Item SalesOrders Grid - sort column not supported: ' + sortCol)
           }
   
           else {
             console.log('Item SalesOrders Grid - sort by: ' + sortCol + ', ' + sortOrder);
           }
         }
         
         console.log('Item SalesOrders grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
         self.itemservice.ItemSalesOrders(self.itemId, rowOffset, rowLimit, sortCol, DescSort).subscribe(
           data => {
             let items = data.results;
             console.log('Sales Order Items', items);
   
             //Total Rows
             self.totalRowCount = data.totalRowCount;
             console.log('Item SalesOrders grid total rows: ' + self.totalRowCount);

             let itemDataService = [];
             items.ForEach(element => {
               itemDataService.push({
                 soLineId: element.soLineId,
                 salesOrderId: element.salesOrderId,
                 versionId: element.versionId,
                 displayId: self.sopoUtilities.DisplayOrderId(element.soExternalId, element.salesOrderId),
                 accountName: element.accountName,
                 accountId: element.accountId,
                 contactId: element.contactId,
                 contactName: element.firstName + ' ' + element.lastName,
                 orgName: element.orgName,
                 orderDate: element.orderDate,
                 shipDate: element.shipDate,
                 dateCode: element.dateCode,
                 quantity: element.quantity,
                 price: element.price,
                 cost: element.cost,
                 packagingId: element.packagingId,
                 packagingName: element.packagingName,
                 packageConditionId: element.packageConditionId,
                 conditionName: element.conditionName,
                 owners: element.owners,
                 soExternalId: element.soExternalId
               })
             })
             
             //Callback return total row count
             params.successCallback(itemDataService, data.totalRowCount);
             
           }
         )
       } 
     }
     
      return dataSource;
   }
 
   CreateParentColDefs() {
     let _self = this;
     return [
       {
         headerName: "Sales Order #",
         field: "displayId",
         headerClass: "grid-header",
         width: 105,       
         cellRenderer:function(params){
           if (params.data) {
            return _self.createLink(params.data.displayId, _self.soLinkClicked(params.data.salesOrderId,params.data.versionId))
           }
          return '';
          }
       },
       {
        headerName: "Customer",
        field: "accountName",
        headerClass: "grid-header",
        width: 300,
        cellRenderer: function (params) {
          return _self.AccountRenderer(params, _self)
        }
      },
       {
         headerName: "Contact",
         field: "contactName",
         headerClass: "grid-header",
         width: 300,
         cellRenderer: function (params) {
          return _self.AccountRenderer(params, _self)
        }
       },
       {
         headerName: "Quantity Sold",
         field: "quantity",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Sold Price",
         field: "price",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Unit Cost",
         field: "cost",
         headerClass: "grid-header",
         width: 100
       },
       {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 104
      },
       {
         headerName: "Packaging",
         field: "packagingName",
         headerClass: "grid-header",
         width: 104
       },
       {
         headerName: "Ship Date",
         field: "shipDate",
         headerClass: "grid-header",
         width: 154
       },
       {
         headerName: "Owner",
         field: "owners",
         headerClass: "grid-header",
         width: 204
       },
     ]
   }

  createLink (text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  soLinkClicked(soId,versionId){
    return ()=> this.router.navigate(['pages/sales-orders/sales-order-details', { soId: soId, soVersionId: versionId}]);
  }
 
  AccountRenderer(params, _self){
    let a = document.createElement("a");
    if (params.data) {
      let displayText = params.value;
      let accountId= params.data.accountId;
      let contactId= params.data.contactId;

      a.style.textDecoration = 'underline';
      a.href = 'javascript:void(0)';
      a.addEventListener("click", (e) => {
        if (params.colDef.field == 'contactName')
        _self.router.navigate(['pages/accounts/contact-details', { contactId: contactId, accountId: accountId }]); 
        else
          _self.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
      })
      a.innerText = displayText;
    }

    return a;
  }

 }
 