import { Component, OnInit, SimpleChange, Input,OnDestroy, Output, EventEmitter, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { GridOptions, RowNode } from "ag-grid";
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { Subject } from 'rxjs/Subject';
import { CustomHeaderComponent } from './../az-custom-header/az-custom-header.component';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { OrderFulfillmentService } from '../../../_services/order-fulfillment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConditionType } from './../../../_models/shared/ConditionType';
import * as _ from 'lodash';

@Component({
  selector: 'az-part-sources',
  templateUrl: './part-sources.component.html',
  styleUrls: ['./part-sources.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [QuoteService]
})
export class PartSourcesComponent implements OnInit,OnDestroy,AfterViewInit {

  @Input('itemId') itemId:number;
  @Input('partNumber') partNumber:string;
  @Input('objectId') objectId: number;
  @Input('objectTypeId') objectTypeId: number;
  @Input('quoteLineId') quoteLineId: number;
  @Input() renderCommentCount: boolean;
  @Input() fromSourcingPage : boolean;
  @Output() onSourceUpdated = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();

  private souresGrid:  GridOptions;
  private rowHeight= 30;
  private headerHeight= 30;
  private hideSources = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'part-sources';
  private gridSettingsVisible: boolean;
  private _selectedRowNode: RowNode;
  private showAll: boolean = true;
  private sourceObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedSourceId: number;
  private clickedObjectInfo: string;
  private sourcesJoinCommentUId: number;
  private sourcesJoinObjectTypeId: number;
  private invalidSearchString: boolean;
  private conditionTypes: ConditionType[];

  constructor(
    private quoteService: QuoteService,
    private router:Router, 
    private sourcingService: SourcingService,
    private orderFulfillmentService: OrderFulfillmentService,
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
    this.souresGrid = {
      enableColResize: true,
      pagination: true,
      paginationPageSize:20,
      rowHeight: this.rowHeight,
      suppressContextMenu:true,
      toolPanelSuppressSideButtons:true,
      suppressDragLeaveHidesColumns: true,
      headerHeight: this.headerHeight
    };
    this.loadGridState();
  }

  ngAfterViewInit(): void {
    jQuery(".sourceSourcesGrid .quotePartsButton").appendTo(".sourceSourcesGrid .ag-paging-panel");
    //this.resetGridColumns_Click();
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    let itemIdProp = changes['itemId'];
    let partNumberProp = changes['partNumber'];
    let objectId = changes['objectId'];
    let objectTypeIdProp = changes['objectTypeId'];
    let fromSourcingPageProp = changes['fromSourcingPage'];
    let quoteLineIdProp = changes['quoteLineId'];

    if (changes['quoteLineId'])
      this.quoteLineId = quoteLineIdProp.currentValue;
    if (changes['itemId'])
      this.itemId = itemIdProp.currentValue;
    if (changes['partNumber']) {
      if (typeof changes['partNumber'].currentValue === "undefined")
        this.partNumber = partNumberProp.previousValue;
      else
        this.partNumber = partNumberProp.currentValue;
    }
    if(changes['objectId'])
      this.objectId = objectId.currentValue;
    if(changes['objectTypeId'])
      this.objectTypeId = objectTypeIdProp.currentValue;
    if(changes['fromSourcingPage']){
      if(typeof changes['fromSourcingPage'].currentValue === "undefined")
        this.fromSourcingPage = fromSourcingPageProp.previousValue;
      else
        this.fromSourcingPage = fromSourcingPageProp.currentValue;

      if(!this.fromSourcingPage)
        this.showAll = false;     
    }
    if((this.itemId || this.partNumber) && this.objectId && this.objectTypeId)
    {
        this.hideSources = false;
        this.createGrid();
        this.populateGrid();
        this.showColumnSettings();
        this.loadGridState();
        this.resetGridColumns_Click();
    }
    else{
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
    this.showAll = true ;
    this.itemId =0;
    let stripPartNumber = _.replace(this.partNumber, /[^0-9a-zA-Z]/g, '');
    this.invalidSearchString = (stripPartNumber == '');
    if (this.invalidSearchString){
      return;
    }
    this.populateGrid();
  }

  showAllSources(event){
    var senderEl = event.currentTarget;
    if(senderEl.innerText != "Show All")
      this.showAll = false;
    else
      this.showAll = true;
    jQuery(senderEl).text(jQuery(senderEl).hasClass('sources') ? 'Show All' : 'All Sources');
    jQuery(senderEl).toggleClass('sources');
    this.populateGrid();
    this.resetGridColumns_Click();
  }

  populateGrid(){
    this.sourcingService.getSourceList(this.itemId, this.partNumber, this.objectId, this.objectTypeId, this.showAll, this.quoteLineId, true).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
          let height = data.length > 0 ?
            (data.length < this.souresGrid.paginationPageSize ? data.length: this.souresGrid.paginationPageSize)
            : 10;

          this.setHeightOfGrid(height);
          let rowData = new Array();

          if (data == []) {
            rowData = [];
          } else {
            for(let i=0; i< data.length; i++){
              let condition =  this.conditionTypes.find(x => x.id == data[i].packagingConditionId);

              rowData.push({
                type:data[i].typeName,
                partNumber:data[i].partNumber,
                manufacturer:data[i].manufacturer,
                commodityName:data[i].commodityName,
                supplier:data[i].supplier,
                Qty:data[i].qty,
                Cost:data[i].cost,
                dateCode:data[i].dateCode,
                packagingName:data[i].packagingName,
                condition:{
                  id: condition ? condition.id: null,
                  name: condition ? condition.name: ''
                },                 
                leadTimeDays:data[i].leadTimeDays,
                moq:data[i].moq,
                isMatched: (data[i].isMatched == null)? null : data[i].isMatched ,
                isJoined: data[i].isJoined,
                sourceId:data[i].sourceId,
                comments: data[i].comments,
                ageInDays: data[i].ageInDays + " day(s)",
                created:data[i].created.substr(0,9) + " " + data[i].ageInDays + " " + "day(s)",
                createdBy : data[i].createdBy,
                accountId : data[i].accountId,
                itemId : data[i].itemId,
                rating: data[i].rating,
                rtp:data[i].rtpQty,
                
              });
            }
          }
          this.souresGrid.api.setRowData(rowData);
          this.souresGrid.api.sizeColumnsToFit();
        }
      );  
      this.loadGridState();
      this.resetGridColumns_Click();
  }
  
  createGrid()
  {
    let _self = this;
    let columnDefs =  [
      {
        headerName:"Type",
        field:"type",
        headerClass:"grid-header",
        lockPinned: true,
        pinned: "left",
        width: 200
      },
      {
        headerName:"Part Number",
        field:"partNumber",
        pinned: "left",
        lockPinned: true,
        headerClass:"grid-header",
        cellRenderer: function (params) {
          if(!params.data.itemId){
            return params.data.partNumber;
          }else{
          var anchor = document.createElement('a');
          anchor.text = params.data.partNumber;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.itemLinkClicked(params.data.itemId)});
          return anchor;
          }
      },
        width: 255,
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        width: 200
      },
      {
        headerName:"Date",
        field:"created",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        width: 200,
       // cellRenderer: function(params){return _self.ageRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        suppressMovable: true,
      },
      {
        headerName:"Buyer",
        field:"createdBy",
        headerClass:"grid-header",
        width: 110,
        cellStyle: {'text-align':'center'},
      },
      {
        headerName:"Commodity",
        field:"commodityName",
        headerClass:"grid-header",
        width: 200,
       // minWidth: 150,
        cellStyle: {'text-align':'center'},
      },
      {
        headerName:"Supplier",
        field:"supplier",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.supplier;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.accountLinkClicked(params.data.accountId)});
          return anchor;
      },
        width: 200
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
        headerName:"MOQ",
        field:"moq",
        headerClass:"grid-header",
        width: 110
      },
      {
        headerName:"RTP",
        field:"rtpQty",
        headerClass:"grid-header",
        width: 110
      },
      {
        headerName:"Rating",
        field:"rating",
        headerClass:"grid-header",
        width: 110
      },
      {
        headerName:"Lead Time",
        field:"leadTimeDays",
        headerClass:"grid-header",
        width: 110,
        cellStyle: {'text-align':'right'},
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
        lockPinned: true,
        pinned: "right",
      },
      {
        headerName:"",
        headerClass:"grid-header",
        cellRenderer: function(params){
          if(!_self.fromSourcingPage)
            return _self.setButtonsColumnQuotes(params, _self);
          else{
            return _self.setButtonsColumnSourcing(params,_self);
          }
        },
        cellClass: ['ag-icon-cell'],
        cellStyle:{'text-align':'center'},
        width: 120,
        minWidth: 120,
        lockPinned: true,
        pinned: "right",
      }
    ]

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

  ageTooltipRenderer(params, _self){
    let div = document.createElement('div');
    div.innerText = params.data.ageInDays;
    let toolTipText = 'Created By: '+ params.data.createdBy  + '\n' + 'Created At: '+ params.data.created ;
    div.setAttribute('title', toolTipText)   
    return div;
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
    //when params.node.data.isJoined = true, it sets isDeleted = false on calling updateStatus
    if(params.node.data.isJoined){
      if (params.node.data.isMatched)
        params.node.data.isMatched = null;
      else if (!params.node.data.isMatched || (params.node.data.isMatched == null))
        params.node.data.isMatched = true;
    }
    else {
      //insert records
      params.node.data.isJoined = true;
      params.node.data.isMatched = null;
    }
    _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, params.node.data.isJoined);
    _self.souresGrid.api.refreshRows([params.node]);
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
      _self.souresGrid.api.refreshRows([params.node]);
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
    _self.souresGrid.api.redrawRows({rowNodes: [params.node]});
    
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
      params.node.data.isJoined = false;
      params.node.data.isMatched = null;
      _self.updateStatus(_self, params.node.data.sourceId, params.node.data.isMatched, params.node.data.isJoined);
      _self.souresGrid.api.redrawRows({rowNodes: [params.node]});
      
   });
      
    return anchor_matched;
  }
  updateStatus(_self, sourceId, isMatch, isJoined)
  {
    _self.sourcingService.setSourceStatus(_self.objectId, _self.objectTypeId, sourceId, isMatch, isJoined).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        _self.onSourceUpdated.emit(true);
      },
      error => {
          alert('Error occured when saving, reloading the page');
          _self.populateGrid();
      }
    )
  }

  onRowClicked(e){
    let allRowElements2 = jQuery("#sourcesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#sourcesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
    if(!this.fromSourcingPage){
      this.showAll = false;
      jQuery("#showAll").text(jQuery("#showAll").hasClass('sources') ? 'Show All' : 'All Sources');
      jQuery("#showAll").toggleClass('sources');
      this.resetGridColumns_Click();
    }
  }

  ngOnDestroy() {
    console.log("ngOnDestroy");
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshGrid(){
     this.createGrid();
     this.populateGrid();
     this.showColumnSettings();
     this.loadGridState();
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
      jQuery("#source-comment-modal").modal('toggle');
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
      jQuery("#source-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
    if (this.souresGrid.columnApi){
      this.souresGrid.columnApi.resetColumnState();
    }
    if (this.souresGrid.api){
      this.souresGrid.api.sizeColumnsToFit();
    }
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
    console.log("loadGrid");
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

    let url = 'api/sourcing/getSourceExportList?itemId=' + _itemID + '&partNumber=' + this.partNumber + '&objectId=' + this.objectId + '&objectTypeId=' + this.objectTypeId;
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
