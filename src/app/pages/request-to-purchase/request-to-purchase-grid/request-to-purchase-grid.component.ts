import { Component, ViewEncapsulation, OnDestroy,AfterViewInit, OnInit } from '@angular/core';
import { GridOptions, RowNode } from "ag-grid";
import { OrderFulfillmentService } from './../../../_services/order-fulfillment.service';
import { SalesOrdersService } from './../../../_services/sales-orders.service';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { default as swal } from 'sweetalert2';
import { UserDetail } from './../../../_models/userdetail';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { GridSettings } from './../../../_models/common/GridSettings';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../environments/environment';
import { UsersService } from './../../../_services/users.service';
import { RequestToPurchaseLine } from './../../../_models/request-to-purchase/request-to-purchase-line';
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import * as _ from 'lodash';

@Component({
  selector: 'az-request-to-purchase-grid',
  templateUrl: './request-to-purchase-grid.component.html',
  styleUrls: ['./request-to-purchase-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService , ObjectTypeService]
})
export class RequestToPurchaseGridComponent implements OnDestroy,AfterViewInit,OnInit {

  private rowDataSet = []
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
  private dataRemote: RemoteData;
  private totalRowCount: number = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private underallocatedOnly: boolean = false;
  private soPrice: number;
  private selectedSOLineId: number;
  private soLineObjectTypeId: number;
  private soObjectInfo: string;
  private _selectedRowNode: RowNode;
  private gridName = 'request-to-purchase-grid';
  private clickedSOLineId: number;
  private clickedObjectInfo: string;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private defaultGridSettings: GridSettings;
  private soLineNum: number;
  private soVersionId: number;
  private buyerList: UserDetail[];
  private defaultResultOption: number = 999;
  private buyerId: number = 0;
  private vendorId: number = 0;
  private selectedAccountName: string;

  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 2000,
    lastOnBottom: true
  };

  constructor(private orderFulfillmentService: OrderFulfillmentService, 
    private salesOrdersService: SalesOrdersService,
    private usersService: UsersService,
    private router: Router,
    private objectTypeService : ObjectTypeService,
    private linkCreator: LinkCreator,
    private completerService: CompleterService,
    private requestToPurchaseService: RequestToPurchaseService,
    private agGridSettings: AGGridSettingsService,
    private sopoUtilties: PoSoUtilities) {
     this.defaultGridSettings = new GridSettings();
    let _self = this;
    _self.buyerList = new Array<UserDetail>();
    this.gridOptions = {
      pagination:true,
      enableColResize: true,
      suppressContextMenu:true,
      paginationPageSize: 10,
      suppressRowClickSelection: true,
      rowHeight: this.rowHeight,
      headerHeight: this.headerHeight,
      enableSorting: true,
      enableFilter: true,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true},
      columnDefs: _self.createAgGrid(),
      onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState();
        }, 0)
      },
    };

    this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&accountType=1'
		});
    this.dataRemote.dataField("accounts");

    this.usersService.getBuyers(true).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe((buyerList: UserDetail[]) => {
      this.buyerList = buyerList;
      var cachedBuyerString = localStorage.getItem("BuyerId"); 
      let cachedBuyer = JSON.parse(cachedBuyerString);
      if(cachedBuyer){
        let buyer = _self.buyerList.find(buyer => buyer.UserID == cachedBuyer);
        this.buyerId = cachedBuyer;
        this.requestToPurchaseService.UpdatedBuyer(buyer.UserID, buyer.FirstName + " " + buyer.LastName);
      }else{
      let currentUserString = localStorage.getItem('currentUser');
      let currentUser = JSON.parse(currentUserString);
      if(currentUser && currentUser.userId){
        let buyer = _self.buyerList.find(buyer => buyer.UserID == currentUser.userId);
        _self.buyerId = buyer? buyer.UserID: 0;
        if(buyer){
          this.requestToPurchaseService.UpdatedBuyer(buyer.UserID, buyer.FirstName + " " + buyer.LastName);
          localStorage.setItem('BuyerId',currentUser.userId); 
        }
      }
    }
      this.populateData();
    });

    this.objectTypeService.getSOLinesObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.soLineObjectTypeId = objectTypeId;
    });

    this.requestToPurchaseService.GetRTPList()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(rtpList => {
        _self.populateGrid(rtpList);
    });
  }
  

  ngAfterViewInit(): void {
    jQuery(".orderFullGridOuter .quotePartsButton").appendTo(".orderFullGridOuter .ag-paging-panel");
  }

  ngOnInit(){
  }

  changeFulfillmentOption($event){
    this.underallocatedOnly = $event.target.checked;
    this.getPurchaseOrderListFromDb();
  }

  OnChangeFulfillment($event){
    const _self = this;
    const hasSourceSelected = _self.SourceSelectionCount() > 0;
    const processBuyerChange = () => {
      const selectedBuyer = _.find(_self.buyerList, (buyer: UserDetail) => buyer.UserID == $event.target.value);
      _self.requestToPurchaseService.UpdatedBuyer(selectedBuyer.UserID, selectedBuyer.FirstName + " " + selectedBuyer.LastName);
      _self.soLineId = null;
      _self.buyerId = selectedBuyer.UserID;
      _self.populateData(true);
      localStorage.setItem('BuyerId',selectedBuyer.UserID); 
    };
    if(!hasSourceSelected){
      processBuyerChange();
      return;
    }
    $event.preventDefault();
    swal({
      title: "Warning",
      text: "Selected sources will be cleared when switching buyer",
      type: "warning",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((result) => {
      processBuyerChange();
      _self.requestToPurchaseService.ClearVendorFilter();
    }, (dismiss) =>{
      _self.buyerId = _self.requestToPurchaseService.buyerId;
    });
    
  }

  populateGrid(rtpList: RequestToPurchaseLine[]){
    let _self = this;
    let rowData = rtpList.map(x => this.createDataRow(x, _self));
    this.rowDataSet = rowData;
    this.gridOptions.api.setRowData(rowData);
    this.gridOptions.api.sizeColumnsToFit();
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
          return _self.createLink(params.data.displayId, _self.soLinkClicked(params.data.orderNumber, params.data.soVersionId))
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
        cellRenderer: (params) => {
          if(!params.data.itemId){
            return params.data.partNumber;
          }else{
          return _self.linkCreator.createItemLink(params.data.itemId, params.data.partNumber);
        }
      },
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Manufacturer",
        field: "mfr",
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
        comparator: _self.floatColComparator,
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
        filterFramework: ColumnFilterComponent
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width: 100,
        comparator: _self.dateColComparator,
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
        headerName: "Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align': 'center'},
        width: 30,
        minWidth: 30,
        suppressFilter: true,
        lockPinned: true,
        pinned: "right"
      }
    ];

  }

  createDataRow(element: RequestToPurchaseLine, _self){
    var retValue = {
      orderNumber: element.orderNo,
      displayId: _self.sopoUtilties.DisplayOrderId(element.externalId, element.orderNo),
      lineNum: element.lineNum,
      customer: element.customers,
      accountId: element.accountId,
      soVersionId: element.soVersionId,
      partNumber: element.partNumber,
      mfr: element.mfr,
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
      comments: element.comments,
      isHighLighted: element.isHighLighted,
      externalId: element.externalId
    };
    return retValue;
  }

  populateData(useHistory:boolean = false){
    if(this.requestToPurchaseService.rtpHistoryExists() && useHistory){
      this.requestToPurchaseService.rtploaded();
    }else{
      this.getPurchaseOrderListFromDb();
    }
  }

  getPurchaseOrderListFromDb(){
    this.requestToPurchaseService.getRequestToPurchaseList(this.underallocatedOnly)
     .takeUntil(this.ngUnsubscribe.asObservable())
     .subscribe(data => {
     });
  }

  onVendorKeydown(event){
    if(event.keyCode === 13 && !this.selectedAccountName){
      this.requestToPurchaseService.ClearVendorFilter();
      this.soLineId = null;
      return;
    }
    if(event.key.length === 1 || event.keyCode === 8 || event.keyCode === 46){
      this.vendorId = 0;
    }
    
  }

  availabilityChanged(soLineId : number) {
    let _self = this;
    this.populateData();
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
    this.soPrice = $event.data.price;
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
    if(this.gridOptions && this.gridOptions.columnApi){
      this.gridOptions.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    }
    if(this.gridOptions && this.gridOptions.api){
      this.gridOptions.api.setSortModel(this.defaultGridSettings.SortDef);
      this.gridOptions.api.setFilterModel(this.defaultGridSettings.FilterDef); 
      this.gridOptions.api.sizeColumnsToFit();
    }
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
    this.populateData();
  }

  ngOnDestroy() {
    this.requestToPurchaseService.ClearCache();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    
  }

  onSOPartCommentSaved(){
    this.commentCountIncrement();
  }

  SourceSelectionCount(){
    const sourceSelection = this.requestToPurchaseService.CreateSelectedList();
    if(sourceSelection){
      return sourceSelection.length;
    }
    return 0;
  }

  createPO(){
    let vendorId = this.requestToPurchaseService.vendorId;
    if(!this.requestToPurchaseService.HasSourceSelected){
      return;
    }
    this.requestToPurchaseService.CreatePOBtnClicked();
  }

  dateColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    let a = new Date(valueA);
    if (!a) {
      return -1;
    }
    let b = new Date(valueB);
    return a > b ? 1: -1
  }

  floatColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  showCart(){
    jQuery('#mdlAddToCart').modal('show');
  }

}
