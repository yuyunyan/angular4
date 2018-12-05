import { Component, OnInit, ViewEncapsulation,OnDestroy,AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, RowNode } from "ag-grid";
import { OrderFulfillmentService } from './../../../_services/order-fulfillment.service';
import { Order } from './../../../_models/orderFulfillment/ordersList';
import { SalesOrdersService } from './../../../_services/sales-orders.service';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { GridSettings } from './../../../_models/common/GridSettings';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 

@Component({
  selector: 'az-order-fulfillment-grid',
  templateUrl: './order-fulfillment-grid.component.html',
  styleUrls: ['./order-fulfillment-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService , ObjectTypeService]
})
export class OrderFulfillmentGridComponent implements OnInit,OnDestroy,AfterViewInit {

  private searchParameter: string = '';
  private fulfilled: number = 0;
  private soLineId: number;
  private neededQty: number;
  private orderNo: number;
  private originalOrderQty: number;
  private partNumber: string;
  private itemId: number;
  private gridOptions: GridOptions;
  private rowHeight = 30;
  private headerHeight = 30;
  private rowLimit: number = 25;
  private rowOffset: number = 0;
  private totalRowCount: number = 1000;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private underallocatedOnly: boolean = false;

  private selectedSOLineId: number;
  private soLineObjectTypeId: number;

  private soObjectInfo: string;

  private _selectedRowNode: RowNode;
  private gridName = 'order-fulfillment-grid';

  private clickedSOLineId: number;
  private clickedObjectInfo: string;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private defaultGridSettings: GridSettings;
  private filterText: string = undefined;
  private filterColumn: string = undefined;
  private soLineNum: number;
  private soVersionId: number;

  constructor(private orderFulfillmentService: OrderFulfillmentService, 
    private salesOrdersService: SalesOrdersService,
    private router: Router,
    private objectTypeService : ObjectTypeService,
    private linkCreator: LinkCreator,
    private agGridSettings: AGGridSettingsService,
    private PoSoUtilities: PoSoUtilities) {
     this.defaultGridSettings = new GridSettings();

    let _self = this;
    this.gridOptions = {
      pagination:true,
      enableServerSideFilter: true,
      enableServerSideSorting: true,
      enableColResize: true,
      rowSelection: 'single',
      rowDeselection: true,
      rowModelType: 'serverSide',
      suppressContextMenu:true,
      paginationPageSize: this.rowLimit,
      cacheBlockSize: this.rowLimit,
      maxBlocksInCache:1,
      maxConcurrentDatasourceRequests: 2,
      suppressRowClickSelection: true,
      rowHeight: this.rowHeight,
      headerHeight: this.headerHeight,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true,
      },
       onFilterChanged: _self.onFilterChanged.bind(_self),
      columnDefs: _self.createAgGrid(),
      onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState();
        }, 0)
      }
    }

    this.objectTypeService.getSOLinesObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.soLineObjectTypeId = objectTypeId;
    });
  }

  ngOnInit() {
  
  }

  ngAfterViewInit(): void {
    jQuery(".orderFullGridOuter .quotePartsButton").appendTo(".orderFullGridOuter .ag-paging-panel");
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter,this.underallocatedOnly,null));
  }

  searchOrderFulfillment() {
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly, null));
  }

  onFilterChanged(value){
    const _self = this;
    const filterModel = _self.gridOptions.api.getFilterModel();
    _self.filterColumn = undefined;
    _self.filterText = undefined;
    for(let col in filterModel){
      if(filterModel[col].value != ''){
        _self.filterColumn = col;
        _self.filterText = filterModel[col].value ;
        break;
      }
    }
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly, null));
  }

  changeFulfillmentOption(e){
    this.fulfilled = e.target.value;
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly , null));
  }

  OnChangeFulfillment($event){
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly, null));
  }

  createAgGrid() {
    const _self = this;
    return [
      {
        headerName: "Order Number",
        field: "displayId",
        headerClass: "grid-header",
        width: 100,
        cellRenderer: function(params){
          return _self.createLink(params.data.displayId,_self.soLinkClicked(params.data.orderNumber, params.data.soVersionId))
        },
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Ln",
        field: "lineNum",
        headerClass: "grid-header",
        width: 40,
        minWidth: 40,
        suppressFilter: true
      },
      {
        headerName: "Customer",
        field: "customer",
        headerClass: "grid-header",
        width: 200,
        cellRenderer: function(params){
          return _self.createLink(params.data.customer, _self.accountLinkClicked(params.data.accountId))
        },
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 142,
        cellRenderer: (params) => {return _self.linkCreator.createItemLink(params.data.itemId, params.data.partNumber);},
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Manufacturer",
        field: "MfrName",
        headerClass: "grid-header",
        width: 100,
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Commodity",
        field: "commodity",
        headerClass: "grid-header",
        width: 150,
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Order Qty",
        field: "orderQty",
        headerClass: "grid-header",
        cellRenderer: this.numericCellRenderer,
        width: 100,
        cellClass: 'text-right',
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Fulfilled Qty",
        field: "allocatedQty",
        headerClass: "grid-header",
        cellRenderer: this.numericCellRenderer,
        width: 100,
        cellClass: 'text-right',
        cellClassRules: {
          'ag-cell-highlighted': function(params){
            return params.data.allocatedQty != params.data.orderQty;
          }
        },
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Price(USD)",
        field: "price",
        headerClass: "grid-header",
        width: 80,
        cellClass: 'text-right',
        suppressFilter: true
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        width: 100,
        suppressFilter: true
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 100,
        suppressFilter: true
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width: 100,
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Sales Person",
        field: "salesPerson",
        headerClass: "grid-header",
        width: 100,
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Buyer",
        field: "buyers",
        headerClass: "grid-header",
        width: 140,
        suppressFilter: true
      },
      {
        headerName: "Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align': 'center'},
        width: 30,
        minWidth: 30,
        lockPinned: true,
        pinned: "right"
      }
    ];
  }

  getOrderFulfillmentData(searchString, underallocatedOnly: boolean , selectRowCallBack) {
    const _self = this;
    let dataSource = {
      getRows: function (params) {
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;
        let sortCol = '';
        let sortOrder = '';
        let descSort = false;

        if (params.request.sortModel[0]) {
          sortCol = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort;
          switch (sortOrder) {
            case 'asc':
              descSort = false;
              break;
            case 'desc':
              descSort = true;
              break;
          }
        }
        _self.orderFulfillmentService.getOrdersList(searchString, _self.underallocatedOnly, rowOffset, rowLimit, sortCol, descSort, _self.filterText, _self.filterColumn)
        .subscribe(data => {
          let orderList = data.orderList;
          //Total Rows
          _self.totalRowCount = data.totalRowCount;
          let OrderDataService = [];
          orderList.forEach(element => {
            let shipDate = new Date(element.shipDate); 
            OrderDataService.push({
              orderNumber: element.orderNo,
              displayId: _self.PoSoUtilities.DisplayOrderId(element.externalId, element.orderNo),
              externalId: element.externalId,
              lineNum: element.lineNum,
              customer: element.customers,
              accountId: element.accountId,
              soVersionId: element.soVersionId,
              partNumber: element.partNumber,
              buyers: element.buyers,
              MfrName: element.mfr,
              commodity: element.commodity,
              orderQty: element.orderQty,
              allocatedQty: element.allocatedQty,
              price: element.price ? element.price.toFixed(2) : '0.00',
              packaging: element.packaging,
              dateCode: element.dateCode,
              shipDate: _self.formatDate(element.shipDate),
              salesPerson: element.shipPerson,
              soLineId: element.soLineId,
              itemId:element.itemId,
              comments: element.comments
            })
          });
          if(OrderDataService.length==0){
            OrderDataService.push({
              allocatedQty:''
            })
            _self.gridOptions.api.showNoRowsOverlay();
          }
          //Callback return total row count
          params.successCallback(OrderDataService, data.totalRowCount);
            // if(selectRowCallBack) {
            //   selectRowCallBack();
            // }
        });
      }
    };
    return dataSource;
  }

  availabilityChanged(soLineId : number) {
    let _self = this;
    let currentPage = this.gridOptions.api.paginationGetCurrentPage();
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly , () => { _self.selectRow(_self.gridOptions, soLineId)} ));
    this.gridOptions.api.paginationGoToPage(currentPage);
  }

  onRowDoubleClicked($event) {
   this.onRowSelection($event);
  }

  formatDate(orderDate){
    if(!orderDate){
      return '';
    }
    let formatDate = new Date(orderDate); 
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return formatDate.toLocaleDateString('en', options);
  }

  numericCellRenderer(params){
    return parseInt(params.value).toLocaleString();
  }

  accountLinkClicked(accountId) {
    return () => this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  soLinkClicked(salesOrderId, versionId) {
    return () => this.router.navigate(['pages/sales-orders/sales-order-details', { soId: salesOrderId, soVersionId: versionId }]);
  }

  createLink (text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }

  commentsRenderer(params, _self){
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.className = 'fas fa-comments';
    i.title = "Add Comments";
    i.setAttribute('aria-hidden', 'true');
    i.style.color = 'black';
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";
    anchor.addEventListener('click', function(){
      _self.clickedSOLineId = params.data.soLineId;
      _self.clickedObjectInfo = `Order# ${params.data.orderNumber} - Line ${params.data.lineNum} - ${params.data.partNumber}`;

      jQuery("#so-part-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Order# ${params.data.orderNumber} - Line ${params.data.lineNum} - ${params.data.partNumber}`;
      _self.hoverObjectId = params.data.soLineId;
      jQuery('#so-part-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#so-part-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#so-part-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#so-part-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#so-part-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedSOLineId = params.data.soLineId;
      _self.clickedObjectInfo = `Order# ${params.data.orderNumber} - Line ${params.data.lineNum} - ${params.data.partNumber}`;
      jQuery("#so-part-comment-modal").modal('toggle');
    });
    return div;
  }

  onCellClicked(e){
    let allRowElements2 = jQuery("#orderFulfillmentGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#orderFulfillmentGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }
  
  onRowSelection($event : any){
    this.soLineId = $event.data.soLineId;
    this.neededQty = $event.data.orderQty - $event.data.allocatedQty >= 0 ?
      $event.data.orderQty - $event.data.allocatedQty : 0; // needed quantity
    this.itemId = $event.data.itemId;
    this.partNumber = $event.data.partNumber;
    this.orderNo = $event.data.orderNumber;
    this.originalOrderQty = $event.data.orderQty; //original order quantity
    this.soLineNum = $event.data.lineNum;
    this.soVersionId = $event.data.soVersionId;
    //Change position of sort element to be in middle (since new grid will bump it down)
    jQuery('#orderFulfillmentGrid').addClass('availablility-grid-on');
    jQuery('.ag-grid-sort').css('top','44.3%');
  }

  selectRow(gridOptions: GridOptions , soLineId : number) {
    gridOptions.api.forEachNode(node => {
     if(parseInt(String(node.data.soLineId)) == soLineId ){
      let allRowElements2 = jQuery("#orderFulfillmentGrid").find(`.ag-row`);
      let rowElement2 = jQuery("#orderFulfillmentGrid").find(`[row=${node.rowIndex}]`);
      allRowElements2.removeClass('highlight-row');
      rowElement2.addClass('highlight-row')
      this._selectedRowNode = node;
      this.onRowSelection(node);
    }
		});
  }
  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
   this.gridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
   this.gridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
   this.gridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef);

    this.gridOptions.api.sizeColumnsToFit();
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.gridOptions).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.gridOptions.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.gridOptions.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.gridOptions.api.getFilterModel();

    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.gridOptions.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.gridOptions.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.gridOptions.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  refreshGrid(){
    this.gridOptions.api.setServerSideDatasource(this.getOrderFulfillmentData(this.searchParameter, this.underallocatedOnly, null));
  }

   exportGrid_Click(event) {
    let url='api/orderFulfillment/getOrderFulfillmentExportList?searchString='+ this.searchParameter
      + '&underallocatedOnly=' + this.underallocatedOnly;
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
          var alertEl = jQuery('.orderFullGridOuter').find('.grid-Download');
          jQuery(alertEl).fadeIn("slow");
          jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
            // Animation complete.
          });
         }
       })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSOPartCommentSaved(){
    this.commentCountIncrement();
  }



}
