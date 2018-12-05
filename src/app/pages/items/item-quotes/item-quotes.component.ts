import { Component, OnInit, AfterViewInit, Input, Output } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { ItemsService} from './../../../_services/items.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import { Router, ActivatedRoute } from '@angular/router';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';

@Component({
  selector: 'az-item-quotes',
  templateUrl: './item-quotes.component.html',
  styleUrls: ['./item-quotes.component.scss']
})
export class ItemQuotesComponent implements OnInit {
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
    private gpUtilities: GPUtilities,
    private router: Router
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
             console.log('Item Quotes Grid - sort column not supported: ' + sortCol)
           }
   
           else {
             console.log('Item Quotes Grid - sort by: ' + sortCol + ', ' + sortOrder);
           }
         }
   
         console.log('Item quotes grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
         self.itemservice.GetItemQuotes(self.itemId, rowOffset, rowLimit, sortCol, DescSort).subscribe(
           data => {
             let items = data.results;
             //Total Rows
             self.totalRowCount = data.totalRowCount;
              console.log('Item Quotes grid total rows: ' + self.totalRowCount);
             let itemDataService = [];
             items.ForEach(element => {
               itemDataService.push({
                 quoteId: element.quoteId,
                 quoteLineId: element.quoteLineId,
                 versionId: element.versionId,
                 accountId: element.accountId,
                 accountName: element.accountName,
                 dateCode: element.dateCode,
                 gpm: !isNaN(element.gpm)? (element.gpm * 100).toFixed(2) +'%'  : '',
                 gp:self.gpUtilities.GrossProfit(element.quantity,element.cost,element.price),
                 contact: element.firstName + ' ' + element.lastName,
                 firstName: element.firstName,
                 lastName: element.lastName,
                 contactId: element.contactId,
                 organizationId: element.organizationId,
                 orgName: element.orgName,
                 statusId: element.statusId,
                 statusName: element.statusName,
                 sentDate: element.sentDate,
                 quantity: element.quantity,
                 cost: element.cost? parseFloat(element.cost).toFixed(2) : '',
                 price: element.price,
                 packagingId: element.packagingId,
                 packagingName: element.packagingName,
                 owners: element.owners
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

   grossProfit(element){
    let gp = (element.quantity * element.price) - (element.quantity * element.cost)
    return gp;
   }
 
   CreateParentColDefs() {
     let _self = this;
     return [
       {
         headerName: "Quote #",
         field: "quoteId",
         headerClass: "grid-header",
         cellRenderer: function(params) {
           if (params.data) {
            return _self.quoteAnchorCellRenderer(params, _self)
           }
          },
         width: 90
       },
       {
        headerName: "Customer",
        field: "accountName",
        headerClass: "grid-header",
        width: 250,
        cellRenderer: function (params) {
          return _self.AccountRenderer(params, _self)
        }
      },
       {
         headerName: "Contact",
         field: "contact",
         headerClass: "grid-header",
         width: 250,
         cellRenderer: function (params) {
          return _self.AccountRenderer(params, _self)
        }
       },
       {
         headerName: "Quote Status",
         field: "statusName",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Quote Date",
         field: "sentDate",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Quantity",
         field: "quantity",
         headerClass: "grid-header",
         width: 92
       },
       {
        headerName: "Price (USD)",
        field: "price",
        headerClass: "grid-header",
        width: 92
      },
       {
         headerName: "Cost (USD)",
         field: "cost",
         headerClass: "grid-header",
         width: 92
       },
       {
        headerName: "GP(%)",
        field: "gpm",
        headerClass: "grid-header",
        width: 92
      },
      {
        headerName: "GP (USD)",
        field: "gp",
        headerClass: "grid-header",
        width: 92
      },
       {
         headerName: "Date Code",
         field: "dateCode",
         headerClass: "grid-header",
         width: 92
       },
       {
         headerName: "Packaging",
         field: "packagingName",
         headerClass: "grid-header",
         width: 120
       },
       {
        headerName: "Owner",
        field: "owners",
        headerClass: "grid-header",
        width: 204
      }
     ]
   }
 
   quoteAnchorCellRenderer(params, self){
    let a = document.createElement('a');
     a.innerText = params.value;
     a.href = "javascript:void(0)";
     a.onclick = function () {
       self.router.navigate(['pages/quotes/quote-details', { quoteId: params.data.quoteId, quoteVersionId: params.data.versionId }]);
     }

    return a;
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
        if (params.colDef.field == 'contact')
        _self.router.navigate(['pages/accounts/contact-details', { contactId: contactId, accountId: accountId }]); 
        else
          _self.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
      })
      a.innerText = displayText;
    }

    return a;
  }

 }
 