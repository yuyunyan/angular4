import { Component, OnInit, ViewEncapsulation,OnDestroy, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RfqsService } from './../../../_services/rfqs.service';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { Subject } from 'rxjs/Subject';
import { NgxPermissionsService } from 'ngx-permissions';
import { NotificationsService } from 'angular2-notifications';
import { GridSettings } from './../../../_models/common/GridSettings';


@Component({
  selector: 'az-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss'],
  providers: [AGGridSettingsService]
})
export class RfqListComponent implements OnInit,OnDestroy,AfterViewInit {
  private gridName = 'rfq-list';
  private agGridOptions: GridOptions;
  private AcData = [];
  private columnDefs: any;
  private searchParamter: string = '';
  public rowOffset: number = 0;
  public rowLimit: number = 20;
  public totalRowCount: number = 0;
  public sortBy: string = '';
  private defaultGridSettings: GridSettings;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private generalPermission = 'generalPermission';
  public notifyOptions = {
    position: ['top', 'right'],
    timeout: 3000,
    lastOnBottom: true
  };
  
  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private rfqService: RfqsService, 
    private agGridSettings: AGGridSettingsService,
    private ngxPermissionsService: NgxPermissionsService,
    private _notificationsService: NotificationsService,
    private permissionsService: NgxPermissionsService) {
      this.defaultGridSettings = new GridSettings();

      let _self = this;
      this.agGridOptions = {
        // floatingFilter:true,
        enableServerSideSorting: true,
        // enableServerSideFilter: true,
        enableColResize: true,
        rowSelection: 'single',
        rowDeselection: true,
        rowModelType: 'serverSide',
        pagination:true,
        cacheBlockSize: 25,
        maxBlocksInCache:1,
        suppressContextMenu:true,
        paginationPageSize: this.rowLimit,
        maxConcurrentDatasourceRequests: 2,
        columnDefs : _self.CreateAGGrid(),
        toolPanelSuppressSideButtons:true,
        defaultColDef:{suppressMenu:true},
        onGridReady: e => {
          setTimeout( () => {
              _self.loadGridState();
          }, 0)
        }
      };
    if (localStorage.getItem(this.generalPermission)){
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }
  }

  permissionsAllowed() {
    const permissions = this.permissionsService.getPermissions();
    return (permissions['CanView27'])
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    jQuery(".vendorRfqGrid .quotePartsButton").appendTo(".vendorRfqGrid .ag-paging-panel");
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
  }

  addRfq(e) {
    if (this.permissionsAllowed())
      this.router.navigate(['pages/rfqs/rfq-details', { rfqId: 0}]);
  } 

  onCellClicked(e) {
    let colId = e.column.colId;
    let rfqId = e.data.vendorRfqId;

    if (this.permissionsAllowed())
      this.router.navigate(['pages/rfqs/rfq-details', { rfqId: rfqId }]);
      else {
        if (jQuery('az-rfq-list .sn-content').length == 0) //existing toast notifications
          this._notificationsService.error('Warning', "You do not have permission to view RFQ's", true);
      }
  }

  SearchRfqs() {
    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
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
         
        }

        self.rfqService.getAllRfqs(searchString, rowOffset, rowLimit, sortCol, DescSort)
        .subscribe(
          data => {
            let rfqs = data.rfqList;

            //Total Rows
            self.totalRowCount = data.rowCount;

            let rfqDataService = [];
            rfqs.ForEach(element => {
              rfqDataService.push({
                vendorRfqId: element.vendorRfqId,
                supplierId: element.supplierId,
                supplierName: element.supplierName,
                contactId: element.contactId,
                contactName: element.contactName,
                statusId: element.statusId,
                statusName: element.statusName,
                sentDate: element.sentDate,
                buyer: element.buyer
              })
             
            })
             //Callback return total row count
             params.successCallback(rfqDataService, data.rowCount);

            if (rfqs.Count() == 0) {
              params.successCallback(rfqDataService, data.rowCount);
            }

          }
        )
      }

    }
    return dataSource;
  }

  CreateAGGrid() {
    
    return [
      {
        headerName: "RFQ",
        field: "vendorRfqId",
        headerClass: "grid-header",
        width: 75,
        maxWidth: 65
      },
      {
        headerName: "Supplier",
        field: "supplierName",
        headerClass: "grid-header",
        width: 450
      },
      {
        headerName: "Contact",
        field: "contactName",
        headerClass: "grid-header",
        width:375
      },
      {
        headerName: "RFQ Status",
        field: "statusName",
        headerClass: "grid-header",
        width: 250
      },
      {
        headerName: "Sent Date",
        field: "sentDate",
        headerClass: "grid-header",
        width: 250
      },
      {
        headerName: "Buyer",
        field: "buyer",
        headerClass: "grid-header",
        width: 388
      }
    ]
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
        if (data.ColumnDef != null)
          this.agGridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.agGridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.agGridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  refreshGrid(){
    console.log("refresh rfq-list")

    this.agGridOptions.api.setServerSideDatasource(this.PopulateGridDataSource(this.searchParamter));
  }

  exportGrid_Click(event) {
    let url = 'api/rfqs/getAllRfqsExport?searchString=' + this.searchParamter;
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
