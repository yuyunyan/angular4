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
import { Router, ActivatedRoute } from '@angular/router';
import { default as swal } from 'sweetalert2';
import { ConditionType } from './../../../_models/shared/ConditionType';
import * as _ from 'lodash';

@Component({
  selector: 'az-quote-sources',
  templateUrl: './quote-sources.component.html',
  styleUrls: ['./quote-sources.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [QuoteService]
})
export class QuoteSourcesComponent implements OnInit,OnDestroy,AfterViewInit {

  @Input('itemId') itemId:number;
  @Input('partNumber') partNumber:string;
  @Input('quotesPartSources') quotesPartSources;
  @Input('objectId') objectId: number;
  @Input('quantity') quantity: number;
  @Input('objectTypeId') objectTypeId: number;
  @Input('quoteLineId') quoteLineId: number;
  @Input() renderCommentCount: boolean;
  @Input('showAll') showAll : boolean;
  @Input() showInventory : boolean;
  @Input('orderFulfillmentQuoteSource') quoteSource:boolean;
  @Output() onSourceUpdated = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  
  private souresGrid:  GridOptions;
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet;
  private conditionTypes: ConditionType[];
  private hideSources = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'part-sources';
  private gridSettingsVisible: boolean;
  private _selectedRowNode: RowNode;
  private commentTotalNumber: number;
  private sourceObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedSourceId: number;
  private clickedObjectInfo: string;
  private sourcesJoinCommentUId: number;
  private sourcesJoinObjectTypeId: number;
  private invalidSearchString: boolean;
  private searchParameter: string;
  
  constructor(
    private quoteService: QuoteService,
    private router:Router, 
    private sourcingService: SourcingService,
    private orderFulfillmentService: OrderFulfillmentService,
    private sharedService: SharedService,
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
    })
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
      rowHeight: this.rowHeight,
      toolPanelSuppressSideButtons:true,
      suppressContextMenu:true,
      suppressDragLeaveHidesColumns: true,
      headerHeight: this.headerHeight,
      onCellEditingStopped: function(event){_self.saveRTP(event,_self)},
      getRowClass: function(params){
        let rowStyle;
        if (params.data.isMatched == false){
          rowStyle = 'cross-row-quote-source';
        } else if (params.data.isMatched == true){
          rowStyle = 'checkmark-row-quote-source'
        }
        return rowStyle;
      }
    };
  }

  ngAfterViewInit(): void {
    if(this.quotesPartSources == 'quoted'){
      jQuery(".quoted .quotePartsButton").appendTo(".quoted .ag-paging-panel");
    } else if(this.quotesPartSources == 'all'){
      jQuery(".all .quotePartsButton").appendTo(".all .ag-paging-panel");
    }
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    let itemIdProp = changes['itemId'];
    let partNumberProp = changes['partNumber'];
    let objectId = changes['objectId'];
    let objectTypeIdProp = changes['objectTypeId'];
    let quoteLineIdProp = changes['quoteLineId'];
    
    if (changes['quoteLineId'])
      this.quoteLineId = quoteLineIdProp.currentValue;
    if (changes['itemId'])
      this.itemId = itemIdProp.currentValue;
    if (changes['partNumber']) {
      if (typeof changes['partNumber'].currentValue === "undefined"){
        this.partNumber = partNumberProp.previousValue;
      }else{
        this.partNumber = partNumberProp.currentValue;
        this.searchParameter = this.partNumber;
      }
    }
    if(changes['objectId'])
      this.objectId = objectId.currentValue;
    if(changes['objectTypeId'])
      this.objectTypeId = objectTypeIdProp.currentValue;

    if((this.itemId || this.partNumber) && this.objectId && this.objectTypeId){
      this.hideSources = false;
      this.createGrid();
      this.populateData();
      this.showColumnSettings();
      this.loadGridState();
    }else{
      this.hideSources = true;
    }

  }

  showColumnSettings() {
    this.gridSettingsVisible = true;
  }

  setHeightOfGrid(count){ 
    let height = this.getHeight(count);
    document.getElementById('sourcesGrid').style.height = '505px'
    //document.getElementById('sourcesGrid').style.height = height+'px';
  }

  getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  searchItem(){
    this.itemId = 0;
    let stripPartNumber = _.replace(this.partNumber, /[^0-9a-zA-Z]/g, '');
    this.invalidSearchString = (stripPartNumber == '');
    if (this.invalidSearchString){
      return;
    }
    this.populateData();
  }
 
  populateData(){
    const _self = this;
    this.sourcingService.getSourceList(this.itemId, this.partNumber, this.objectId, this.objectTypeId, this.showAll, this.quoteLineId, this.showInventory).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          let height = data.length > 0 ?
            (data.length < this.souresGrid.paginationPageSize ? data.length: this.souresGrid.paginationPageSize)
            : 10;
          this.setHeightOfGrid(height);
          _self.populateGrid(data);
        }
      );  
  }


  populateGrid(data){
    const _self = this;
    let rowData = [];
    _.forEach(data, source => {
      rowData.push(_self.createSourceObject(source, _self));
    });
    this.rowDataSet = rowData;
    this.souresGrid.api.setRowData(rowData);
    this.souresGrid.api.sizeColumnsToFit();
  }
  
  crossRenderer(params,_self){
    let div = document.createElement('div');
    div.className = 'source-match-cell';
    let joinIcon = 'fas fa-times-circle fa-2x';
    let anchor_joined = document.createElement('a');
    let iJoin = document.createElement('i');
    iJoin.className = joinIcon;
    if(!params.node.data.isMatched || params.node.data.isMatched == null) 
      iJoin.setAttribute('style', 'color:white');

    iJoin.setAttribute('aria-hidden', 'true');

    let spanJoin = document.createElement('span');
    spanJoin.innerText = 'Ignore';
    spanJoin.className = 'cell-btn-text';
    if (params.node.data.isMatched == false){
      anchor_joined.appendChild(iJoin);
      anchor_joined.className = 'source-not-match';
    }else{
      anchor_joined.appendChild(spanJoin);
      anchor_joined.className = 'source-match-unknown';
    }
    anchor_joined.href = "javascript:void(0)";
    anchor_joined.addEventListener("click",function(){
      if(params.node.data.isMatched == true){
        return;
      }
      _self.matched(params, _self);
    });
    div.appendChild(anchor_joined);
    return div;
  }

  checkmarkRenderer(params,_self){
    let div = document.createElement('div');
    div.className = 'source-match-cell';
    if (!params.data.showCheckmark){
      return div;
    }
    let joinIcon = 'fas fa-check fa-2x';
    let anchor_joined = document.createElement('a');
    let iJoin = document.createElement('i');
    iJoin.className = joinIcon;
    if(!params.node.data.isMatched || params.node.data.isMatched == null) 
      iJoin.setAttribute('style', 'color:lightgray');

    iJoin.setAttribute('aria-hidden', 'true');

    let spanJoin = document.createElement('span');
    spanJoin.innerText = 'Use';
    if (params.node.data.isMatched){
      anchor_joined.appendChild(iJoin);
      anchor_joined.className = 'source-is-match';
    }else{
      anchor_joined.appendChild(spanJoin);
      anchor_joined.className = 'source-match-unknown';
    }
    anchor_joined.href = "javascript:void(0)";
    anchor_joined.addEventListener("click",function(){
      if(params.node.data.isMatched == false){
        return;
      }
      _self.joined(params, _self);
    });
    div.appendChild(anchor_joined);
    return div;
  }

  validateRTP(data):string{
    const _self = this;
    let result = '';
    if(!Number.isInteger(data.rtpQty)){
      result = 'RTP must be integer.';
    }
    if(data.rtpQty > data.Qty || data.rtpQty > _self.quantity){
      if(_self.quoteSource){
        result = 'RTP should be lower than Sales Order Quantity and Source Quantity.';
      }else{
        result='RTP should be lower than Quote Quantity and Source Quantity';
      }
    }
    return result;
  }

  saveRTP(event, _self){
    const data = event.node.data;
    let validationMessage = _self.validateRTP(data);
    if (validationMessage){
      _self.handleValidationError(data, validationMessage);
      return;
    }
    _self.sourcingService.setSourceStatus(_self.objectId, _self.objectTypeId, data.sourceId, data.isMatched, data.isJoined, data.rtpQty).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        _self.onSourceUpdated.emit(true);
      },
      error => {
          alert('Error occured when saving, reloading the page');
          _self.populateData();
      }
    )
  }

  handleValidationError(data, validationMessage){
    swal({
      title: "Validation Error",
      text: validationMessage,
      type: "error",
      confirmButtonText:"Edit",
      cancelButtonText: "Cancel Changes",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((value) => {
      this.startEditingSource(data.sourceId);
    }, (dismiss) => {
      this.populateData();
    });
  }

  startEditingSource(sourceId){
    let rowIndex =  this.rowDataSet.findIndex(x => x.sourceId == sourceId);
    if (rowIndex >= 0) {
      this.startEditingRow(rowIndex); 
    }
  }

  startEditingRow(rowIndex){
    let focusColumn = "rtpQty";
    this.souresGrid.api.setFocusedCell(rowIndex, focusColumn );
    this.souresGrid.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: focusColumn,
      keyPress: null,
      charPress: ''
    });
  }
  
  createGrid(){
    let _self = this;
    let columnDefs =  [
      {
        headerName:"",
        headerClass:"grid-header",
        cellRenderer: function(params){
          return _self.checkmarkRenderer(params, _self);
        },
        cellClass: ['ag-icon-cell'],
        cellStyle:{'text-align':'center'},
        enableColResize: false,
        width: 90,
        minWidth: 90,
        pinned: "left",
        suppressMovable: true,
        lockPinned: true
      },
      {
        headerName:"Type",
        field:"type",
        headerClass:"grid-header",
        width: 200,
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
        width: 255,
        pinned: "left",
        suppressMovable: true,
        lockPinned: true
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        headerClass:"grid-header",
        width: 200,
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
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
        minWidth: 150
      },
      {
        headerName:"Supplier",
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
        width: 200
      },
      {
        headerName:"Rating",
        field:"rating",
        headerClass:"grid-header",
        width: 110,
        cellStyle: {'text-align':'right'}
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
        cellEditorFramework: NumericInputComponent,
        cellEditorParams: { integerOnly: true },
        cellRenderer: this.numericCellRenderer,
        width: 110,
        cellStyle: {'text-align':'right'},
        editable: function(params){
          return params.node.data.isMatched == true;
        }
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
          return _self.crossRenderer(params, _self);
        },
        cellClass: ['ag-icon-cell'],
        cellStyle:{'text-align':'center'},
        enableColResize: false,
        width: 90,
        minWidth: 90,
        pinned: "right",
        suppressMovable: true,
        lockPinned: true,
      },
    ]

    this.souresGrid.api.setColumnDefs(columnDefs);
  }

  accountLinkClicked(accountId){
    this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  itemLinkClicked(itemId){
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
    let condition =  _self.conditionTypes.find(x => x.id == source.packagingConditionId);

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
      created:source.created,
      createdBy : source.createdBy,
      accountId : source.accountId,
      itemId : source.itemId,
      rating: source.rating,
      rtpQty: source.rtpQty
    };
    return retVal;
  }

  numericCellRenderer(params){
    const isInt = Number.isInteger(params.value);
    return isInt? parseInt(params.value).toLocaleString(): '';
  }
  
  setButtonsColumnQuotes(params,_self){

    let div = document.createElement('div');

      let joinIcon = (params.node.data.isMatched) ?  'fas fa-check-circle green-icon fa-2x' : 'fas fa-check-circle fa-2x ';
        let anchor_joined = document.createElement('a');
        let iJoin = document.createElement('i');
        iJoin.className = joinIcon;
        if(!params.node.data.isMatched || params.node.data.isMatched == null) 
          iJoin.setAttribute('style', 'color:lightgray');

        iJoin.setAttribute('aria-hidden', 'true');
        anchor_joined.appendChild(iJoin);
        anchor_joined.href = "javascript:void(0)";
        
        anchor_joined.addEventListener("click",function(){
          _self.joined(params, _self);
          
      });
      div.appendChild(anchor_joined);
      //instead of icon-fade try setAttribute color- light gray
      let matchIcon ;
      if (!params.node.data.isMatched) 
        matchIcon = 'fas fa-times-circle red-icon fa-2x' 
      else
        matchIcon = 'fas fa-times-circle fa-2x';
        
      let anchor_matched = document.createElement('a');
      let iMatch = document.createElement('i');
      iMatch.className = matchIcon;
      if(params.node.data.isMatched || params.node.data.isMatched == null) 
        iMatch.setAttribute('style', 'color:lightgray');
      
        iMatch.setAttribute('aria-hidden', 'true');
      anchor_matched.appendChild(iMatch);
      anchor_matched.href = "javascript:void(0)";
      
      anchor_matched.addEventListener("click",function(){
        _self.matched(params, _self);
        
     });
  
      div.appendChild(anchor_matched);
		return div;
  }
  joined(params, _self){
    let rtpQty;
    //when params.node.data.isJoined = true, it sets isDeleted = false on calling updateStatus
    if(params.node.data.isJoined){
      if (params.node.data.isMatched){
        params.node.data.isMatched = null;
      }
      else if (!params.node.data.isMatched || (params.node.data.isMatched == null)){
        params.node.data.isMatched = true;
        rtpQty = Math.min(_self.quantity, params.data.Qty);
        params.data.rtpQty = rtpQty;
      }
    }
    else {
      //insert records
      params.node.data.isJoined = true;
      params.node.data.isMatched = null;
    }
    _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, params.node.data.isJoined, rtpQty);
    _self.souresGrid.api.refreshCells({force: true,rowNodes: [params.node]});
    _self.souresGrid.api.redrawRows({force: true,rowNodes: [params.node]});      
  }

   matched(params, _self){
    if(params.node.data.isJoined){
      if (params.node.data.isMatched || (params.node.data.isMatched == null))
        params.node.data.isMatched = false;
      else
        params.node.data.isMatched = null;
    }
    else 
    {
      //insert records
      params.node.data.isJoined = true;
      if (params.node.data.isMatched || (params.node.data.isMatched == null))
        params.node.data.isMatched = false;
    }
      _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, params.node.data.isJoined);
      _self.souresGrid.api.refreshCells({force: true,rowNodes: [params.node]});
      _self.souresGrid.api.redrawRows({force: true,rowNodes: [params.node]});      
  }

  sourceUpdate(params, _self){
    if(!params.node.data.isJoined){
      //insert records
      params.node.data.isJoined = true;
      params.node.data.isMatched = null;
    }
    else{
      params.node.data.isMatched = null;
    }
    _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, params.node.data.isJoined);
    _self.souresGrid.api.refreshCells({force: true,rowNodes: [params.node]});
    _self.souresGrid.api.redrawRows({force: true,rowNodes: [params.node]});      
  }

  setButtonsColumnSourcing(params, _self){
    let div = document.createElement('div');
    let anchor ;
    let button = document.createElement('a');
    
    button.className = "btn btn-default btn-quote"
    button.href = "javascript:void(0)";
    button.addEventListener("click",function(){
      _self.sourceUpdate(params, _self);
      
   });
   let i = document.createElement('i');
   i.setAttribute('aria-hidden', 'true');

   if(params.node.data.isJoined ){
      if(params.node.data.isMatched == null){
        button.innerText = 'Quoted';
        
        i.className = "fas fa-cog pull-left"
        i.setAttribute('style', 'margin-top : 3px;');
        button.appendChild(i);
        anchor = _self.deleteButton(params,_self);
        params.node.data.isMatched = false;
        params.node.data.isJoined = true;
      }
      else if (!params.node.data.isMatched ){
        button.innerText = 'Rejected';
        button.className += ' disabled';
      }
      else if (params.node.data.isMatched){
        button.innerText = 'Accepted';
        button.className += ' disabled';
      }
   }
   else{
    button.innerText = 'Quote';
    i.className = "fas fa-arrow-up pull-left";
    i.setAttribute('style', 'margin-top : 3px;');
    button.appendChild(i);
   }
  //  if(params.node.data.isMatched){
  //   params.node.data.isMatched = false;
  //   params.node.data.isJoined = false;
  // }

   div.appendChild(button);
   if(anchor) div.appendChild(anchor);
    return div;
  }

  deleteButton(params, _self){
    let matchIcon = 'fas fa-times-circle fa-2x red-icon' ;
    let anchor_matched = document.createElement('a');
    let iMatch = document.createElement('i');
    iMatch.className = matchIcon;
    iMatch.setAttribute('aria-hidden', 'true');
    anchor_matched.appendChild(iMatch);
    anchor_matched.href = "javascript:void(0)";
    
    anchor_matched.addEventListener("click",function(){
      _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, false);
      _self.souresGrid.api.refreshCells({force: true,rowNodes: [params.node]});      
      _self.souresGrid.api.redrawRows({force: true,rowNodes: [params.node]});      
   });
      
    return anchor_matched;
  }

  updateStatus(_self, sourceId, isMatch, isJoined, rtpQty?){
    _self.sourcingService.setSourceStatus(_self.objectId, _self.objectTypeId, sourceId, isMatch, isJoined, rtpQty).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        _self.onSourceUpdated.emit(true);
      },
      error => {
          alert('Error occured when saving, reloading the page');
          _self.populateData();
      }
    )
  }

  onRowClicked(e){
    let allRowElements2 = jQuery("#sourcesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#sourcesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
    this.commentTotalNumber = this._selectedRowNode.data.comments;
    // if(!this.fromSourcingPage){
    //   this.showAll = 0;
    //   jQuery("#showAll").text(jQuery("#showAll").hasClass('sources') ? 'Show All' : 'All Sources');
    //   jQuery("#showAll").toggleClass('sources');
    // }
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openToggle(){
    if(this.quotesPartSources == 'quoted'){
      jQuery("#sources #source-comment-modal").modal('toggle');
    }else if(this.quotesPartSources == 'all'){
      jQuery("#allSources #source-comment-modal").modal('toggle');
    }
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
      _self.openToggle();
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
      jQuery('#source-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#source-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#source-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#source-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#source-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
      _self.sourcesJoinCommentUId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedSourceId = params.data.sourceId;
      _self.clickedObjectInfo = `${params.data.supplier} - Quantity ${params.data.Qty}`;
      _self.getSourcesJoinCommentUId();
      _self.openToggle();
     // jQuery("#source-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    //  const commentCount = this._selectedRowNode.data.comments;
     // this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

   resetGridColumns_Click() {
    if (this.souresGrid.columnApi && this.souresGrid.columnDefs){
      this.souresGrid.columnApi.resetColumnState();
    }
    if (this.souresGrid.api){
      this.souresGrid.api.sizeColumnsToFit();
    }

   // this.souresGrid.columnApi.resetColumnState();
  // this.souresGrid.api.sizeColumnsToFit();
   }

  refreshGrid(data) {
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

    let url = 'api/sourcing/getSourceExportList?itemId=' + _itemID + '&partNumber=' + this.partNumber + '&objectId=' + this.objectId
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
