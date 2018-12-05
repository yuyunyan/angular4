import { element } from 'protractor';
import { Subscription } from 'rxjs/Subscription';
import { QuotePart } from './../../../_models/quotes/quotePart';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { Commodity } from './../../../_models/shared/commodity';
import { PackagingType } from './../../../_models/shared/packagingType';
import { GridOptions, ColumnApi, IDatasource, RowNode } from 'ag-grid';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { PartSourcesComponent } from './../../_sharedComponent/part-sources/part-sources.component';
import { SourcingQuoteLines } from './../../../_models/sourcing/sourcingQuoteLines';
import { SourcingRouteStatus } from './../../../_models/sourcing/sourcingStatuses';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { List } from 'linqts';
import { RfqLine } from './../../../_models/rfqs/RfqLine';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { SourceService } from '../source.service';
import * as _ from 'lodash';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { setTimeout } from 'core-js/library/web/timers';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'az-sourcing-quotes',
  templateUrl: './sourcing-parts.component.html',
  styleUrls: ['./sourcing-parts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class SourcingPartsComponent implements OnInit , OnDestroy, OnChanges,AfterViewInit {
 
  private gridName = 'sourcing-quotes';
  private partsGrid:  GridOptions;
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet =[];
  @Input('quoteId') quoteId:number;
  @Input('quoteVersionId') quoteVersionId:number;
  @Input('quoteLineId') quoteLineId:number;
  @Input('partNumber') partNumber:string;
  @Input('routeToStatusObject') routeToStatusObject;
  private partNumberStrip:string;
  @Output() onItemsChanged = new EventEmitter<boolean>();
  @Output() onContentChanged = new EventEmitter();
  @Output() selectedQuoteLineId = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  private itemId:number;
  private routeStatuses: SourcingRouteStatus[];
  private sourcingStatus:number;
  private totalRowCount:number = 1000;
  private statusId: number = 1;
  public rowLimit: number = 25;
  private _selectedRowNode: RowNode;
  private _selectedRowArray: RfqLine[];
  private addRfqBool: boolean;
  private configValue ;
  private tabIndex : number = 0;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Output() private quotePart = new EventEmitter();
  @Output() selectedRows = new EventEmitter();
  private filterColumn : string;
  private filterText : string;
  private quotePartObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedQuoteLineId: number;
  private clickedObjectInfo: string;
  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 2000,
    lastOnBottom: true
  };

  constructor(
    private sourcingService: SourcingService, 
    private router:Router, 
    private agGridSettings: AGGridSettingsService, 
    private _notificationsService: NotificationsService,
    private sourceService : SourceService,
    private quoteService: QuoteService) {
    const _self = this;
    this.addRfqBool = true;
    this.routeStatuses = new Array<SourcingRouteStatus>();
    this.partsGrid = {
      enableServerSideSorting: true,
      enableColResize: true,
      enableServerSideFilter:true,
      pagination:true,
      rowSelection: 'multiple',
      rowDeselection: true,
      suppressRowClickSelection: true,
      suppressContextMenu:true,
      rowModelType: 'serverSide',
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      suppressDragLeaveHidesColumns: true,
      paginationPageSize: this.rowLimit,
      maxConcurrentDatasourceRequests: 2,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true},
      rowHeight:30,
      headerHeight: 30,
      columnDefs : _self.createGrid()
    };
    this.sourcingService.getPartCommentStatus()
      .takeUntil(this.ngUnsubscribe.asObservable())  
      .subscribe(
      data => {
        if (data.increment) {
          _self.commentCountIncrement();
        }
      }
    );

    this.quoteService.getQuotePartObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable()).subscribe((objectTypeId) => {
      this.quotePartObjectTypeId = objectTypeId;
    });

    this.sourceService.sourcingStatus$.takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      status => {
        if(status != null){
          this.getDataForStatuses();
        }
    });

    // this._selectedRowArray = new Array<RfqLine>();
  }

  ngOnInit() {
     //this.getDataForStatuses();
     if(this.sourcingStatus){
       this.loadGridState();
     }
  }

  ngAfterViewInit(): void {
    jQuery(".sourcingPartsGridOuter .quotePartsButton").appendTo(".sourcingPartsGridOuter .ag-paging-panel");
    this.getDataForStatuses();
  }
  
  ngOnChanges(changes: SimpleChanges){
    const routeToStatusChanges = changes['routeToStatusObject'];
    const _self = this;
    if (routeToStatusChanges && routeToStatusChanges.currentValue){
      _self.getDataForStatuses();
      if (_self.partsGrid.api){
        _self.partsGrid.api.setServerSideDatasource(_self.PopulateGridDataSource(_self.sourcingStatus));
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onRowClicked(e){
    // this.selectedQuoteLineId.emit(e.data.quoteLineId);
    // this.objectInfo.emit(`Quote ${e.data.quoteId} Line ${e.data.quoteLineId} - ${e.data.partNumber}`);
    let allRowElements2 = jQuery("#sourcing-parts-grid").find(`.ag-row`);
    let rowElement2 = jQuery("#sourcing-parts-grid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;

    let quotePartToUpdate = {
      quoteLineId: e.data.quoteLineId,
      lineNo: e.data.lineNo,
      customerLineNo: e.data.customerLine,
      partNumber: e.data.partNumber,
      manufacturer: e.data.manufacturer,
      commodityId: e.data.commodityId,
      quantity: e.data.qty,
      price: e.data.price,
      cost: e.data.cost,
      dateCode: e.data.dateCode,
      packagingId: e.data.packagingId,
      shipDate: e.data.shipDate,
      statusId: this.sourcingStatus,
      quoteId: e.data.quoteId,
      quoteVersionId: this.quoteVersionId,
      itemId: e.data.itemId,
      itemListLineId : e.data.itemListLineId,
      customerPN : e.data.customerPartNumber,
      routeToId: null
    };
    this.quotePart.emit(quotePartToUpdate);
  }

 commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  onRowDoubleClicked(e) {
    let quoteLineId = e.data.quoteLineId;
    let partNumber = e.data.partNumber;

    this.quoteLineId = quoteLineId;
    this.partNumber = partNumber;
    this.partNumberStrip = e.data.partNumberStrip;
    this.onContentChanged.emit({
      'quoteLineId': this.quoteLineId,
      'partNumber': this.partNumber, 
      'partNumberStrip': this.partNumberStrip,
      'tabIndex' : this.tabIndex,
      'mfr': e.data.manufacturer,
      'commodityId': e.data.commodityId,
      'itemId': e.data.itemId
    });

    this.onRowClicked(e);
  }

  getDataForStatuses(){
    this.sourcingService.getRouteStatuses().subscribe(data => {
      this.routeStatuses = data.routeStatuses;
      _.forEach(this.routeStatuses, (routeStatus: SourcingRouteStatus) => {
        if (routeStatus.isDefault && this.partsGrid.api){
          this.sourcingStatus = routeStatus.routeStatusId;
          this.partsGrid.api.setServerSideDatasource(this.PopulateGridDataSource(this.sourcingStatus));
        }
      });
    });
  }

  statusChanged(routeStatus: SourcingRouteStatus){
    this.sourcingStatus = routeStatus.routeStatusId;
    this.partsGrid.api.setServerSideDatasource(this.PopulateGridDataSource(this.sourcingStatus));
  }

  areColsUnchecked(){
    if(typeof this.partsGrid.api !== "undefined"){
      this.partsGrid.api.forEachNode( rowNode => {
        if(rowNode.isSelected()){
          this.addRfqBool = false;
        }
      });
    }
    this.addRfqBool =  true;
  }

  setRouteStatus(rs: SourcingRouteStatus){
    const _self = this;
    let selectedNodes = this.partsGrid.api.getSelectedNodes();
    if (!selectedNodes ||selectedNodes.length == 0){
      _self._notificationsService.alert("Please Select at least one Quote Line.")
      return;
    }
    const payload = {
      RouteStatusID: rs.routeStatusId,
      QuoteLines: _.map(selectedNodes, node => {
        return {
          QuoteLineID: node.data.quoteLineId
        }
      })
    };
    _self.sourcingService.setBuyerRoute(payload)
      .takeUntil(this.ngUnsubscribe.asObservable())    
      .subscribe(data => {
      if (data && data.isSuccess){
        _self.getDataForStatuses();
        if (_self.partsGrid.api){
          _self.partsGrid.api.setServerSideDatasource(_self.PopulateGridDataSource(_self.sourcingStatus));
        }
      }
    });
  }

  populateDialog(){
    this._selectedRowArray = new Array<RfqLine>();
    this.partsGrid.api.forEachNode( rowNode => {
      if(rowNode.isSelected()){
        let line = new RfqLine();
        line.partNumber = rowNode.data.partNumber;
        line.manufacturer = rowNode.data.manufacturer;
        line.dateCode = rowNode.data.dateCode;
        line.qty = rowNode.data.qty;
        line.commodityId = rowNode.data.commodityId;
        line.itemId = rowNode.data.itemId;
        line.partNumberStrip = rowNode.data.partNumberStrip;
        this._selectedRowArray.push(line);
      }
    });
    // if (this._selectedRowArray && this._selectedRowArray.length > 0){
      jQuery('#rfqGenerateModal').modal('toggle');
      jQuery('.modal-backdrop').css('z-index', '100');
    // } else {
    //   this._notificationsService.error(
    //     'None of the quote part was selected',
    //     'Please check at least one quote part to be included in Rfq.'
    //   );
    // }
  }

  createGrid(){
    let _self = this;
    return  [
      {
        headerName:"",
        headerClass:"grid-header",
        checkboxSelection: true,
        // cellRendererParams: function(params){return _self.checkBoxSelected(params)},
        //headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        //headerComponentParams: { menuIcon: 'fa-globe' },
        //cellRenderer: function(params){return _self.loadCheckboxRenderer(params, _self)},
        minWidth: 40,
        maxWidth: 40,
        width: 40,
        suppressSorting: true,
        enableColResize: false,
        lockPinned: true,
        pinned: "left"
      },
      {
        headerName:"Quote #",
        field:"quoteId",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.quoteId;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.quoteLinkClicked(params.data.quoteId , params.data.quoteVersionId)});
          return anchor;
      },
        width: 75,
        minWidth: 75,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName:"Ln",
        field:"lineNo",
        headerClass:"grid-header",
        width: 50,
        minWidth: 50,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"Customer",
        field:"accountName",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.accountName;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.accountLinkClicked(params.data.accountId)});
          return anchor;
      },
        minWidth: 235,
        width: 235,
        filterFramework: ColumnFilterComponent,
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
          anchor.addEventListener("click", function(){_self.itemLinkClicked(params.data.itemId)});
          return anchor;
          }
      },
        minWidth: 200,
        width: 200,
        filterFramework: ColumnFilterComponent,
      },
       {
        headerName:"Manufacturer",
        field:"manufacturer",
        headerClass:"grid-header",
        minWidth: 150,
        width: 200,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName:"Commodity",
        field: "commodityName",
        headerClass:"grid-header",
        width: 110,
        minWidth: 110,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName:"Quantity",
        field:"qty",
        cellRenderer: function(params){
          let span = document.createElement('span');
          span.className += 'pull-right'; 
          span.innerHTML = params.data.qty > 0 ? '' + params.data.qty.toLocaleString(): '';
          return span;
        },
        headerClass:"grid-header",
        minWidth: 100,
        width: 100,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"Packaging",
        field: "packagingName",
        headerClass:"grid-header",
        minWidth: 100,
        width: 100,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"Type",
        field: "quoteTypeName",
        headerClass:"grid-header",
        minWidth: 100,
        width: 100,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName:"Sources Count",
        field: "sourcesCount",
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-globe' },
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.sourcesCount;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.sourceTabIndexFunction()});
          return anchor;
      },
        minWidth: 100,
        width: 100,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"RFQs",
        field: "rfqCount",
        headerClass:"grid-header",
        cellRenderer: function (params) {
          var anchor = document.createElement('a');
          anchor.text = params.data.rfqCount;
          anchor.href = "javascript:void(0)";
          anchor.addEventListener("click", function(){_self.rfqTabIndexFunction()});
          return anchor;
      },
        minWidth: 100,
        width: 100,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"DateCode",
        field:"dateCode",
        headerClass:"grid-header",
        minWidth: 85,
        width: 85,
        suppressFilter: true,
        suppressSorting: true,
      },
      {
        headerName:"Salesperson(s)",
        field:"owners",
        headerClass:"grid-header",
        minWidth: 160,
        width: 160,
        filterFramework: ColumnFilterComponent,
      },
      {
        headerName: "Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        width: 40,
        minWidth: 40,
        suppressFilter: true,
        suppressSorting: true,
        lockPinned: true,
        pinned: "right"
      }
    ];
    
  }

  rfqTabIndexFunction(){
    jQuery('.rfqTab').trigger('click');
      this.tabIndex = 1;
  }

  sourceTabIndexFunction(){
    jQuery('.sourceTab').trigger('click');
      this.tabIndex = 0;
  }

  accountLinkClicked(accountId)
  {
    this.router.navigate(['pages/accounts/account-details', { accountId: accountId }]);
  }

  itemLinkClicked(itemId)
  {
    this.router.navigate(['pages/items/items/item-details', { itemId : itemId }]);
  }

  quoteLinkClicked(quoteId , quoteVersionId)
  {
    this.router.navigate(['pages/quotes/quote-details', { quoteId : quoteId , quoteVersionId : quoteVersionId }]);
  }
  loadCheckboxRenderer(params, _self)
  {
    //<input type="checkbox" name="comments" value="Bike" class="mdlCheckbox" id="comments"  [(ngModel)]="question.comment">Allow Comments<br>
    let input = document.createElement('input');
    // let i = document.createElement('i');
    // i.className = 'fa fa-globe';
    // i.setAttribute('aria-hidden', 'true');
    //input.appendChild(i);
    //anchor.href = "javascript:void(0)";
    input.type = 'checkbox';
    input.value = params.data.quoteLineId;
    input.className = 'sourcingQuotesCheckbox';
    input.addEventListener("change",function(e){

    });

    return input;
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
      _self.clickedQuoteLineId = params.data.quoteLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#quote-part-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      _self.hoverObjectId = params.data.quoteLineId;
      jQuery('#quote-part-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#quote-part-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#quote-part-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#quote-part-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#quote-part-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedQuoteLineId = params.data.quoteLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#quote-part-comment-modal").modal('toggle');
    });
    return div;
  }

  PopulateGridDataSource(status: number) {
    this.statusId = status;
    let self = this;

    var dataSource = {
      getRows: function (params) {
        //Declare rowLimit/rowOffset for API
        let rowLimit = params.request.endRow - params.request.startRow;
        let rowOffset = params.request.startRow;

        let sortCol = '';
        let sortOrder = '';
        let DescSort = false;

        let filterColumn = '';
        let filterText = '';
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

        if(params.filterModel && Object.keys(params.filterModel).length > 0){
          for(let col in params.filterModel){
            if(params.filterModel[col].value != ''){
              filterColumn = col;
              filterText = params.filterModel[col].value ;
              break;
            }            
          }
        }

        self.sourcingService.getSourcingQuoteLines(status, rowOffset, rowLimit, sortCol, DescSort, filterColumn ,filterText).subscribe(
          data => {
            let quoteLines = data.results;

            //Total Rows
            self.totalRowCount = data.totalRows;

            let quoteDataService = [];
            quoteLines.ForEach(element => {
              quoteDataService.push({
                quoteLineId: element.quoteLineId,
                quoteId: element.quoteId,
                lineNo: element.lineNo,
                accountName: element.accountName,
                partNumber: element.partNumber,
                partNumberStrip: element.partNumberStrip,
                manufacturer: element.manufacturer,
                commodityId: element.commodityId,
                commodityName: element.commodityName,
                qty: element.qty,
                packagingId : element.packagingId,
                packagingName: element.packagingName,
                dateCode: element.dateCode,
                //salesperson: element.salesFirstName + ' ' + element.salesLastName,
                comments: element.comments,
                price : element.price,
                cost: element.cost,
                itemId: element.itemId,
                statusId : element.statusId,
                itemListLineId : element.itemListLineId,
                dueDate : element.dueDate,
                shipDate : element.shipDate,
                customerLine : element.customerLine,
                customerPartNumber : element.customerPartNumber,
                quoteTypeName : element.quoteTypeName,
                rfqCount : element.rfqCount,
                owners : element.owners,
                accountId : element.accountId,
                quoteVersionId: element.quoteVersionId,
                sourcesCount : element.sourcesCount
              })
             
            })
            if(quoteDataService.length==0){
              quoteDataService.push({
                quoteLineId:'',
                quoteId:'',
                lineNo:''
              })
             self.partsGrid.api.showNoRowsOverlay();
           }
             params.successCallback(quoteDataService, data.totalRows);
          }
        )
      }
    }
    return dataSource
  }

  resetGridColumns_Click() {
    if (this.partsGrid.columnApi && this.partsGrid.columnDefs){
      this.partsGrid.columnApi.resetColumnState();
    }
    if (this.partsGrid.api){
      this.partsGrid.api.sizeColumnsToFit();
    }
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.partsGrid).subscribe(
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
        if (data.ColumnDef != null && this.partsGrid.columnApi)
          this.partsGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null && this.partsGrid.columnApi)
          this.partsGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null && this.partsGrid.columnApi)
          this.partsGrid.api.setFilterModel(JSON.parse(data.FilterDef));

    })
  }

  refreshGrid(){
    console.log("refresh sourcing-parts")

    const _self = this;
    _self.partsGrid.api.setServerSideDatasource(_self.PopulateGridDataSource(_self.sourcingStatus));
  }

  exportGrid_Click(event) {
    let url = 'api/sourcing/getSourcingQuoteExportList?statusId=' + this.statusId; 
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

  onQuotePartCommentSaved(){
    this.sourcingService.partCommentIncrement();
  }
}

