import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { InspectionService } from './../../../_services/inspection.service';
import { GridOptions, IDatasource } from "ag-grid";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { GridSettings } from './../../../_models/common/GridSettings';
import { Observable } from 'rxjs/Rx';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 


@Component({
  selector: 'az-inspection-grid',
  templateUrl: './inspection-grid.component.html',
  styleUrls: ['./inspection-grid.component.scss'],
  providers: [AGGridSettingsService]
})
export class InspectionGridComponent implements OnInit, OnDestroy, AfterViewInit {

  private inspectionGrid: GridOptions;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private totalRowCount: number;
  private rowLimit: number = 25;
  private autoRefresh: number = 0;
  private gridName = 'inspection-grid';
  private defaultGridSettings: GridSettings;
  private searchParameter: string = '';


  constructor(
    private inspectionService: InspectionService,
    private PoSoUtilities: PoSoUtilities,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private agGridSettings: AGGridSettingsService) {
    this.defaultGridSettings = new GridSettings();
    let _self = this;
    this.inspectionGrid = {
      animateRows: true,
      enableColResize: true,
      rowModelType: 'serverSide',
      suppressContextMenu:true,
      enableServerSideSorting: true,
      paginationPageSize: this.rowLimit,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      maxConcurrentDatasourceRequests: 2,
      toolPanelSuppressSideButtons: true,
      pagination: true,
      defaultColDef: {
        suppressMenu: true
      },
      onGridReady: e => {
        setTimeout(() => {
          _self.loadGridState();
        }, 0)
      },
      context: {
        parentComponent: this
      },
      columnDefs: _self.createGrid(),
    }
    //  this.loadGridState();


  }

  ngOnInit() {
  }

  searchInspection(){
    this.inspectionGrid.api.setServerSideDatasource(this.createGridDataSource(this.searchParameter));
  }

  createGrid() {
    let _self = this;
    return [
      {
        headerName: "Identified Stock ID",
        field: "inventoryId",
        headerClass: "grid-header",
        width: 50,
        cellRenderer: function (params) {
          return _self.creatLink(params.data.inventoryId, _self.stockClicked(params.data.inspectionId));
        }
      },
      {
        headerName: "Vendor",
        field: "supplier",
        headerClass: "grid-header",
        width: 100,
        cellRenderer: function (params) {
          return _self.creatLink(params.data.supplier, _self.vendorClicked(params.data.accountId));
        }

      },
      {
        headerName: "PO #",
        field: "poNumber",
        headerClass: "grid-header",
        width: 50,
        cellRenderer: function (params) {
          return _self.creatLink(params.data.poNumberDisplayId, _self.poClicked(params.data.poNumber,params.data.poVersionID));
        }
      },
      {
        headerName: "Customer(s)",
        field: "customers",
        headerClass: "grid-header",
        width: 100,
      },
      {
        headerName: "Status",
        field: "status",
        headerClass: "grid-header",
        width: 50,
      },
      {
        headerName: "Inspection Type",
        field: "inspectionType",
        headerClass: "grid-header",
        width: 100,
      },
      {
        headerName: "Received Date",
        field: "receivedDate",
        headerClass: "grid-header",
        width: 70,
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width: 70,
      },
      {
        headerName: "Warehouse",
        field: "warehouse",
        headerClass: "grid-header",
        width: 70,
      },
      {
        headerName: "SO #",
        field: "salesOrderId",
        headerClass: "grid-header",
        width: 70,
      }
    ]
  }

  ngAfterViewInit(): void {
    jQuery(".inspectionGridOuter .quotePartsButton").appendTo(".inspectionGridOuter .ag-paging-panel");
    this.inspectionGrid.api.setServerSideDatasource(this.createGridDataSource(this.searchParameter));
  }

  createGridDataSource(searchString: string) {
    const _self = this;
    let dataSource = {
      getRows: function (params) {

        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;

        let sortCol = '';
        let sortOrder = '';
        let DescSort = false;

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
        
        _self.inspectionService.getInspectionList(searchString, rowOffset, rowLimit, sortCol, DescSort).subscribe(
          data => {
            if(data.inspectionList.length ==0){
              let rowData = []
                rowData.push({
                  inspectionId:'',
                  itemId: '',
                  supplier: '',
                  poNumber: '',
                  customers: '',
                  status: '',
                  inventoryId:'',               
                  receivedDate: '',
                  shipDate: '',
                  warehouse: '',
                  poVersionID:''
                });
                _self.inspectionGrid.api.showNoRowsOverlay();
                params.successCallback(rowData, data.rowCount);
            }

            //_self.totalRowCount = data.totalRowCount;
            let rowData = data.inspectionList.map(inspection => {           
            let customers = inspection.customers.map(inspection => {return inspection.accountName});
            let salesOrderDisplayIds = inspection.salesOrders.map(ins =>{ return _self.PoSoUtilities.DisplayOrderId(ins.externalID, ins.salesOrderID)});
          
              return {
                poNumber:inspection.poNumber,
                inspectionId: inspection.inspectionId,
                itemId: inspection.itemId,
                supplier: inspection.supplier,
                poNumberDisplayId: _self.PoSoUtilities.DisplayOrderId(inspection.poExternalId,inspection.poNumber),
                customers: customers.join(','),
                status: inspection.statusName,
                inspectionType: inspection.inspectionTypeName,
                inventoryId:inspection.stockExternalId,               
                receivedDate: inspection.receivedDate,
                shipDate: inspection.shipDate,
                warehouse: inspection.warehouse,
                poVersionID:inspection.poVersionID,
                accountId:inspection.accountId,
                salesOrderId:salesOrderDisplayIds.join(','),
              }
            });
            params.successCallback(rowData, data.rowCount);
            _self.inspectionGrid.api.sizeColumnsToFit();
          },
          error => { }
        );
      }
    };
    return dataSource;
  }

  onRowDoubleClicked(e) {
    if (e.event.target !== undefined) {
      this.router.navigate(['/pages/quality-control/inspections-details', { inspectionId: e.data.inspectionId }]);
    }
  }
  resetGridColumns_Click() {
    this.inspectionGrid.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.inspectionGrid.api.setSortModel(this.defaultGridSettings.SortDef);
    this.inspectionGrid.api.setFilterModel(this.defaultGridSettings.FilterDef);
    this.inspectionGrid.api.sizeColumnsToFit();
  }

  refreshGrid() {
    console.log("refresh inspection-grid")

    const _self = this
    _self.inspectionGrid.api.setServerSideDatasource(this.createGridDataSource(this.searchParameter), )
  }

  oneMinuteRefresh_Click() {
    this.autoRefresh = 1;
    console.log("one minute" + this.autoRefresh);
    this.refreshGrid();
  }


  fiveMinuteRefresh_Click() {
    this.autoRefresh = 5;
    console.log("five minute" + this.autoRefresh);

  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.inspectionGrid).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut("slow", function () {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.inspectionGrid.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.inspectionGrid.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.inspectionGrid.api.getFilterModel();

    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.inspectionGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.inspectionGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.inspectionGrid.api.setFilterModel(JSON.parse(data.FilterDef));
      })
  }

  exportGrid_Click(event) {
    let url = 'api/inspection/getInspectionExportList';
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
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  creatLink(text, clickEvent) {
    var anchor = document.createElement("a");
    anchor.text = text;
    anchor.href = 'javascript:void(0)';
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }
  vendorClicked(accountId) {
    var url = `pages/accounts/account-details;accountId=${accountId}`;
    return () => window.open(url, '_blank');
  }
  poClicked(purchaseOrderId,versionId) {
    let url = `pages/purchase-orders/purchase-order-details;purchaseOrderId=${purchaseOrderId};versionId=${versionId}`;
    return () => window.open(url, '_blank');
  }
  stockClicked(inspectionId) {
    return () => this.router.navigate(['/pages/quality-control/inspections-details', { inspectionId: inspectionId }]);
  }


}
