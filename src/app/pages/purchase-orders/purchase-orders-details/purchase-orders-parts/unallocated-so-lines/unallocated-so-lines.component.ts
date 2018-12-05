import { Component, OnDestroy , Input ,Output,EventEmitter, SimpleChange, AfterViewInit } from '@angular/core';
import { GridOptions, ColumnApi, IDatasource, RowNode } from "ag-grid";
import { NumericInputComponent } from './../../../../_sharedComponent/numeric-input/numeric-input.component';
import { OrderFulfillmentService } from './../../../../../_services/order-fulfillment.service';
import { SOLineAllocation } from './../../../../../_models/orderFulfillment/soLineAllocation';
import { CustomHeaderComponent } from './../../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { NotificationsService } from 'angular2-notifications';
import { AGGridSettingsService } from './../../../../../_services/ag-grid-settings.service';
import { ObjectTypeService } from './../../../../../_services/object-type.service';
import { GridSettings } from './../../../../../_models/common/GridSettings';
import { AllocationWindowData } from '../../../../../_models/orderFulfillment/AllocationWindowData';
import { PoSoUtilities } from './../../../../../_utilities/po-so-utilities/po-so-utilities'; 
import { GPUtilities } from '../../../../../_utilities/gp-utilities/gp-utilities';

@Component({
  selector: 'az-unallocated-so-lines',
  templateUrl: './unallocated-so-lines.component.html',
  styleUrls: ['./unallocated-so-lines.component.scss'],
  providers: [AGGridSettingsService, ObjectTypeService]
})
export class UnallocatedSoLinesComponent implements OnDestroy,AfterViewInit {

  @Input() poId: number;
  @Input() poVersionId: number;
  @Input() partNumber : string;
  @Input() cost: number;
  @Input() isPOLineClicked : boolean ;
  @Input() poLineId : number;
  @Input() poLineNum: number;
  @Input() poLineAvailableQty : number; 

  @Output() onRowClicked = new EventEmitter<number>();
  private gridOptions: GridOptions;
  private rowHeight = 30;
  private headerHeight = 30;
  private rowLimit: number = 10;
  private rowOffset: number = 0;
  private totalRowCount: number = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private orderList: SOLineAllocation[];
  private rowDataSet = [];
  private selectedSOLineId: number;
  private soLineObjectTypeId: number;
  private defaultGridSettings: GridSettings;

  private PURCHASE_ORDER: string = 'Purchase Order';

  
  @Output() qtyChanged= new EventEmitter();
  private soObjectInfo: string;

  private _selectedRowNode: RowNode;
  private gridName = 'order-fulfillment-grid';
  constructor(
    private orderFulfillmentService: OrderFulfillmentService,
    private notificationsService: NotificationsService,
    private objectTypeService: ObjectTypeService, 
    private agGridSettings: AGGridSettingsService,
    private gpUtilities: GPUtilities,
    private sopoUtilities: PoSoUtilities) 
    {
      this.defaultGridSettings = new GridSettings();

    let _self = this;
    this.gridOptions = {
      animateRows:true,
      enableColResize: true,
      suppressRowClickSelection: true,
      suppressColumnVirtualisation:true,
      pagination: true,
      rowHeight: this.rowHeight,
      suppressContextMenu:true,
      paginationPageSize: 5,
      rowSelection: 'single',
      columnDefs: _self.createAgGrid(),
      onViewportChanged: function() {
        _self.gridOptions.api.sizeColumnsToFit();
      },
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true},
      getRowClass: function(params){
        let rowStyle;
        if (!Number.isNaN(params.data.allocatedQty) && params.data.allocatedQty != 0){
          rowStyle = 'allocated-po-row';
        }
        return rowStyle;
      }
    };

    this.objectTypeService.getSOLinesObjectTypeId()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe((objectTypeId) => {
      this.soLineObjectTypeId = objectTypeId;
    });

    this.orderFulfillmentService.GetAllocationSetStatus()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(poLineId => {
      if(poLineId){
        _self.populateGridDataSource();
        _self.qtyChanged.emit(poLineId);
        _self.loadGridState();
      }
    });
  }

  userNavigatedAway(_self){
    return _self.gridOptions.api ? false : true;
  }

  ngAfterViewInit(): void {
    jQuery(".orderLinesGridOuter .quotePartsButton").appendTo(".orderLinesGridOuter .ag-paging-panel");
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }){
    if(this.isPOLineClicked){
      if(this.poLineId) { 
        this.populateGridDataSource();
        this.loadGridState();
      }
    }
  }

  AllocationRenderer(params, _self){
    let div = document.createElement('div');
    div.className = 'po-allocation-cell';
    if (Number.isNaN(params.data.allocatedQty)){
      return div;
    }
    let anchor_joined = document.createElement('a');
    let spanJoin = document.createElement('span');

    if(params.data.allocatedQty == 0){
      spanJoin.innerText = 'Allocate';
      anchor_joined.appendChild(spanJoin);
      anchor_joined.className = 'po-allocated-not';
      anchor_joined.addEventListener("click",function(){
        if(Number.isNaN(params.data.allocatedQty)){
          return;
        }
        let allocationWindowData = new AllocationWindowData();
        allocationWindowData.poLineId = _self.poLineId;
        allocationWindowData.neededQty = params.data.needed;
        allocationWindowData.soLineId = params.data.soLineId;
        allocationWindowData.poLineQty = _self.poLineAvailableQty;
        allocationWindowData.partNumber = params.data.partNumber;
        allocationWindowData.poId = _self.poId;
        allocationWindowData.soId = params.data.soId;
        allocationWindowData.soLineNum = params.data.lineNum;
        allocationWindowData.poLineNum = _self.poLineNum;
        allocationWindowData.poVersionId = _self.poVersionId;
        allocationWindowData.soVersionId = params.data.soVersionId;
        _self.orderFulfillmentService.onPOAllocationClick(allocationWindowData);
      });
    } else{
      spanJoin.innerText = 'Remove';
      anchor_joined.appendChild(spanJoin);
      anchor_joined.className = 'po-allocated';
      anchor_joined.addEventListener("click",function(){
        if(Number.isNaN(params.data.allocatedQty)){
          return;
        }
        _self.RemoveAllocation(params, _self);
      });
    }
    anchor_joined.href = "javascript:void(0)";
    div.appendChild(anchor_joined);
    return div;
  }

  RemoveAllocation(params, _self){
    _self.orderFulfillmentService
      .setReservation(_self.PURCHASE_ORDER, _self.poLineId, params.data.soLineId, params.data.allocatedQty, true)
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        if(_self.userNavigatedAway(_self)){
          return;
        } 
        _self.notificationsService.success('Allocation successful.');
        _self.populateGridDataSource();
        this.qtyChanged.emit(_self.poLineId);
    });
  }

  createAgGrid() {
    const _self = this;
    return [
      {
        headerName: "Order #",
        field: "displayId",
        headerClass: "grid-header",
        width: 80,
        cellClass: 'text-center'
      },
      {
        headerName: "Ln",
        field: "lineNum",
        headerClass: "grid-header",
        width: 40,
        minWidth: 40,
        cellClass: 'text-center'
      },
      {
        headerName: "Status",
        field: "statusName",
        headerClass: "grid-header",
        width: 70
      },
      {
        headerName: "Customer",
        field: "accountName",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Manufacturer",
        field: "mfr",
        headerClass: "grid-header",
        width: 100
      },
      {
        headerName: "Order Qty",
        field: "orderQty",
        headerClass: "grid-header",
        cellRenderer: _self.numericCellRenderer,
        width: 100,
        cellClass: 'text-right'
      },
      {
        headerName: "Needed",
        field: "needed",
        headerClass: "grid-header",
        cellRenderer: _self.numericCellRenderer,
        width: 100,
        cellClass: 'text-right',
      },
      {
        headerName: "Price(USD)",
        field: "price",
        headerClass: "grid-header",
        width: 80,
        cellClass: 'text-right',
      },
      {
        headerName: "GP(%)",
        headerClass: "grid-header",
        field:"gpm",
        width: 80,
        cellClass: 'text-right',
      },
      {
        headerName:"GP (USD)",
        headerClass:"grid-header",
        valueGetter: function(params){  
          if(params.data){   
          if((params.data.orderQty * params.data.price) == 0){
            return "";
          }
          let val = _self.gpUtilities.GrossProfit(params.data.orderQty,_self.cost,params.data.price);
          return val
        }
        },
        volatile: true,
        minWidth: 20,
        width: 80,
        cellRenderer: 'animateShowChange',
        cellStyle: {'text-align':'right'},
        suppressFilter: true,
      },
      {
        headerName: "Date Code",
        field: "dateCode",
        headerClass: "grid-header",
        width: 100,
        cellClass: 'text-center'
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        width: 100,
        cellClass: 'text-center'
      },
      {
        headerName: "Salesperson",
        field: "sellers",
        headerClass: "grid-header",
        width: 100,
        cellClass: 'text-center'
      },
      {
        headerName: "Item Id",
        field: "itemId",
        hide:true
      },
      {
        headerName: "PoLine available Qty",
        field: "poLineQtyAvailableToAllocate",
        hide:true
      },
      {
        headerName:"",
        headerClass:"grid-header",
        cellRenderer: function(params){
          return _self.AllocationRenderer(params, _self);
        },
        cellClass: ['ag-icon-cell'],
        cellStyle:{'text-align':'center'},
        width: 90,
        minWidth: 90,
        pinned: "right",
        lockedPin: true
      },
      // {
      //   headerName: "Comments",
      //   field: 'comments',
      //   headerClass:"grid-header",
      //   headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
      //   headerComponentParams: { menuIcon: 'fa-comment' },
      //   cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
      //   width: 30,
      //   minWidth: 30
      // }
    ];
  //  this.gridOptions.api.setColumnDefs(columnDefs);
   // this.gridOptions.rowHeight = this.rowHeight;
   // this.gridOptions.headerHeight = this.headerHeight;
  }

  populateGridDataSource() {
    const _self = this;
    this.orderFulfillmentService.getSOLinesAllocation(this.poLineId, true)
    .takeUntil(_self.ngUnsubscribe.asObservable())
    .subscribe(data => {
      _self.orderList = data;
      _self.setGridHeight(_self);
      this.populateGrid(_self.orderList);
    }, (error) => {
      console.log(error)
    });
  }

  setGridHeight(_self){
    let height = _self.orderList.length < this.gridOptions.paginationPageSize ? _self.orderList.length: this.gridOptions.paginationPageSize;
    this.totalRowCount = height == 0 ? 7: height + 4;
    this.setHeightOfGrid(this.totalRowCount);
  }

  populateGrid(soParts: SOLineAllocation[]){
    let _self = this;
    let rowData = soParts.map(x => this.createDataRow(x, _self));
    this.rowDataSet = rowData;
    this.gridOptions.api.setRowData(rowData);
    this.gridOptions.api.sizeColumnsToFit();
  }

  createDataRow(solPart: SOLineAllocation, _self){
    let gpm = 0;
    if(solPart.price != 0){
      gpm = (solPart.price - _self.cost) / solPart.price;
    }

    var retValue = {
      soId:solPart.soId,
      displayId: _self.sopoUtilities.DisplayOrderId(solPart.externalId, solPart.soId),
      soLineId:solPart.soLineId,
      accountName:solPart.accountName,
      partNumber: solPart.partNumber,
      statusName: solPart.statusName,
      mfr:solPart.mfr,
      orderQty:solPart.qty,
      needed:solPart.neededQty,
      lineNum:solPart.lineNum,
      dateCode:solPart.dateCode,
      allocatedQty: solPart.allocatedQty,
      soVersionId: solPart.soVersionId,
      price: solPart.price,
      shipDate: _self.formatDate(solPart.shipDate),
      sellers: solPart.sellers,
      // comments: solPart.comments,
      gpm: !isNaN(gpm)? (gpm * 100).toFixed(2) +'%'  : '',
    };
    return retValue;
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

  setHeightOfGrid(count){ 
    let height = this.getHeight(count);
    document.getElementById('unallocatedLinesGrid').style.height = height+'px';
  }
  
  getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  commentsRenderer(params, _self){
    let span = document.createElement('span');
    span.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    return span;
  }

  requiredField(params){
    return params.value ? false: true; 
  }

  onCellClicked(e){
    this.selectedSOLineId = e.data.soLineId;
    this.soObjectInfo = `Order ${e.data.orderNumber} - Line ${e.data.soLineId} - ${e.data.partNumber}`;
    let allRowElements2 = jQuery("#unallocatedLinesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#unallocatedLinesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }

  onSOLineCommentSaved(){
    this.commentCountIncrement();
  }

  refreshGrid(){
    console.log("refresh unalllocated-so-lines" )

    this.populateGridDataSource();
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
    if (this.gridOptions.columnApi && this.gridOptions.columnDefs){
      this.gridOptions.columnApi.resetColumnState();
    }
    if (this.gridOptions.api){
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
  

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
