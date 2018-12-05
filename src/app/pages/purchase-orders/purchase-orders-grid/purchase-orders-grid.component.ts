import { Component, OnInit, Input,OnDestroy,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource } from 'ag-grid';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PurchaseOrdersService } from './../../../_services/purchase-orders.service';
import { Observable } from 'rxjs';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { GridSettings } from './../../../_models/common/GridSettings';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 

@Component({
  selector: 'az-purchase-orders-grid',
  templateUrl: './purchase-orders-grid.component.html',
  styleUrls: ['./purchase-orders-grid.component.scss'],
  providers: [AGGridSettingsService]
})
export class PurchaseOrdersGridComponent implements AfterViewInit {
  private searchParamter: string = '';
  private gridName = 'purchase-orders-grid';

  private agGridOptions: GridOptions;
  private rowLimit: number = 25;
  private rowOffset: number = 0;
  private totalRowCount: number = 1000;
  private sortBy: string = '';
  private generalPermission = 'generalPermission';
  private userPermission = 'userPermission';
  private defaultGridSettings: GridSettings;
  private overlayLoadingTemplate:'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>';
  constructor(
    private router: Router, 
    private purchaseOrdersService: PurchaseOrdersService, 
    private agGridSettings: AGGridSettingsService,
    private ngxPermissionsService: NgxPermissionsService,
    private sopoUtilties: PoSoUtilities) {
    this.defaultGridSettings = new GridSettings();

    let _self = this;
    this.agGridOptions = {
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      suppressContextMenu:true,
      paginationPageSize: this.rowLimit,
      pagination : true,
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      toolPanelSuppressSideButtons:true,
      overlayLoadingTemplate:_self.overlayLoadingTemplate,
      overlayNoRowsTemplate:'',
      maxConcurrentDatasourceRequests: 2,
      enableFilter:true,
      enableServerSideFilter:true,
      defaultColDef: {
        suppressMenu: true
      },
      columnDefs: _self.createAGGrid(),
      onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState(e);
        }, 0)
      }
    };
    if (localStorage.getItem(this.generalPermission)){
     this.ngxPermissionsService.flushPermissions();
      const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
      this.ngxPermissionsService.loadPermissions(permissionList);
    }

  }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    jQuery(".purchaseGridOuter .quotePartsButton").appendTo(".purchaseGridOuter .ag-paging-panel");
    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParamter));
    
    
    //this.agGridOptions.api.showLoadingOverlay();
  }

  
  searchPurchaseOrders(){
    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParamter));
    
  }

  onCellClicked(event) {
    let purchaseOrderId = event.data.purchaseOrderId;
    let versionId = event.data.versionId;
    this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: purchaseOrderId, versionId: versionId }]);
  }

  createAGGrid(){
    let _self = this;
    return [
      {
        headerName: "SAP #",
        field: "displayId",
        headerClass: "grid-header",
        width: 100,
        maxWidth: 100,
        cellRenderer:function(params){
          if(params.data.displayId == null){
            return "";
          }else{
          return _self.createLink(params.data.displayId,_self.poLinkClicked(params.data.purchaseOrderId,params.data.versionId))
          }
        }
      },
      {
        headerName: "Quotely #",
        field: "purchaseOrderId",
        headerClass: "grid-header",
        width: 100,
        maxWidth: 100,
        cellRenderer:function(params){
          return _self.createLink(params.data.purchaseOrderId,_self.poLinkClicked(params.data.purchaseOrderId,params.data.versionId))
        }
      },
      {
        headerName: "Vendor",
        field: "vendorName",
        headerClass: "grid-header",
        width: 510,
        cellRenderer: function(params){return _self.createLink(params.data.vendorName, _self.accountLinkClicked(params.data.accountId) )}
      },
      {
        headerName: "Contact",
        field: "contactFull",
        headerClass: "grid-header",
        width: 410,
        cellRenderer: function(params){return _self.createLink(params.data.contactFull, _self.contactLinkClicked(params.data.contactId, params.data.accountId))}
      },
      {
        headerName: "PO Status",
        field: "orderStatus",
        headerClass: "grid-header",
        width: 160
      },
      {
        headerName: "PO Date",
        field: "orderDate",
        headerClass: "grid-header",
        width: 185
      },
      {
        headerName: "Owner",
        field: "owner",
        headerClass: "grid-header",
        width: 415
      }
    ];
  }

  createLink (text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
}

  accountLinkClicked(accountId)
  {
   var url = `pages/accounts/account-details;accountId=${accountId}`;
   return ()=> window.open(url,'_blank');
  }

  poLinkClicked(poId,versionId){
    return ()=> this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: poId, versionId: versionId }]);

  }

  refreshGrid(){
    console.log("refresh purchase-orders-grid")

    this.agGridOptions.api.setServerSideDatasource(this.populateGridDataSource(this.searchParamter));
  }

  contactLinkClicked(contactId, accountId)
  {
   var url = `pages/accounts/contact-details;contactId=${contactId};accountId=${accountId}`;
   return ()=> window.open(url,'_blank');
  }
  populateGridDataSource(searchString: string){
    const _self = this;

    let dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;

        let sortCol = '';
        let sortOrder = '';
        let descSort = false;
        //Sort detected
        if (params.request.sortModel[0]) {
          sortCol = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort;
          switch (sortOrder) {
            case "asc":
              descSort = false;
              break;

            case "desc":
              descSort = true;
              break;
          }
        }
          _self.purchaseOrdersService.getPurchaseOrderList(searchString, rowOffset, rowLimit, sortCol, descSort)
          .subscribe(data => {
          let purchaseOrders = data.results;
          
            //Total Rows
            _self.totalRowCount = data.totalRowCount;
            
            let purchaseOrderDataService = [];
            purchaseOrders.forEach(element => {
              let orderDate = new Date(element.orderDate); 
              purchaseOrderDataService.push({
                purchaseOrderId: element.purchaseOrderId,
                displayId: element.externalId,
                versionId: element.versionId,
                vendorName: element.vendor,
                contactFull: element.contactFull,
                orderStatus: element.orderStatus,
                orderDate: _self.formatDate(orderDate),
                owner: _self.removeLastComman(element),
                accountId: element.accountId,
                contactId: element.contactId
              });
            });

            if(purchaseOrderDataService.length==0){
               purchaseOrderDataService.push({
                 displayId:'',
                 vendorName:'',
                 contactFull:''
               })
              _self.agGridOptions.api.showNoRowsOverlay();
            }
              //Callback return total row count
              params.successCallback(purchaseOrderDataService, data.totalRowCount);
          });

        }
      };
    return dataSource;
  }

  formatDate(orderDate){
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return orderDate.toLocaleDateString('en', options);
  }

  removeLastComman(element){
    return element.owner ? element.owner.trim().slice(0,-1) : '';
  }

  resetGridColumns_Click() {

    //reset sort/filter/columns using original
    this.agGridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.agGridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
    this.agGridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef); 

    //reset grid column widths
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

  loadGridState(e) {
    //Set default values before loading a new state
    this.defaultGridSettings.ColumnDef = this.agGridOptions.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.agGridOptions.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.agGridOptions.api.getFilterModel();

    //Call load grid state API
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

  exportGrid_Click(event) {
    let url = 'api/purchase-order/getPurchaseOrderExportList?searchString=' + this.searchParamter
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
