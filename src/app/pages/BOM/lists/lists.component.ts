import { Component, OnInit, ViewEncapsulation,OnDestroy,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, IServerSideDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BOMsService } from './../../../_services/boms.service';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { GridSettings } from './../../../_models/common/GridSettings';


@Component({
  selector: 'az-bom-list',
  templateUrl:'./lists.component.html',
  providers: [AGGridSettingsService]
})

export class BomListComponent { 
  private agGridOptions: GridOptions;
  private AcData = [];
  private columnDefs: any;
  private searchParamter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 25;
  public totalRowCount: number = 0;
  public sortBy: string = '';
  private glbDataSource: IServerSideDatasource;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'bom-list';
  private defaultGridSettings: GridSettings;
  

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private bomService: BOMsService, 
    private agGridSettings: AGGridSettingsService) {
      this.defaultGridSettings = new GridSettings();
      let _self = this;

  }

  ngOnInit() {
    this.PopulateGridDataSource(this.searchParamter);
    this.CreateAGGrid();
  }

  ngAfterViewInit(): void {
   
    jQuery(".listGrid .quotePartsButton").appendTo(".listGrid .ag-paging-panel");
  }

  refreshGrid(){
    console.log("refresh list.component")

    this.agGridOptions.api.setServerSideDatasource(this.glbDataSource);
  }

  onCellClicked(e) {
    let colId = e.column.colId;
    let BOMId = e.data.itemListId;

    console.log(colId + ' column clicked with BOM: ' + BOMId);
    if (colId == 'itemListId')
      this.router.navigate(['pages/bom/search', { bomListId: BOMId}]);
  }

  SearchBOMs() {
    console.log('BOM grid - bom search: ' + this.searchParamter);
    this.PopulateGridDataSource(this.searchParamter);
    this.agGridOptions.api.setServerSideDatasource(this.glbDataSource);
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
            console.log('BOM Grid - sort column not supported: ' + sortCol)
          }

          else {
            console.log('BOM Grid - sort by: ' + sortCol + ', ' + sortOrder);
          }
        }

        console.log('BOM grid asking for rows  ' + params.request.startRow + ' to ' + params.request.endRow);
        self.bomService.getBOMList(searchString, rowOffset, rowLimit, sortCol, DescSort)
        .subscribe(
          data => {
            let boms = data.bomList;
            //Total Rows
            self.totalRowCount = data.rowCount;
            console.log('BOM grid total rows: ' + self.totalRowCount);

            let bomDataService = [];
            boms.ForEach(element => {
              bomDataService.push({
                itemListId: element.itemListId,
                listName: element.listName,
                accountId: element.accountId,
                accountName: element.accountName,
                contactId: element.contactId,
                contactName: element.contactName,
                itemCount: element.itemCount,
                fileName: element.fileName,
                statusId: element.statusId,
                statusName: element.statusName,
                userName: element.userName,
                loadDate: element.loadDate,
                comments: element.comments,
                organizationName: element.organizationName
              })
            
            })
            if(bomDataService.length==0){
              bomDataService.push({
                comments:''
              })
              self.agGridOptions.api.showNoRowsOverlay();
            }
              //Callback return total row count
              params.successCallback(bomDataService, data.rowCount);

            if (boms.Count() == 0) {
              bomDataService.push({
                itemListId: null,
                listName: null,
                accountId: null,
                accountName: null,
                contactId: null,
                contactName: null,
                itemCount: null,
                fileName: null,
                statusId: null,
                statusName: null,
                userName: null,
                loadDate: null,
                organizationName: null
              })
              params.successCallback(bomDataService, data.rowCount);
            }

          }
        )
      }

    }

    this.glbDataSource = dataSource;
  }

  CreateAGGrid() {
    const _self = this;
    this.agGridOptions = {
      // floatingFilter:true,
      enableServerSideSorting: true,
      // enableServerSideFilter: true,
      enableColResize: true,
      rowSelection: 'single',
      pagination:true,
      rowDeselection: true,
      suppressContextMenu:true,
      rowModelType: 'serverSide',
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState();
        }, 0)
      },
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      }
    };

    this.agGridOptions.serverSideDatasource = this.glbDataSource;
    this.agGridOptions.columnDefs = [
      {
        headerName: "List #",
        field: "itemListId",
        headerClass: "grid-header",
        width: 75,
        maxWidth: 75
      },
      {
        headerName: "Description",
        field: "listName",
        headerClass: "grid-header",
        width: 200
      },
      {
        headerName: "Account",
        field: "accountName",
        headerClass: "grid-header",
        width: 245
      },
      {
        headerName: "Contact",
        field: "contactName",
        headerClass: "grid-header",
        width: 200
      },
      {
        headerName: "Item Count",
        field: "itemCount",
        headerClass: "grid-header",
        width: 75
      },
      {
        headerName: "BOM File",
        field: "fileName",
        headerClass: "grid-header",
        width: 275
      },
      {
        headerName: "Status",
        field: "statusName",
        headerClass: "grid-header",
        width: 150
      },
      {
        headerName: "User",
        field: "userName",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Load Date",
        field: "loadDate",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName: "Organization",
        field: "organizationName",
        headerClass: "grid-header",
        width: 175
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        minWidth: 40,
        width: 40,
        pinned: "right"
      }
    ]
  }

  commentsRenderer(params, _self){
    let span = document.createElement('span');
    span.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    return span;
  }

  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
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
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
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
        console.log('Load Grid Settings: ')
        console.log(data);
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  exportGrid_Click(event) {
    let url = 'api/boms/getBOMExportList?searchString=' + this.searchParamter;
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled','')
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
         jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
           // Animation complete.
         });
        }
      })
 }
}
