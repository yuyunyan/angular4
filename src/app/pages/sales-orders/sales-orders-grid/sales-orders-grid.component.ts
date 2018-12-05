import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SalesOrdersService } from './../../../_services/sales-orders.service';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities';
@Component({
  selector: 'az-sales-orders-grid',
  templateUrl: './sales-orders-grid.component.html',
  styleUrls: ['./sales-orders-grid.component.scss'],
  providers: [AGGridSettingsService]
})

export class SalesOrdersGridComponent implements OnInit, AfterViewInit {
  private gridName = 'sales-orders';
  private agGridOptions: GridOptions;
  private searchParamter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 1000;
  public sortBy: string = '';

  private generalPermission = 'generalPermission';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private salesOrderService: SalesOrdersService,
    private agGridSettings: AGGridSettingsService,
    private ngxPermissionsService: NgxPermissionsService,
    private sopoUtilties: PoSoUtilities) {
    let _self = this;
    this.agGridOptions = {
      // floatingFilter:true,
      enableServerSideSorting: true,
      // enableServerSideFilter: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      suppressDragLeaveHidesColumns: true,
      suppressContextMenu:true,
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      toolPanelSuppressSideButtons: true,
      defaultColDef: { suppressMenu: true },
      pagination: true,
      columnDefs: _self.CreateAGGrid(),
    };

    if (localStorage.getItem(this.generalPermission)) {
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }
  }

  ngOnInit() {
    this.loadGridState();
  }

  ngAfterViewInit(): void {
    jQuery(".salesOrdersGridOuter .quotePartsButton").appendTo(".salesOrdersGridOuter .ag-paging-panel");
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
  }

  onCellClicked(e) {
    //let colId = e.column.colId;
    let salesOrderId = e.data.SalesOrderID;
    let VersionId = e.data.VersionID;
    this.router.navigate(['pages/sales-orders/sales-order-details', { soId: salesOrderId, soVersionId: VersionId }]);
  }

  AddNewQuote() {
    this.router.navigate(['pages/quotes/quote-details']);
  }

  CreateAGGrid() {
    const _self = this;
    return [
      {
        headerName: "SAP #",
        field: "DisplayID",
        headerClass: "grid-header",
        width: 100,
        maxWidth: 100,
        cellRenderer: function (params) {
          if(params.data.DisplayID == null){
            return "";
          }else{
          return _self.createLink(params.data.DisplayID, _self.orderIdLinkClicked(params.data.SalesOrderID, params.data.VersionID))
          }
        }
      },
      {
        headerName: "Quotely #",
        field: "SalesOrderID",
        headerClass: "grid-header",
        width: 100,
        maxWidth: 100,
        cellRenderer: function (params) {
          return _self.createLink(params.data.SalesOrderID, _self.orderIdLinkClicked(params.data.SalesOrderID, params.data.VersionID))
        }
      },
      {
        headerName: "Customer",
        field: "Customer",
        headerClass: "grid-header",
        width: 372,
        cellRenderer: function (params) { return _self.createLink(params.data.Customer, _self.accountLinkClicked(params.data.AccountID)) }
      },
      {
        headerName: "Contact",
        field: "ContactFull",
        headerClass: "grid-header",
        width: 280,
        cellRenderer: function (params) { return _self.createLink(params.data.ContactFull, _self.contactLinkClicked(params.data.ContactID, params.data.AccountID)) }
      },
      {
        headerName: "Order Status",
        field: "OrderStatus",
        headerClass: "grid-header",
        width: 150
      },
      {
        headerName: "Order Date",
        field: "OrderDate",
        headerClass: "grid-header",
        width: 245
      },
      {
        headerName: "Customer Country",
        field: "CustomerCountry",
        headerClass: "grid-header",
        width: 218
      },
      {
        headerName: "Owner",
        field: "Owner",
        headerClass: "grid-header",
        width: 414,
      }
    ];
  }


  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  accountLinkClicked(accountId) {
    // return () => this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
    let url = `pages/accounts/account-details;accountId=${accountId}`;
    return () => window.open(url, '_blank');
  }

  contactLinkClicked(contactId, accountId) {
    // return () => this.router.navigate(['pages/accounts/contact-details', { contactId: contactId, accountId: accountId}]);
    let url = `pages/accounts/contact-details;contactId=${contactId};accountId=${accountId}`;
    return () => window.open(url, '_blank');
  }

  orderIdLinkClicked(soId, versionId) {
    return () => this.router.navigate(['pages/sales-orders/sales-order-details', { soId: soId, soVersionId: versionId}]);
  }

  SearchSalesOrders() {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
    this.agGridOptions.api.sizeColumnsToFit();
  }

  PopulateGridDataSource(searchString: string) {
    const _self = this;

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
          /*  if (sortCol == "Status" || sortCol == "Description") {
              console.log('Sales-Order Grid - sort column not supported: ' + sortCol)
            }
            
            else if (sortCol == 'ContactFull')
              sortCol = 'ContactFirstname';
  
            else {
              console.log('Sales-Order Grid - sort by: ' + sortCol + ', ' + sortOrder);
            }*/
        }

        _self.salesOrderService.GetSalesOrderList(searchString, rowOffset, rowLimit, sortCol, DescSort).subscribe(
          data => {
            let salesOrders = data.results;
            //Total Rows
            _self.totalRowCount = data.totalRowCount;
            let salesOrderDataService = [];
            salesOrders.ForEach(element => {
              let orderDate = new Date(element.OrderDate);
              salesOrderDataService.push({
                SalesOrderID: element.SalesOrderID,
                DisplayID: element.ExternalID,
                VersionID: element.VersionID,
                Customer: element.Customer,
                ContactFull: element.ContactFull,
                OrderStatus: element.OrderStatus,
                OrderDate: _self.formatDate(orderDate),
                CustomerCountry: element.CustomerCountry,
                Owner: _self.removeLastComma(element),
                ContactID: element.ContactID,
                AccountID: element.AccountID,
                ExternalID: element.ExternalID
              })


            })

            if(salesOrderDataService.length==0){
              salesOrderDataService.push({
                DisplayID:'',
                ContactFull:'',
                Customer:''
              })
              _self.agGridOptions.api.showNoRowsOverlay();
            }

            //Callback return total row count
            params.successCallback(salesOrderDataService, data.totalRowCount);

            if (salesOrders.Count() == 0) {
              params.successCallback(salesOrderDataService, data.totalRowCount);
            }

          }
        )
      }

    }

    return dataSource;
  }

  removeLastComma(element) {
    return element.Owner ? element.Owner.trim().slice(0, -1) : '';
  }

  formatDate(orderDate) {
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return orderDate.toLocaleDateString('en', options);
  }

  resetGridColumns_Click() {
    if (this.agGridOptions.columnApi && this.agGridOptions.columnDefs){
      this.agGridOptions.columnApi.resetColumnState();
    }
    if (this.agGridOptions.api){
      this.agGridOptions.api.sizeColumnsToFit();
    }
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.agGridOptions).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut("slow", function () {
          // Animation complete.
        });
      });
  }

  refreshGrid() {
    console.log("refresh sales-orders-grid")

    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
  }

  loadGridState() {
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null && this.agGridOptions.columnApi)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null && this.agGridOptions.api)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null && this.agGridOptions.api)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
      })
  }

  exportGrid_Click(event) {
    let url = 'api/sales-order/getSalesOrderExportList?searchString=' + this.searchParamter;
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled', '')
    jQuery(senderEl).find('span').text('Exporting...');

    this.agGridSettings.GetGridExport(url).subscribe(
      data => {
        if (data.success) {
          //Button enabled/text change
          jQuery(senderEl).removeAttr('disabled');
          jQuery(senderEl).find('span').text('Export');
          //Alert Animation
          var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
          jQuery(alertEl).fadeIn("slow");
          jQuery(alertEl).delay(5000).fadeOut("slow", function () {
            // Animation complete.
          });
        }
      })
  }


}
