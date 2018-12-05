import { Component, OnInit, AfterViewInit, Input, Output } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { ItemsService} from './../../../_services/items.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'az-item-availability',
  templateUrl: './item-availability.component.html',
  styleUrls: ['./item-availability.component.scss']
})
export class ItemAvailabilityComponent implements OnInit, AfterViewInit {
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
      pagination:true,
      suppressContextMenu:true,
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
             console.log('Item Availability Grid - sort column not supported: ' + sortCol)
           }
   
           else {
             console.log('Item Availability Grid - sort by: ' + sortCol + ', ' + sortOrder);
           }
         }
   
         console.log('Item Availability grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
         self.itemservice.GetItemAvailability(self.itemId, rowOffset, rowLimit, sortCol, DescSort).subscribe(
           data => {
             let items = data.results;
   
             //Total Rows
             self.totalRowCount = data.totalRowCount;
              console.log('Item Availability grid total rows: ' + self.totalRowCount);
             let itemDataService = [];
             items.ForEach(element => {
               itemDataService.push({
                 sourceId: element.sourceId,
                 displayId: self.sopoUtilities.DisplayOrderId(element.externalId, element.sourceId),
                 accountId: element.accountId,
                 accountName: element.accountName,
                 buyer: element.createdBy,
                 typeName: element.typeName, 
                 created: element.created,
                 createdBy: element.createdBy,
                 dateCode: element.dateCode,
                 quantity: element.quantity,
                 rating: element.rating,
                 cost: element.cost,
                 rtpQty: element.rtpQty,
                 packagingId: element.packagingId,
                 packagingName: element.packagingName,
                 leadTimeDays: element.leadTime? element.leadTime  + ' d' : '',
                 moq: element.moq,
                 externalId: element.externalId,
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
 
   CreateParentColDefs() {
     let _self = this;
     return [
      {
        headerName: "Type",
        field: "typeName",
        headerClass: "grid-header",
        width: 100
      },
       {
         headerName: "Date",
         field: "created",
         headerClass: "grid-header",
         width: 250
       },
       {
        headerName: "Buyer",
        field: "createdBy",
        headerClass: "grid-header",
        width: 250
      },
       {
         headerName: "Vendor",
         field: "accountName",
         headerClass: "grid-header",
         width: 250,
         cellRenderer: function (params) {
           return _self.VendorRenderer(params, _self)
         },
       },
       {
         headerName: "Rating",
         field: "rating",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Quantity",
         field: "quantity",
         headerClass: "grid-header",
         width: 100
       },
       {
         headerName: "Cost",
         field: "cost",
         headerClass: "grid-header",
         width: 104
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
        headerName: "Lead Time",
        field: "leadTimeDays",
        headerClass: "grid-header",
        width: 104
      },
      {
        headerName: "MOQ",
        field: "moq",
        headerClass: "grid-header",
        width: 104
      }
     ]
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
 }
 