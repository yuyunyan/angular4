import { Component, OnInit, Input, OnChanges, SimpleChange, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { OrderFulfillmentService } from '../../../_services/order-fulfillment.service';
import { GridOptions, Grid, RowNode } from "ag-grid";
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomHeaderComponent } from '../../_sharedComponent/az-custom-header/az-custom-header.component';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { AllocationWindowData } from '../../../_models/orderFulfillment/AllocationWindowData';
import { InventoryWindowData } from '../../../_models/orderFulfillment/InventoryWindowData';
import { Loading } from './../../_sharedComponent/loading/loading';
import { LinkCreator } from './../../../_utilities/linkCreaator';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { PoSoUtilities } from './../../../_utilities/po-so-utilities/po-so-utilities'; 
import * as _ from 'lodash';


@Component({
  selector: 'az-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})

export class AvailabilityComponent{
  private availabilityGrid: GridOptions;
  private rowHeight= 30;
	private headerHeight= 30;
	private gridName = 'availability-grid';
	private PURCHASE_ORDER: string = 'Purchase Order';
	private INVENTORY: string = 'Inventory';
	private rowDataSet = [];
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private loading: Loading;
  private busyConfig: any;
  private availabilityGridParent = this;
  private availabilityGridPoParent = this;
  private poLineObjectTypeId: number;
  private inventoryObjectTypeId: number;
  private hoverObjectId: number;
  private hoverObjectTypeId: number;
  private hoverObjectInfo: string;

  private clickedObjectId: number;
  private clickedObjectTypeId: number;
  private clickedObjectInfo: string;
  private _selectedRowNode: RowNode;
  private _requestToPurchaseSource: boolean;
  private REQUEST_TO_PURCHASE: string = 'request-to-purchase';

	@Input() soLineId: number;
	@Input() soLineNum: number;
  @Input() soId: number;
  @Input() soPrice: number;
	@Input() soVersionId: number;
	@Input() originalOrderQty: number;
  @Input() partNumber: string;
  @Input() neededQty: number;
  @Input() itemId: number;
  @Input() soLineObjectTypeId : number;
  @Input() buyerId: number;
  @Input() vendorId: number;
	@Output() availabilityChanged = new EventEmitter();

	constructor(
    private orderFulfillmentService : OrderFulfillmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private linkCreator: LinkCreator,
    private objectTypeService : ObjectTypeService,
    private agGridSettings: AGGridSettingsService,
    private poSoUtilities: PoSoUtilities) {
		
    const _self = this;
    _self.activatedRoute.parent.url
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(currentUrls => {
        if(!currentUrls || currentUrls.length == 0){ return;}
        let path = currentUrls[0].path;
        _self._requestToPurchaseSource = path.startsWith(_self.REQUEST_TO_PURCHASE);
    });

		this.availabilityGrid= {
			enableColResize: true,
      pagination:true,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      paginationPageSize:20,
			enableSorting: true,
			getRowClass: function(params){
        let rowStyle;
        if (params.data.soLineId == _self.soLineId){
          rowStyle = 'allocated-po-row';
        }
        return rowStyle;
      }
		};

		this.orderFulfillmentService.GetAllocationSetStatus()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(poLineId => {
      if(poLineId){
        _self.populateData();
        _self.availabilityChanged.emit(poLineId);
      }
    });
    
    this.objectTypeService.getPOLinesObjectTypeId()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(objectTypeId => {
      _self.poLineObjectTypeId = objectTypeId;
    });

    this.objectTypeService.getInventoryObjectTypeId()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(objectTypeId => {
      _self.inventoryObjectTypeId = objectTypeId;
    });
		
		this.loading = new Loading(true);
    this.busyConfig = this.loading.busyConfig;
	}

	AllocationRenderer(params, _self){
		let div = document.createElement("div");
    let soId = params.data.soId;
    let soVersionId = params.data.soVersionId;
    let displayText =  params.data.displaySalesOrderId;
    if(soId && soVersionId){
      let a = document.createElement("a");
      a.href =  'javascript:void(0)';
      a.style.textDecoration = 'underline';
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(`/pages/sales-orders/sales-order-details;soId=${soId};soVersionId=${soVersionId}`, "_blank")
      })
      a.innerText = displayText;
      div.appendChild(a);
      return div;
    }
    div.innerHTML = params.data.displaySalesOrderId;
    return div;
  }

	createGrid() {
    let _self = this;
		let	columnDefs = [
			{
				headerName:"Type",
				field:"typeName",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
				headerName:"Part Number",
				field:"partNumber",
        headerClass:"grid-header",
        cellRenderer: (params) => {
          if(!params.data.itemId){
            return params.data.partNumber;
          }else{
          return _self.linkCreator.createItemLink(params.data.itemId, params.data.partNumber)
          }
        },
				width: 180,
				minWidth: 180
			},
			{
				headerName:"Manufacturer",
				field:"mfr",
				headerClass:"grid-header",
				width: 130,
				minWidth: 130
			},
			{
				headerName:"Commodity",
				field:"commodityName",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
				headerName:"Supplier",
				field:"supplier",
        headerClass:"grid-header",
        cellRenderer: function(params){
          return _self.createLink(params.data.supplier, _self.accountLinkClicked(params.data.supplierId))
        },
				width: 140,
				minWidth: 140
      },
      {
				headerName:"Warehouse",
				field:"warehouseName",
        headerClass:"grid-header",
				width: 90,
				minWidth: 90
			},
			{
				headerName:"Qty",
				field:"originalQty",
				cellRenderer:function(params){
					return params.value.toLocaleString()
				},
				headerClass:"grid-header",
				cellClass: 'text-right',
				width: 60,
				minWidth: 60
			},
			{
        headerName:"Allocated",
        field:"displaySalesOrderId",
        headerClass:"grid-header",
        editable: false,
        cellRenderer: function(params)  {
          return _self.AllocationRenderer(params, _self) },
        cellClass: "text-right",
        minWidth: 100, 
        width: 100,
      },
			{
				headerName:"Cost (USD)",
				field:"cost",
				headerClass:"grid-header",
				cellClass: 'text-right',
				width: 60,
				minWidth: 60
			},
			{
				headerName:"Date Code",
				field:"dateCode",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
				headerName:"Packaging",
				field:"packagingName",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
      },
      {
				headerName:"Package Condition",
				field:"conditionName",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
				headerName:"Ship Date",
				field:"shipDate",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
				headerName:"Buyers",
				field:"buyers",
				headerClass:"grid-header",
				width: 80,
				minWidth: 80
			},
			{
        headerName:"Allocate",
        headerClass:"grid-header",
        cellRenderer: function(params){
					if(params.data.typeName == _self.PURCHASE_ORDER){
						return _self.AllocationPORenderer(params, _self);
					} else{
						return _self.AllocationInvRenderer(params, _self)
					}
        },
        cellClass: ['ag-icon-cell'],
        cellStyle:{'text-align':'center','color':'white'},
        width: 90,
        minWidth: 90,
        lockPinned: true,
        pinned: "right"
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
		this.availabilityGrid.api.setColumnDefs(columnDefs);
		this.availabilityGrid.rowHeight = this.rowHeight;
		this.availabilityGrid.headerHeight = this.headerHeight;
	}

	AllocationInvRenderer(params, _self){
		let div = document.createElement('div');
    div.className = 'po-allocation-cell';

    if (params.data.typeName == _self.PURCHASE_ORDER){
      return div;
		}
		let button_joined = document.createElement('a');
    let spanJoin = document.createElement('span');
    if (params.data.isInspection) {
      button_joined.removeAttribute('href');
      button_joined.setAttribute('title', 'This stock is in inspection and cannot be allocated at this time');

    }

    if(!params.data.soLineId){
      spanJoin.innerText = 'Allocate';
      button_joined.appendChild(spanJoin);
      button_joined.className = 'po-allocated-not';
      button_joined.style.cursor = "pointer";
      //restrict allocation
      if (params.data.inTransit) {
        button_joined.removeAttribute('href');
        button_joined.setAttribute('title', 'This stock is in transit and cannot be allocated at this time');

      }



      //allow allocation
      else {
        button_joined.addEventListener("click", function () {
          if (Number.isNaN(params.data.allocatedQty)) {
            return;
          }
          let allocationWindowData = new InventoryWindowData();
          allocationWindowData.neededQty = _self.neededQty;
          allocationWindowData.soLineId = _self.soLineId;
          allocationWindowData.inventoryQty = params.data.originalQty;
          allocationWindowData.inventoryId = params.data.poOrInvId;
          allocationWindowData.partNumber = params.data.partNumber;
          allocationWindowData.soId = _self.soId;
          allocationWindowData.soLineNum = _self.soLineNum;
          allocationWindowData.soVersionId = _self.soVersionId;
          _self.orderFulfillmentService.onInvAllocationClick(allocationWindowData);
        });
      }
      
    } else if(params.data.soLineId == _self.soLineId){
      spanJoin.innerText = 'Remove';
      button_joined.appendChild(spanJoin);
      button_joined.className = 'po-allocated';
      button_joined.style.cursor = "pointer";

      button_joined.addEventListener("click",function(){
        if(Number.isNaN(params.data.allocatedQty)){
          return;
        }
        _self.RemoveAllocation(_self.INVENTORY, params, _self);
      });
    } else{
			spanJoin.innerText = 'Allocate';
			button_joined.appendChild(spanJoin);
      button_joined.className = 'po-allocated-disabled';
			button_joined.setAttribute('disabled', 'disabled');
		}
    div.appendChild(button_joined);
    return div;
	}

	AllocationPORenderer(params, _self){
    let div = document.createElement('div');
    div.className = 'po-allocation-cell';
    if (Number.isNaN(params.data.allocatedQty) || params.data.typeName == 'Inventory'){
      return div;
    }
    let button_joined = document.createElement('a');
    let spanJoin = document.createElement('span');

    if(!params.data.soLineId){
      spanJoin.innerText = 'Allocate';
      button_joined.appendChild(spanJoin);
      button_joined.className = 'po-allocated-not';
      button_joined.style.cursor = "pointer";

      button_joined.addEventListener("click",function(){
        if(Number.isNaN(params.data.allocatedQty)){
          return;
        }
        let allocationWindowData = new AllocationWindowData();
        allocationWindowData.poLineId = params.data.poOrInvId;
        allocationWindowData.neededQty = _self.neededQty;
        allocationWindowData.soLineId = _self.soLineId;
        allocationWindowData.poLineQty = params.data.originalQty;
        allocationWindowData.partNumber = params.data.partNumber;
        allocationWindowData.poId = params.data.poId;
        allocationWindowData.soId = _self.soId;
        allocationWindowData.soLineNum = _self.soLineNum;
        allocationWindowData.poLineNum = params.data.lineNum;
        allocationWindowData.poVersionId = params.data.poVersionId;
        allocationWindowData.soVersionId = _self.soVersionId;
        _self.orderFulfillmentService.onPOAllocationClick(allocationWindowData);
      });
    } else if(params.data.soLineId == _self.soLineId){
      spanJoin.innerText = 'Remove';
      button_joined.appendChild(spanJoin);
      button_joined.style.cursor = "pointer";
      button_joined.className = 'po-allocated';
      button_joined.addEventListener("click",function(){
        if(Number.isNaN(params.data.allocatedQty)){
          return;
        }
        _self.RemoveAllocation(_self.PURCHASE_ORDER, params, _self);
      });
    } else{
			spanJoin.innerText = 'Allocate';
      button_joined.appendChild(spanJoin);
			button_joined.className = 'po-allocated-disabled';
			button_joined.setAttribute('disabled', 'disabled');
		}
    div.appendChild(button_joined);
    return div;
  }

  createLink(text, clickEvent) {
    var anchor = document.createElement('a');
    anchor.text = text;
    anchor.href = "javascript:void(0)";
    anchor.addEventListener("click", clickEvent);
    return anchor;
  }
  
  accountLinkClicked(accountId) {
    return () => this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }
	
	RemoveAllocation(objectType, params, _self){
    _self.busyConfig.busy = _self.orderFulfillmentService
      .setReservation(objectType, params.data.poOrInvId, _self.soLineId, params.data.originalQty, true)
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        if(_self.userNavigatedAway(_self)){
          return;
        }
        _self.populateData();
        _self.availabilityChanged.emit(_self.soLineId);
    });
  }

	populateData(){
		const _self = this;
		this.orderFulfillmentService.getAvailability(this.soLineId)
			.takeUntil(_self.ngUnsubscribe.asObservable())
			.subscribe(data => {
				_self.createGrid();
				_self.populateGrid(data);
				_self.loadGridState();
		});
  }

	populateGrid(availLines){
		const _self = this;
		_self.rowDataSet = _.map(availLines, availLine => _self.createRow(availLine));
		_self.availabilityGrid.api.setRowData(_self.rowDataSet);
		_self.availabilityGrid.api.sizeColumnsToFit();
	}

	ngOnChanges(changes: { [propKey: string]: SimpleChange }){
		if(this.soLineId){
      this.populateData();
    }
	}

	formatDate(orderDate){
    if(!orderDate){
      return '';
    }
		let formatDate = new Date(orderDate); 
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return formatDate.toLocaleDateString('en', options);
  }

	createRow(availLine){
    const _self = this;
		let row = {
			typeName: availLine.type,
			poOrInvId: availLine.id,
			partNumber: availLine.partNumber,
			mfr: availLine.manufacturer,
			commodityName: availLine.commodityName,
			supplier:availLine.supplier,
      originalQty: availLine.originalQty,
			cost: availLine.cost? availLine.cost.toFixed(2): '0.00',
			dateCode: availLine.dateCode,
			packagingName: availLine.packagingName,
			shipDate: availLine.shipDate? _self.formatDate(availLine.shipDate): null,
			buyers: availLine.buyers,
      soId: availLine.soId,
			soLineId: availLine.soLineId,
			poId: availLine.poId,
			poVersionId: availLine.poVersionId,
      lineNum: availLine.lineNum,
      itemId: availLine.itemId,
      supplierId: availLine.supplierId,
      conditionName: availLine.conditionName,
      warehouseName: availLine.warehouseName,
      comments: availLine.comments,
      inTransit: availLine.inTransit,
      isInspection: availLine.isInspection,
      displaySalesOrderId: availLine.allocated && availLine.allocated.length > 0 ? _self.poSoUtilities.DisplayOrderId(availLine.allocated[0].externalID, availLine.allocated[0].salesOrderID) : 'Available'
    };
		return row;
  }
  
	ngAfterViewInit(): void {
    jQuery(".salesSourcesGrid .salesPartsButton").appendTo(".salesSourcesGrid .ag-paging-panel");
	}

	userNavigatedAway(_self){
    return _self.availabilityGrid.api ? false : true;
  }

	loadGridState() {
		this.agGridSettings.loadGridState(this.gridName)
		.takeUntil(this.ngUnsubscribe.asObservable())
		.subscribe(
      data => {
        if (data.ColumnDef != null && this.availabilityGrid.columnApi)
          this.availabilityGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.availabilityGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.availabilityGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
	}
	
	resetGridColumns_Click() {
    if (this.rowDataSet.length > 0) {
      this.availabilityGrid.columnApi.resetColumnState();
      this.availabilityGrid.api.sizeColumnsToFit();
    }
  }

  saveGridState_Click(event) {
		this.agGridSettings.saveGridState(this.gridName, this.availabilityGrid)
		.takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

	onTabClicked(gridName){
    if (gridName == 'availGridElement'){
      this.availabilityGrid.api.sizeColumnsToFit();
    } else{
      this.orderFulfillmentService.onSourceTabClick();
    }
  }

  refreshGrid(data){
		const _self=this;
		console.log("refresh availability.component");
		this.populateData();
		this.populateGrid(data);

		this.orderFulfillmentService.GetAllocationSetStatus()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(poLineId => {
      if(poLineId){
        _self.populateData();
        _self.availabilityChanged.emit(poLineId);
      }
    });
  }

  exportGrid_Click(event) {
    var _itemID = 0;
    if(typeof this.itemId!=="undefined")
      _itemID = 0;

    let url = 'api/orderFulfillment/getPoAndInventoryAvailabilityExport?soLineId='+ this.soLineId;
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled','')
    jQuery(senderEl).find('span').text('Exporting...');

    this.agGridSettings.GetGridExport(url).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
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
    });
	}
	
	ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
      _self._selectedRowNode = params.node;
      _self.clickedObjectId = params.data.poOrInvId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.partNumber}`;
      _self.clickedObjectTypeId = _self.GetRowObjectTypeId(params, _self);
      jQuery("#availability-comment-modal").modal('toggle');
    });
    
    if (params.data.comments < 1){
      return anchor;
    }

    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNum} - ${params.data.partNumber}`;
      _self.hoverObjectId = params.data.poOrInvId
      _self.hoverObjectTypeId = _self.GetRowObjectTypeId(params, _self);
      jQuery('#availability-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#availability-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#availability-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#availability-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#availability-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self._selectedRowNode = params.node;
      _self.clickedObjectId = params.data.poOrInvId;
      _self.clickedObjectInfo = `Line ${params.data.lineNum} - ${params.data.partNumber}`;
      _self.clickedObjectTypeId = _self.GetRowObjectTypeId(params, _self);
      jQuery("#availability-comment-modal").modal('toggle');
    });
    return div;
  }

  private GetRowObjectTypeId(params, _self):number{
    let objectTypeId = 0;
    if(params.data.typeName == _self.INVENTORY){
      objectTypeId = _self.inventoryObjectTypeId;
    } else if(params.data.typeName == _self.PURCHASE_ORDER){
      objectTypeId = _self.poLineObjectTypeId;
    }
    return objectTypeId;
  }

  onCommentSaved(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }
  
}
