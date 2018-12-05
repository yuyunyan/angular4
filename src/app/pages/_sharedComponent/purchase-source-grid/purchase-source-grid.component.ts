import { Component, OnInit, SimpleChange, Input,OnDestroy, Output, EventEmitter, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { GridOptions, RowNode } from "ag-grid";
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { SharedService } from './../../../_services/shared.service';
import { Subject } from 'rxjs/Subject';
import { NumericInputComponent } from './../../_sharedComponent/numeric-input/numeric-input.component';
import { CustomHeaderComponent } from './../az-custom-header/az-custom-header.component';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { OrderFulfillmentService } from '../../../_services/order-fulfillment.service';
import { RequestToPurchaseService } from './../../../_services/request-to-purchase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { default as swal } from 'sweetalert2';
import { ConditionType } from './../../../_models/shared/ConditionType';
import * as _ from 'lodash';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';

@Component({
  selector: 'az-purchase-source',
  templateUrl: './purchase-source-grid.component.html',
  styleUrls: ['./purchase-source-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PurchaseSourceComponent implements OnInit,OnDestroy,AfterViewInit {
  @Input('itemId') itemId:number;
  @Input() soPrice: number;
  @Input('partNumber') partNumber:string;
  @Input('objectId') objectId: number;
  @Input('objectTypeId') objectTypeId: number;
  @Input() renderCommentCount: boolean;
  @Input() buyerId: number;
  @Input() vendorId: number;
  @Output() onSourceUpdated = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  
  private souresGrid:  GridOptions;
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'purchase-source';
  private gridSettingsVisible: boolean;
  private _selectedRowNode: RowNode;
  private sourceObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedSourceId: number;
  private clickedObjectInfo: string;
  private sourcesJoinCommentUId: number;
  private sourcesJoinObjectTypeId: number;
  private conditionTypes: ConditionType[];
  constructor(
    private quoteService: QuoteService,
    private router:Router, 
    private sourcingService: SourcingService,
    private orderFulfillmentService: OrderFulfillmentService,
    private requestToPurchaseService: RequestToPurchaseService,
    private sharedService: SharedService,
    private gpUtilities: GPUtilities,
    private agGridSettings: AGGridSettingsService) {
    const _self = this;
    this.sourcingService.getSourceCommentStatus().subscribe(
      data => {
        if (data.increment) {
          _self.commentCountIncrement();
        }
      }
    )

    this.sourcingService.getSourceObjectTypeId().subscribe((objectTypeId) => {
      this.sourceObjectTypeId = objectTypeId;
    });
    this.sourcingService.getSourcesJoinObjectTypeId().subscribe((objectTypeId) => {
      this.sourcesJoinObjectTypeId = objectTypeId;
    });

    this.orderFulfillmentService.SourceTabStatusGet().subscribe(data => {
      _self.resetGridColumns_Click()
    });

    this.requestToPurchaseService.GetSourceList()
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(sourceMatch => {
      _self.populateGrid(sourceMatch);
    });

    this.quoteService.getConditionTypes().subscribe(data=>{
      this.conditionTypes = data;
    })
  }

  ngOnInit() {
    const _self = this;
    this.souresGrid = {
      enableColResize: true,
      pagination: true,
      paginationPageSize:20,
      suppressContextMenu:true,
      toolPanelSuppressSideButtons:true,
      rowHeight: this.rowHeight,
      suppressDragLeaveHidesColumns: true,
      headerHeight: this.headerHeight,
      getRowClass: function(params){
        let rowClass ='';
        if (params.data.buyerId != _self.buyerId){
          rowClass += 'other-buyer-source';
        }
        if (_self.vendorId && params.data.accountId == _self.vendorId){
          rowClass += rowClass.length>0? ' vendor-matched-source': 'vendor-matched-source';
        } 
        if(params.data.isSelected){
          rowClass += rowClass.length > 0? ' purchase-source-highlighted': 'purchase-source-highlighted';
        }
        return rowClass;
      }
    };
  }

  ngAfterViewInit(): void {
    jQuery(".purchaseSources .purchaePartsButton").appendTo(".purchaseSources .ag-paging-panel");
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    if((this.itemId || this.partNumber) && this.objectId && this.objectTypeId){
      this.createGrid();
      this.populateData();
      this.showColumnSettings();
      // this.loadGridState();
    }
  }

  showColumnSettings() {
    this.gridSettingsVisible = true;
	}
	
  setHeightOfGrid(count){ 
    let height = this.getHeight(count);
    document.getElementById('sourcesGrid').style.height = '505px';
	}
	
  getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  populateData(){
    const _self = this;
    this.requestToPurchaseService.getSourceList(this.itemId, this.partNumber, this.objectId, this.objectTypeId, false)
    .takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
    );
  }

  populateGrid(data){
    const _self = this;
    let rowData = _.map(data, source => _self.createSourceObject(source, _self));
    this.rowDataSet = rowData.sort((a, b) => {
      if(_self.vendorId){
        return a.accountId == _self.vendorId? a.createdBy.localeCompare(b.createdBy): 1;
      } else{
        return a.createdBy.localeCompare(b.createdBy);
      }
    });
    this.souresGrid.api.setRowData(rowData);
    this.souresGrid.api.sizeColumnsToFit();
  }
  
  plusRenderer(params,_self){
    let div = document.createElement('button');
    div.className = 'source-plus-cell';
    let plusIcon = 'fas fa-plus';
    let checkmarkIcon = 'fas fa-check';
    if(!params.node.data.showCheckmark || params.node.data.buyerId != _self.buyerId ){
      return div;
    }
    let anchor_joined = document.createElement('a');
    let iJoin = document.createElement('i');
    let source = {
      sourceId: params.data.sourceId, 
      partNumber: params.data.partNumber,
      manufacturer: params.data.manufacturer,
      itemId: params.data.itemId,
      vendorId : params.data.accountId,
      vendorName : params.data.supplier,
      soLineId : _self.objectId,
      cost: params.data.Cost,
      qty: params.data.rtpQty || 0 
    };
    let vendor = {
      vendorId: params.data.accountId,
      vendorName: params.data.supplier
    };

    if(!params.node.data.isSelected){
      iJoin.className = plusIcon;
      div.addEventListener("click",()=>{
        _self.requestToPurchaseService.SelectSource(_self.objectId, source,vendor);
      });
    } else{
      iJoin.className = checkmarkIcon;
      anchor_joined.addEventListener("click",()=>{
        _self.requestToPurchaseService.DeselectSource(_self.objectId, source, vendor);
      });
    }

    iJoin.setAttribute('style', 'color: black');
    iJoin.setAttribute('aria-hidden', 'true');
    anchor_joined.appendChild(iJoin);
    anchor_joined.href = "javascript:void(0)";
    div.appendChild(anchor_joined);
    return div;
  }

  createGrid(){
    let _self = this;
    let columnDefs =  [
      {
        headerName:"Type",
        field:"type",
        headerClass:"grid-header",
        width: 170,
        pinned: "left",
        suppressMovable: true,
        lockPinned: true
      },
      {
        headerName:"Date",
        field:"ageInDays",
        headerClass:"grid-header",
        width: 200,
        cellRenderer: function(params){return _self.ageRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        pinned: "left",
        suppressMovable: true,
        lockPinned: true
      },
      {
        headerName:"Part Number",
        field:"partNumber",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          if(!params.data.itemId){
            return params.data.partNumber;
          }else{
          var anchor = document.createElement('a');
          anchor.text = params.data.partNumber;
          anchor.href = "javascript:void(0)";
          anchor.style.color = params.data.isMatched == false? '#AFA9BD': '#007bff';
          anchor.addEventListener("click", function(){_self.itemLinkClicked(params.data.itemId)});
          return anchor;
          }
        },
        pinned: "left",
        lockPinned: true,
        width: 255
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        headerClass:"grid-header",
        width: 200,
        pinned: "left",
        lockPinned: true
      },
      {
        headerName:"Buyer",
        field:"createdBy",
        headerClass:"grid-header",
        width: 110
      },
      {
        headerName:"Commodity",
        field:"commodityName",
        headerClass:"grid-header",
        width: 200,
        minWidth: 100
      },
      {
        headerName:"Vendor",
        field:"supplier",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.supplier;
          anchor.href = "javascript:void(0)";
          anchor.style.color = params.data.isMatched == false? '#AFA9BD': '#007bff';
          anchor.addEventListener("click", function(){_self.accountLinkClicked(params.data.accountId)});
          return anchor;
        },
        width: 200,
        suppressMovable: true,
      },
      {
        headerName:"Rating",
        field:"rating",
        headerClass:"grid-header",
        width: 110,
        cellStyle: {'text-align':'right'},
        suppressMovable: true,
      },
      {
        headerName:"Quantity",
        field:"Qty",
        headerClass:"grid-header",
        cellRenderer: function(params){
          let span = document.createElement('span');
          span.className += 'pull-right'; 
          span.innerHTML = params.data.Qty > 0 ? '' + params.data.Qty.toLocaleString(): '';
          return span;
        },
        width: 100
      },
      {
        headerName:"RTP",
        field:"rtpQty",
        headerClass:"grid-header",
        cellRenderer: this.numericCellRenderer,
        width: 110,
        cellStyle: {'text-align':'right'}
      },
      {
        headerName:"Cost",
        field:"Cost",
        headerClass:"grid-header",
        cellRenderer: function(params){
          let span = document.createElement('span');
          span.className += 'pull-right'; 
          span.innerHTML = params.data.Cost > 0 ? '' + params.data.Cost.toFixed(2).toLocaleString(): '';
          return span;
        },
        width: 75
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
          if((params.data.Qty * _self.soPrice) == 0){
            return "";
          }
          let val = _self.gpUtilities.GrossProfit(params.data.Qty,params.data.Cost,_self.soPrice);
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
        headerName:"Date Code",
        field:"dateCode",
        headerClass:"grid-header",
        width: 100
      },
      {
        headerName:"Packaging",
        field:"packagingName",
        headerClass:"grid-header",
        width: 110
      },
      {
        headerName:"Package Condition",
        field: "condition",
        headerClass:"grid-header",
        minWidth: 100,    
        cellRenderer: function(params){
          return params.data.condition.name;
        }
      },
      {
        headerName:"Lead Time",
        field:"leadTimeDays",
        headerClass:"grid-header",
        width: 110,
        cellStyle: {'text-align':'right'},
        cellRenderer: function(params){return _self.leadTimeRenderer(params, _self)},
      },
      {
        headerName:"MOQ",
        field:"moq",
        headerClass:"grid-header",
        cellRenderer: function(params){
          let span = document.createElement('span');
          span.className += 'pull-right'; 
          span.innerHTML = params.data.moq > 0 ? '' + params.data.moq.toLocaleString(): '';
          return span;
        },
        width: 75
      },
      {
        headerName: "Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        hide: !_self.renderCommentCount,
        width: 40,
        minWidth: 40,
        pinned: "right",
        suppressMovable: true,
        lockPinned: true,
      },
      {
        headerName:"",
        headerClass:"grid-header",
        cellRenderer: function(params){
          return _self.plusRenderer(params, _self);
        },
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-plus' },
        cellStyle:{'text-align':'center'},
        enableColResize: false,
        width: 40,
        minWidth: 40,
        pinned: "right",
        suppressMovable: true,
        lockPinned: true,
      },
    ];
    this.souresGrid.api.setColumnDefs(columnDefs);
  }

  accountLinkClicked(accountId)
  {
    this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  itemLinkClicked(itemId)
  {
    this.router.navigate(['pages/items/items/item-details', { itemId : itemId }]);
  }

  ageRenderer(params, _self){
    let div = document.createElement('div');
    if (!params.data.created){
      return div;
    }
    let createDate = new Date(params.data.created);
    let dateFomatted = _self.sharedService.getFormattedDate(createDate);
    let ageDisplay = params.data.ageInDays > 6 ? `(${(params.data.ageInDays/7).toFixed(1)} w)`:
      `(${params.data.ageInDays} d)`;
    div.innerText = dateFomatted + ageDisplay;
    return div;
  }

  leadTimeRenderer(params, _self){
    let div = document.createElement('div');
    let leadTime = params.data.leadTimeDays;
    div.innerText = leadTime == 0 ? '0 d': _self.sharedService.calculateDateUnit(leadTime);
    return div;
  }

  createSourceObject(source , _self){
    let condition =  this.conditionTypes.find(x => x.id == source.packagingConditionId);

    let gpm = 0;
    if(_self.soPrice != 0){
      gpm = (_self.soPrice - source.cost) / _self.soPrice;
    }
    let retVal = {
      type:source.typeName,
      partNumber:source.partNumber,
      manufacturer:source.manufacturer,
      commodityName:source.commodityName,
      supplier:source.supplier,
      Qty:source.qty,
      Cost:source.cost,
      dateCode:source.dateCode,
      packagingName:source.packagingName,
      condition:{
        id: condition ? condition.id: null,
        name: condition ? condition.name: ''
      },
      leadTimeDays:source.leadTimeDays,
      moq:source.moq,
      isMatched: (source.isMatched == null)? null : source.isMatched ,
      isJoined: source.isJoined,
      showCheckmark: source.showCheckmark,
      sourceId:source.sourceId,
      comments: source.comments,
      ageInDays: source.ageInDays,
      gpm: !isNaN(gpm)? (gpm * 100).toFixed(2) +'%'  : '',
      created:source.created,
      createdBy : source.createdBy,
      buyerId: source.buyerId,
      accountId : source.accountId,
      itemId : source.itemId,
      rating: source.rating,
      rtpQty: source.rtpQty,
      isSelected: source.isSelected
    };
    return retVal;
  }

  numericCellRenderer(params){
    const isInt = Number.isInteger(params.value);
    return isInt? parseInt(params.value).toLocaleString(): '';
  }

  onRowClicked(e){
    let allRowElements2 = jQuery("#sourcesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#sourcesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
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
      _self.clickedSourceId = params.data.sourceId;
      _self.clickedObjectInfo = `${params.data.supplier} - Quantity ${params.data.Qty}`;
      _self.getSourcesJoinCommentUId();
      jQuery("#purchase-source-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `${params.data.supplier} - Quantity ${params.data.Qty}`;
      _self.hoverObjectId = params.data.sourceId;
      _self.sourcingService.getSourcesJoinCommentUId(_self.objectId, _self.objectTypeId, params.data.sourceId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
      });
      jQuery('#purchase-source-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#purchase-source-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#purchase-source-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#purchase-source-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#purchase-source-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
      _self.sourcesJoinCommentUId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedSourceId = params.data.sourceId;
      _self.clickedObjectInfo = `${params.data.supplier} - Quantity ${params.data.Qty}`;
      _self.getSourcesJoinCommentUId();
      jQuery("#purchase-source-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
    if (this.souresGrid.columnApi && this.souresGrid.columnDefs){
      this.souresGrid.columnApi.resetColumnState();
    }
    if (this.souresGrid.api){
      this.souresGrid.api.sizeColumnsToFit();
    }
  }

  refreshGrid(data) {
    console.log("hey quote-sources");
    this.populateData();
    this.populateGrid(data);
    this.createGrid();
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.souresGrid).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null && this.souresGrid.columnApi)
          this.souresGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.souresGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.souresGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  exportGrid_Click(event) {
    var _itemID = 0;
    if(typeof this.itemId!=="undefined")
      _itemID = 0;

    let url = 'api/sourcing/RTPSourceExport?soPrice='+ this.soPrice +'&itemId=' + _itemID + '&partNumber=' + this.partNumber + '&objectId=' + this.objectId
      + '&objectTypeId=' + this.objectTypeId;
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

  onSouceCommentSaved(){
    this.sourcingService.sourceCommentIncrement();
  }

  getSourcesJoinCommentUId(){
    const _self = this;
    _self.sourcesJoinCommentUId = undefined;
    if (_self.objectId && _self.clickedSourceId && _self.objectTypeId) {
      _self.sourcingService.getSourcesJoinCommentUId(_self.objectId, _self.objectTypeId, _self.clickedSourceId).subscribe(
        data => {
          _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
        }
      )
    }
  }

}
