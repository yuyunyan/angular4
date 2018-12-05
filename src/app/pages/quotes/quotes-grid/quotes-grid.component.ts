import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { QuoteService } from './../../../_services/quotes.service';
import { Quote } from './../../../_models/quotes/quote';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { GridSettings } from './../../../_models/common/GridSettings';
import { element } from 'protractor';
import { isNull } from 'util';

@Component({
  selector: 'az-quotes-grid',
  templateUrl: './quotes-grid.component.html',
  styleUrls: ['./quotes-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class QuotesGridComponent implements OnInit, OnDestroy, AfterViewInit {
  private agGridOptions: GridOptions;

  private searchParameter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 0;
  public sortBy: string = '';
  public includeCompleted: boolean = false;
  public includeCanceled: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'quotes-grid';
  private generalPermission = 'generalPermission';
  private defaultGridSettings: GridSettings;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private quoteservice: QuoteService,
    private agGridSettings: AGGridSettingsService,
    private ngxPermissionsService: NgxPermissionsService) {
    this.defaultGridSettings = new GridSettings();

    let _self = this;
    this.agGridOptions = {
      //enableFilter:true,
      enableServerSideSorting: true,
      enableServerSideFilter: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      suppressContextMenu:true,
      pagination: true,
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      columnDefs: _self.CreateAGGrid(),
      toolPanelSuppressSideButtons: true,
      defaultColDef: {
        suppressMenu: true
      },
      onGridReady: e => {
        setTimeout(() => {
          _self.loadGridState();
        }, 0)
      }
    };
    if (localStorage.getItem(this.generalPermission)) {
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }
  }

  ngOnInit() {
   
  }
  ngAfterViewInit(): void {
    jQuery(".quotesGridOuter .quotePartsButton").appendTo(".quotesGridOuter .ag-paging-panel");
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

  addQuote(e) {
    this.router.navigate(['pages/quotes/quote-details', { quoteId: 0 }]);
  }
  onCellClicked(e) {
    let quoteId = e.data.QuoteID;
    let versionId = e.data.VersionID;
    this.router.navigate(['pages/quotes/quote-details', { quoteId: quoteId, quoteVersionId: versionId }]);
  }

  AddNewQuote() {
    this.router.navigate(['pages/quotes/quote-details']);
  }

  SearchQuotes() {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

  PopulateGridDataSource(searchString: string) {
    let self = this;
    var dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;

        let sortCol = '';
        let sortOrder = '';
        let DescSort = true;

        let filterColumn = null;
        let filterText = null;
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
        }
        if (params.filterModel && Object.keys(params.filterModel).length > 0) {
          for (let col in params.filterModel) {
            if (params.filterModel[col].value != '') {
              filterColumn = col;
              filterText = params.filterModel[col].value;
              break;
            }
          }
        }


        self.quoteservice.GetQuoteList(searchString, rowOffset, rowLimit, sortCol, DescSort, filterColumn, filterText, self.includeCanceled, self.includeCompleted)
          .subscribe(
            data => {
              let quotes = data.results;

              //Total Rows
              self.totalRowCount = data.totalRowCount;

              let quoteDataService = [];
              quotes.ForEach(element => {
                quoteDataService.push({
                  QuoteID: element.QuoteID,
                  AccountID: element.AccountID,
                  AccountName: element.AccountName,
                  ContactID: element.ContactID,
                  ContactFullName: element.ContactFullName,
                  StatusName: element.StatusName,
                  SentDate: self.newDate(element.SentDate),
                  CountryName: element.CountryName,
                  Owners: element.Owners,
                  VersionID: element.VersionID
                })

              })
              //Callback return total row count
              
              if (quoteDataService.length ==0) {
                //self.agGridOptions.api.doLayout();//.showNoRowsOverlay();
                quoteDataService.push({
                  QuoteID:'',
                  AccountID:'' ,
                  AccountName: '',
                  ContactID: '',
                  ContactFullName:'' ,
                  StatusName: '',
                  SentDate:'' ,
                  CountryName:'',
                  Owners: '',
                  VersionID:'' 
                });
                self.agGridOptions.api.showNoRowsOverlay();
              }
              params.successCallback(quoteDataService, data.totalRowCount)
             
            }
          )
      }

    }

    return dataSource;
  }

  OnChangeCheckbox() {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

  newDate(element) {
    if (element == null) {
      return "";
    } else {
      let quoteDate = new Date(element);
      let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return quoteDate.toLocaleDateString('en', options);
    }
  }

  CreateAGGrid() {
    const _self = this;
    return [
      {
        headerName: "Quote #",
        field: "QuoteID",
        headerClass: "grid-header",
        width: 75,
        maxWidth: 75,
        suppressFilter: true,
        cellRenderer: function (params) {
          return _self.createLink(params.data.QuoteID, _self.quoteIdLinkClicked(params.data.QuoteID, params.data.VersionID))
        }
      },
      {
        headerName: "Customer",
        field: "AccountName",
        headerClass: "grid-header",
        width: 325,
        filterFramework: ColumnFilterComponent,
        cellRenderer: function (params) {
          return _self.createLink(params.data.AccountName, _self.accountLinkClicked(params.data.AccountID))
        }
      },
      {
        headerName: "Contact",
        field: "ContactFullName",
        headerClass: "grid-header",
        width: 230,
        filterFramework: ColumnFilterComponent,
        cellRenderer: function (params) {
          return _self.createLink(params.data.ContactFullName, _self.contactLinkClicked(params.data.ContactID, params.data.AccountID))
        }
      },
      {
        headerName: "Quote Status",
        field: "StatusName",
        headerClass: "grid-header",
        width: 150,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Quote Date",
        field: "SentDate",
        headerClass: "grid-header",
        width: 150,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Customer Country",
        field: "CountryName",
        headerClass: "grid-header",
        width: 175,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Owner",
        field: "Owners",
        headerClass: "grid-header",
        width: 675,
        filterFramework: ColumnFilterComponent,
      }
    ]
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
    let url = `pages/accounts/account-details;accountId=${accountId}`
    return () => window.open(url, "_blank");

  }

  contactLinkClicked(contactId, accountId) {
    // return () => this.router.navigate(['pages/accounts/contact-details', { contactId: contactId, accountId: accountId}]);
    let url = `pages/accounts/contact-details;contactId=${contactId};accountId=${accountId}`;
    return () => window.open(url, '_blank');
  }

  quoteIdLinkClicked(quoteId, versionId) {
    return () => this.router.navigate(['pages/quotes/quote-details', { quoteId: quoteId, quoteVersionId: versionId }]);
  }

  refreshGrid() {
    console.log("refresh quotes-grid")

    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParameter));
  }

  resetGridColumns_Click() {
    this.agGridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.agGridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
    this.agGridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef);
    this.agGridOptions.api.sizeColumnsToFit();
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

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.agGridOptions.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.agGridOptions.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.agGridOptions.api.getFilterModel();
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
      })
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  exportGrid_Click(event) {
    let url = 'api/quote/getQuotesExportList';
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
