import { DatePickerEditorComponent } from './../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange, OnDestroy, ViewEncapsulation, AfterViewInit} from '@angular/core';
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { OrderFulfillmentService } from '../../../_services/order-fulfillment.service';
import { QuotePart} from './../../../_models/quotes/quotePart';
import { QuoteRouteToObject } from './../../../_models/quotes/quoteRouteToObject';
import { Commodity } from './../../../_models/shared/commodity';
import { PackagingType } from './../../../_models/shared/packagingType';
import { UserDetail } from './../../../_models/userdetail';
import { Status } from './../../../_models/shared/status';
import { GridOptions, RowNode } from "ag-grid";
import { Router, ActivatedRoute } from '@angular/router';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { ItemTypeaheadGridComponent } from './../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { NumericInputComponent } from './../../_sharedComponent/numeric-input/numeric-input.component';
import { PartSourcesComponent } from './../../_sharedComponent/part-sources/part-sources.component';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import { OwnershipTypes } from './../../../_models/shared/ownershipTypes';
import { AGGridSettingsService } from './../../../_services/ag-grid-settings.service';
import { SharedService } from './../../../_services/shared.service';
import { ErrorManagementService } from './../../../_services/errorManagement.service';
import { NotificationsService } from 'angular2-notifications';
import { default as swal } from 'sweetalert2';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import {InputComService} from './../../../_coms/input-com.service';
import { ComoditySelectComponent } from './../../_sharedComponent/comodity-select/comodity-select.component';
import { MfrInputComponent } from './../../_sharedComponent/mfr-input/mfr-input.component';
import { ColumnFilterComponent } from './../../_sharedComponent/column-filter/column-filter.component';
import { LeadtimeEditorComponent } from './../../_sharedComponent/leadtime-editor/leadtime-editor.component';
import { GPUtilities } from '../../../_utilities/gp-utilities/gp-utilities';
import { cellMenuColDefinition, ICellMenuItem, ICellMenuParams } from '../../../_utilities/cellMenuGrid';
import { NumberUtil } from '../../../_utilities/number/number-util';

@Component({
  selector: 'az-quote-parts',
  templateUrl: './quote-parts.component.html',
  styleUrls: ['./quote-parts.component.scss'],
  providers: [AGGridSettingsService, InputComService],
  encapsulation: ViewEncapsulation.None,
})

export class QuotePartsComponent implements OnInit, OnChanges,OnDestroy, AfterViewInit{

  private gridName = 'quote-parts';
  private partsGrid:  GridOptions;
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet =[];
  private tabIndex : number = 0;

  @Input('quoteId') quoteId:number;
  @Input('quoteVersionId') quoteVersionId:number;
  @Output() onItemsChanged = new EventEmitter<boolean>();
  @Output() onContentChanged = new EventEmitter<number>();
  @Output() onPartsSelectionChanges = new EventEmitter<Array<Object>>();
  // @Output() onRowClicked = new EventEmitter<number>();
  // @Output() objectInfo = new EventEmitter<string>();

  @Output() selectedSourceId = new EventEmitter<number>();
  @Output() selectedSourceObjectInfo = new EventEmitter<string>();
  //private selectedSourceId: number;
  private sourceObjectTypeId: number;

  private sourcesJoinCommentUId: number;
  private selectedQuoteLineId: number;

  private searchParameter: string = '';

  private commodities:Commodity[];
  private quantity: number;
  private packagingTypes: PackagingType[];
  private itemId:number;
  private partNumber:string;
  private partNumberStrip:string;
  private quoteLineId:number;
  private objectTypeId: number;
  private quotePartObjectTypeId: number;
  private quoteParts: QuotePart[];
  private routeQuoteLineIds: Array<number>;
  private userList: Array<UserDetail>;
  private showGrid = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private statuses: Status[];
  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }

  private _selectedRowNode: RowNode;
  //
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedQuoteLineId: number;
  private clickedObjectInfo: string;

  private filterText: string = undefined;
  private filterColumn: string = undefined;

  constructor(private quoteService: QuoteService, private router:Router, private agGridSettings: AGGridSettingsService,
    private errorManagementService: ErrorManagementService, private notificationService: NotificationsService,private sourcingService: SourcingService,
    private ngxPermissionsService: NgxPermissionsService,private orderFulfillmentService: OrderFulfillmentService,
    private commodityComService: InputComService, private sharedService: SharedService,private gpUtilities: GPUtilities) {

    let _self = this;
    this.partsGrid = {
      getNodeChildDetails: this.getNodeChildDetails,
      animateRows:true,
      enableGroupEdit:true,
      onRowEditingStopped: function(event){_self.saveRow(event,_self)},
      onSelectionChanged: function(){_self.selectionChanges()},
      onFilterChanged: _self.onFilterChanged.bind(_self),
      suppressDragLeaveHidesColumns: true,
      enableColResize: true,
      enableSorting: true,
      enableServerSideFilter: true,
      suppressRowClickSelection: true,
      editType: 'fullRow',
      pagination: true,
      paginationPageSize:25,
      suppressContextMenu:true,
      cacheBlockSize: 25,
      maxBlocksInCache:1,
      rowSelection: 'multiple',
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      },
      getRowClass: function(params){
        let rowStyle;
        if (params.data.isAlternate){
          rowStyle = 'isAlternate';
        }
        return rowStyle;
      },
      context: {
        parentComponent: this
      },
    };
    this.objectTypeId = OwnershipTypes.QuoteDetail;
    this.quoteService.getPartCommentStatus().subscribe(
      data => {
        if (data.increment) {
          _self.commentCountIncrement();
        }
      }
    )
    this.quoteService.getQuotePartObjectTypeId().subscribe((objectTypeId) => {
      this.quotePartObjectTypeId = objectTypeId;
    });

    this.sourcingService.getSourceObjectTypeId().subscribe((objectTypeId) => {
      this.sourceObjectTypeId = objectTypeId;
    });

    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditLines = !!permissions['CanEditLines'];
      const canLinkSources = !!permissions['CanLinkSources'];
      if (canEditLines || canLinkSources) {
        _self.createGrid(_self.commodities, _self.packagingTypes, _self.statuses, _self.userList, canEditLines, canLinkSources);
        _self.populateGrid(_self.quoteParts);
      }
    });
  }

  onFilterChanged(value){
    const _self = this;
    const filterModel = _self.partsGrid.api.getFilterModel();
    _self.filterColumn = undefined;
    _self.filterText = undefined;
    for(let col in filterModel){
      if (filterModel[col].filter != '') {
        _self.filterColumn = col;
        _self.filterText = filterModel[col].filter;
        break;
      }
    }
    _self.populateData(false);
  }

  ngOnInit() {
  }

  triggerSave(){
    this.partsGrid.api.stopEditing();
  }

  ngAfterViewInit(): void {
    jQuery(".quotePartsGridOuter .quotePartsButton").appendTo(".quotePartsGridOuter .ag-paging-panel");
  }

  ngOnChanges(changes: {[propKey: number]: SimpleChange}) {
    var _self = this;
    let quoteIdProp = changes['quoteId'];
    let quoteVersionIdProp = changes['quoteVersionId'];

    if (quoteIdProp && quoteIdProp.currentValue) {
      this.quoteId = quoteIdProp.currentValue;
      this.quoteVersionId = quoteVersionIdProp.currentValue;
      this.populateData(true);
    }
  }

  populateData(createGrid: boolean = true){
    this.quoteService.getQuoteData(this.quoteId, this.quoteVersionId, this.filterText,
      this.filterColumn).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {
    
          const permissions = this.ngxPermissionsService.getPermissions();
          let editable = false;
          let linkSource = false;
          this.setHeightOfGrid(data[0].length);
          if (permissions['CanEditLines']) {
            editable = true;
          }
          if (permissions['CanLinkSources']) {
            linkSource = true;
          }
          this.quoteParts = data[0];
          if(createGrid){
            this.createGrid(data[1], data[2], data[3], data[4], editable, linkSource);
          }
          this.populateGrid(data[0]);
        jQuery('#partsGrid').resizable({ grid: [10000, 1] });
        });
  }

  setHeightOfGrid(recordsCount)
  {
    let count = recordsCount < this.partsGrid.paginationPageSize ? recordsCount: this.partsGrid.paginationPageSize;

    let height = this.getHeight(count + 5);
    document.getElementById('partsGrid').style.height = height+'px';
  }

  createGrid(commodities:Commodity[], packagingTypes: PackagingType[], statusList: Status[], buyerList: UserDetail[], editable, linkSource)
  {
    this.commodities = commodities;
    this.packagingTypes = packagingTypes
    this.statuses = statusList;
    this.userList = buyerList;
    let _self = this;
    let columnDefs = [
      {
        headerName: "",
        field: "lineNo",
        headerClass: "grid-header",
        cellRenderer: 'group',
        cellRendererParams: {
          suppressCount: true,
        },
        minWidth: 10,
        width:35,
        pinned: "left",
        lockPinned: true,
      },
      {
        headerName:"",
        headerClass:"grid-header",
        cellRenderer: 'group',
        checkboxSelection:true,
        headerCheckboxSelection: true,
        pinned: "left",
        lockPinned: true,
        suppressMovable: true,
        minWidth: 20,
        width:35,
        suppressSorting: true,
        suppressFilter: true
      },

      {
        headerName:"Ln",
        field:"lineNo",
        headerClass:"grid-header",
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        minWidth: 20,
        width: 40,
        suppressFilter: true
      },
      {
        headerName:"CLn",
        field:"customerLineNo",
        headerClass:"grid-header",
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        editable: editable,
        minWidth: 20,
        width: 40,
        suppressFilter: true
      },
      {
        headerName:"Part Number",
        field:"partNumber",
        headerClass:"grid-header",
        cellClassRules: {'required': this.requiredField} ,
        cellRenderer: function (params) {
          if(!params.data.itemId){
            return params.data.partNumber;
          }
          return _self.PartNumberCellRenderer(params, _self);
        },
        cellEditorParams: {
          values: {parentClassName : ".partsContainer"}
        },
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        cellEditorFramework: ItemTypeaheadGridComponent,
        editable: editable,
        minWidth: 20,
        width: 205,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        valueGetter: function(params){
          return params.data.manufacturer;
        },
        headerClass:"grid-header",
        cellEditorFramework:MfrInputComponent,
        editable: editable,
        minWidth: 20,
        width:125,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Internal PN",
        field:"customerPN",
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        headerClass:"grid-header",
        minWidth: 20,
        width: 100,
        editable: editable,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Quantity",
        field:"quantity",
        headerClass:"grid-header",
        minWidth: 20,
        width: 80,
        pinned: "left",
        suppressMovable: true,
        lockPinned: true,
        editable: editable,
        cellEditorFramework: NumericInputComponent,
        cellRenderer: this.numericCellRenderer,
        cellStyle: {'text-align':'right'},
        cellClassRules: {'required': this.requiredField},
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Commodity",
        field: "commodity",
        valueGetter: this.SelectCellGetter,
        headerClass:"grid-header",
        cellEditorFramework: ComoditySelectComponent,
        editable: editable,
        minWidth: 20,
        width: 125,
        cellEditorParams: {
          values:this.commodities.map(x => {return {id:x.id, name:x.name}})
        },
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Routed To",
        field: "routedTo",
        headerClass: "grid-header",
        cellRenderer: this.RoutedToCellRenderer,
        editable: false,
        width: 100,
        minWidth: 100,
        filter: 'agSetColumnFilter',
        keyCreator: this.routedToKeyCreator
      },
      {
        headerName:"Price(USD)",
        field:"price",
        headerClass:"grid-header",
        minWidth: 20,
        width: 80,
        editable: editable,
        cellEditorFramework: NumericInputComponent,
        cellStyle: {'text-align':'right'},
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Cost(USD)",
        field:"cost",
        headerClass:"grid-header",
        minWidth: 20,
        width: 80,
        editable: editable,
        cellEditorFramework: NumericInputComponent,
        cellStyle: {'text-align':'right'},
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter',
      },
      {
        headerName:"GP(%)",
        headerClass:"grid-header",
        valueGetter: function(params){
          if((params.data.quantity * params.data.price) == 0){
            return "";
          }
          let val = (((params.data.quantity * params.data.price) - (params.data.quantity * params.data.cost)) / (params.data.quantity * params.data.price) * 100);
          if(isNaN(val))
            val = 0.00;
          return val.toFixed(2)+"%"
        },
        volatile: true,
        minWidth: 20,
        width: 80,
        cellRenderer: 'animateShowChange',
        cellStyle: {'text-align':'right'},
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter',
      },
      {
        headerName:"GP (USD)",
        headerClass:"grid-header",
        valueGetter: function(params){
          if(params.data.gp == 0){
            return "";
          }
          let val = params.data.gp;
          return val
        },
        volatile: true,
        minWidth: 20,
        width: 80,
        cellRenderer: 'animateShowChange',
        cellStyle: {'text-align':'right'},
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter',
      },
      {
        headerName:"Date Code",
        field:"dateCode",
        headerClass:"grid-header",
        minWidth: 20,
        width: 80,
        editable: editable,
        cellClassRules: {'required': this.requiredField},
        filter: 'agDateColumnFilter'
      },
      {
        headerName:"Packaging",
        field: "packaging",
        headerClass:"grid-header",
        valueGetter: this.SelectCellGetter,
        cellEditorFramework: SelectEditorComponent,
        editable: editable,
        minWidth: 20,
        width: 100,
        cellEditorParams: {
          values:this.packagingTypes.map(x => {return {id:x.id, name:x.name}})
        },
        comparator: _self.dropdownColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Lead Time",
        field: "leadTimeDays",
        headerClass:"grid-header",
        cellRenderer: function(params){
          return _self.leadTimeRenderer(params, _self);
        },
        cellEditorFramework: LeadtimeEditorComponent,
        cellEditorParams: { integerOnly: true },
        cellStyle: {'text-align':'right'},
        editable: editable,
        minWidth:140,
        width: 140
      },
      {
        headerName:"Status",
        field: "status",
        headerClass:"grid-header",
        valueGetter: this.SelectCellGetter,
        cellEditorFramework: SelectEditorComponent,
        minWidth: 20,
        width: 55,
        cellEditorParams: {
          values:this.statuses.map(x => {return {id:x.id, name:x.name}})
        },
        comparator: _self.dropdownColComparator,
        filter: 'agSetColumnFilter'
      },
      cellMenuColDefinition(this.prepareCellMenuItems, _self),
      {
        headerName:"",
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-globe' },
        cellRenderer: function(params){return _self.loadSourcesRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        minWidth: 35,
        pinned: "right",
        lockPinned: true,
        suppressMovable: true,
        maxWidth: 50,
        width: 35,
        hide: !linkSource,
        suppressSorting: true,
        suppressFilter: true
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        minWidth: 37,
        pinned: "right",
        suppressMovable: true,
        lockPinned: true,
        width: 37,
        suppressSorting: true,
        suppressFilter: true
      }
    ];

    this.partsGrid.api.setColumnDefs(columnDefs);
    this.partsGrid.rowHeight = this.rowHeight;
    this.partsGrid.headerHeight = this.headerHeight;

  }

  leadTimeRenderer(params, _self){
    let div = document.createElement('div');
    let leadTime = params.data.leadTimeDays;
    div.innerText = leadTime== 0 ? '0 d': ( leadTime? _self.sharedService.calculateDateUnit(leadTime): '');
    return div;
  }

  returnFirstInvalidGridColumn(rowData) {
    if ((!rowData.partNumber) || (!(rowData.partNumber.length > 0)))
      return "partNumber";

    else if (!(rowData.manufacturer))
      return 'manufacturer';

    else if (!(rowData.quantity > 0) || (rowData.quantity == ''))
      return 'quantity';

    else if (!(rowData.dateCode))
      return 'dateCode';
    else
      return null;
  }
  handleValidationError(node){
    let errorText = "";
    let errorCol = this.returnFirstInvalidGridColumn(node.data);
    console.log("The error is" + errorCol);
    //Field data validation
    if (errorCol) {
      errorText = "Required fields not populated";
    }
    //Item validation
    else if(node.data.itemId == 0){
      errorText = "Please select an item from the suggested Items";
    }
    swal({
      title: "Validation Error",
      text: errorText,
      type: "error",
      confirmButtonText:"Edit",
      cancelButtonText: "Cancel Changes",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((value) => {
      this.startEditingRow(node.rowIndex, errorCol);
      //this.startEditingQuoteLine(node.data.quoteLineId, errorCol)
    }, (dismiss) => {
      this.populateData();
    });
  }

  startEditingQuoteLine(quoteLineId, errorCol?) {
    let rowIndex = this.rowDataSet.findIndex(x => x.quoteLineId == quoteLineId);
    if (rowIndex >= 0) {
      this.startEditingRow(rowIndex, errorCol);
    }
  }

  requiredField(params)
  {
    return params.value ? false: true;
  }

  SelectCellRenderer(params) {
    if(typeof params.value !== 'undefined')
      return params.value.name;
  }

  SelectCellGetter(params) {
    const field = params.colDef.field
    return params.data && params.data[field] ? params.data[field].name : null;
  }

  RoutedToCellRenderer(params){
    if (!params || !params.value){
      return '';
    }
    const buyerStatuses = params.value;
    let div = document.createElement('div');
    div.className = 'routed-to-wrap';
    _.forEach(buyerStatuses, buyerStatus => {
      let wrapper = document.createElement('div');
      wrapper.className = 'icon-wrapper-route';
      let i = document.createElement('i');
      i.className = `fa ${buyerStatus.icon} fa-lg`;
      i.title = `${buyerStatus.buyerName} (${buyerStatus.statusName})`;
      i.setAttribute('aria-hidden', 'true');
      i.style.color = `#${buyerStatus.iconColor}`;
      wrapper.appendChild(i);
      let span = document.createElement('span');
      span.innerText = buyerStatus.buyerInitials;
      span.style.marginLeft = "5px";
      wrapper.appendChild(span);
      div.appendChild(wrapper);
    });
    return div;
  }
  routedToKeyCreator(params) {
    const routedToObj = params.value[0]
    const key = routedToObj ? routedToObj.buyerInitials : null;
    return key;
  }

PartNumberCellRenderer(params, self){
  let a = document.createElement('a');
  a.text = params.value;
  let url= `pages/items/items/item-details;itemId=${params.data.itemId}`;
  if (params.data.itemId) {
    a.className = 'part-hover-link'
    a.onclick = function () {
      //self.router.navigate(['pages/items/items/item-details',{itemId: params.data.itemId}]);
     return window.open(url,'_blank');
    }
  }
  
  return a;
}

numericCellRenderer(params){
  return parseInt(params.value).toLocaleString();
}

onBtNextCell() {
  this.partsGrid.api.tabToNextCell();
}

onBtPreviousCell() {
  this.partsGrid.api.tabToPreviousCell();
}
onSelectedSourceId(e){
  this.selectedSourceId.emit(e);
  this.searchParameter = '';
}

onSelectedSourceObjectInfo(e){
  this.selectedSourceObjectInfo.emit(e);
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
    anchor.style.margin = 'auto';
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

  loadSourcesRenderer(params, _self)
  {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    switch (params.data.sourceMatchStatus) {
      case '1':
        i.className = 'fas fa-check-circle';
        i.style.color = 'green';
        i.title = "Source Chosen";
        break;
      case '0':
        i.className = 'fas fa-exclamation-circle';
        i.style.color = '#E5DC00';
        i.title = "Sources Available"
        break;
      default:
        i.className = 'fas fa-question-circle';
        i.style.color = 'gray';
        i.title = "Check for Sources"
        break;
    }
   
    i.setAttribute('aria-hidden', 'true');
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";
    
    anchor.addEventListener("click",function(){
      _self.itemId =  params.data.itemId;
      _self.partNumber = params.data.partNumber;
      _self.quantity = params.data.quantity;
      _self.partNumberStrip = params.data.partNumberStrip;
      _self.quoteLineId = params.data.quoteLineId;               
      _self.showGrid = true; 
    });
    return anchor;
  }

  dropdownColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    if (!valueA || !valueA.name) return -1;
    return valueA.name.localeCompare(valueB.name)
  }

  onSourceUpdated(updated){
    if(updated){
      this.populateData();
    }
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

  tabClick(){
    this.orderFulfillmentService.onSourceTabClick();
  }

  craeteNewQuotePart(){
    let quotePart = new QuotePart();
    
    //set default values for the drop downs
    quotePart.commodityId = this.commodities[0].id;
    quotePart.packagingId = this.packagingTypes[0].id;
    let indexOfDefault = this.statuses.findIndex(x => x.isDefault);
    quotePart.statusId =  indexOfDefault > -1 ? this.statuses.find(x => x.isDefault).id : this.statuses[0].id;
    quotePart.lineNo = 0;
    quotePart.quoteLineId = 0;
    quotePart.comments = 0;
    quotePart.routedTo = new Array<QuoteRouteToObject>();

    /*quotePart.gpm = 0.00;
    quotePart.shipDate = new Date().toLocaleDateString("en-US");*/
    return quotePart;
  }

  saveRow(event, _self) {
    ///ToDO
    ///Need to check if the row has changed, if not then no need to do any of the following
    let isChild = event.node.level !== 0;
    let parentQuoteLineId = isChild ?  event.node.parent.data.quoteLineId : 0;
  
      if(this.returnFirstInvalidGridColumn(event.node.data)) {  
          this.handleValidationError(event.node);
          return
        }
        //Todo
        //If user has left fields blank then ask question if they want to delete the row otherwise again set the focus back in the cell
        //  this.startEditingRow(event.node.rowIndex);  
        //  throw new Error("Something went badly wrong!");

        //If it's parent row remove it from the main rowdataset
        // if(!isChild)
        // {
        //   this.rowDataSet.pop();
        // }
        // else
        // {
        //   let parentRowData = this.rowDataSet.find(x => x.quoteLineId === parentQuoteLineId);
        //   parentRowData.alternates.pop();
        // }

        // this.partsGrid.api.setRowData(this.rowDataSet);
      
        
    let children = event.node.childrenAfterGroup;
    let childrenIds = [];
    
    if(children){
      //Update Children quantities
      children.forEach(child => {
        let val = event.node.data.quantity;
        child.setDataValue("quantity", val);
      });
      //Get all the children Ids to send to server
      childrenIds = children.map(x => x.data.quoteLineId);  
    }
    let quotePart:QuotePart;
    let isAlternate = event.node.level !== 0;
    quotePart={
      quoteLineId:event.node.data.quoteLineId,
      lineNo:event.node.data.lineNo,
      customerLineNo:event.node.data.customerLineNo,
      partNumber:event.node.data.partNumber,
      partNumberStrip: event.node.data.partNumberStrip,
      manufacturer:event.node.data.manufacturer,
      leadTimeDays: event.node.data.leadTimeDays,
      commodityId: event.node.data.commodity.id,
      customerPN:event.node.data.customerPN,
      quantity:event.node.data.quantity,
      price: Number(NumberUtil.formatPrice(event.node.data.price)),
      cost: Number(NumberUtil.formatPrice(event.node.data.cost)),
      gpm:event.node.data.gpm,
      packagingId:event.node.data.packaging.id,
      alternates:childrenIds,
      isAlternate:isAlternate,
      dateCode:event.node.data.dateCode,
      ItemId:event.node.data.itemId,
      statusId:event.node.data.status.id,
      routedTo: event.node.data.routedTo,
      isIhs: event.node.data.isIhs,
      IsPrinted: true //doesnt go anywhere, we use a seperate onClick method to save IsPrinted
    }
        
    _self.quoteService.setQuoteParts(quotePart, parentQuoteLineId,this.quoteId, this.quoteVersionId).takeUntil(this.ngUnsubscribe)
      .subscribe(
        data => {
          //Update quoteLineId and lineNo for new row
          if (event.node.data.quoteLineId === 0) {
            let ln;
            if (!isChild) {
              ln =_self.rowDataSet.find(function(x){return x.quoteLineId === 0});
            } else {
              ln = _self.rowDataSet.find(x => x.quoteLineId === parentQuoteLineId).alternates.find(y => y.quoteLineId === 0);
            }
            
            ln.lineNo = data.lineNo;
            ln.partNumberStrip = data.partNumberStrip;
            //_self.partsGrid.api.refreshRows([event.node]);
            //event.node.setData(ln);
          }
          
          event.node.data.quoteLineId = data.quoteLineId;
          event.node.data.itemId = data.ItemId;
          event.node.data.isIhs = false;
          event.node.data.cost = NumberUtil.formatPrice(data.cost);
          event.node.data.price = NumberUtil.formatPrice(data.price);
          _self.partsGrid.api.refreshRows([event.node]);
          if (_self.filterColumn){
            _self.populateData(false);
          }
        },
        error => {
          if(!isChild) {
            this.handleAlert(event.node.data.quoteLineId);
          }
        }
    );
  }

  onAddRow() {
    this.partsGrid.api.paginationGoToLastPage();
    var newItem = this.createRow(this.craeteNewQuotePart(), this);
    
    this.rowDataSet.push(newItem);
    this.partsGrid.api.setRowData(this.rowDataSet);
    this.setHeightOfGrid(this.rowDataSet.length);
    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);  
  }

  deleteRows(){
    let rows = this.partsGrid.api.getSelectedRows();
    if (rows.length == 0){
      this.notificationService.alert('Please select one or more quote lines');
      return;
    }
    swal({
      title: 'Are you sure?',
      text: "Are you sure you want to delete the checked line(s)",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(() => {
      let quoteLinesToDelete = rows.map(x => x.quoteLineId);
      let _self = this;
      this.quoteService.deleteQuoteParts(quoteLinesToDelete)
        .takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(success => {
          if (success) {
            quoteLinesToDelete.forEach(itemToDelete => {
              let indexOfItem = _self.rowDataSet.findIndex(x => x.quoteLineId == itemToDelete);
              _self.rowDataSet.splice(indexOfItem, 1);
            });
            swal(
              'Deleted!',
              'The checked line(s) have been deleted.',
              'success'
            );
          }
          else {
            swal(
              'Oops...',
              'Something went wrong!',
              'error'
            )
          }
          _self.partsGrid.api.setRowData(_self.rowDataSet);
        }, error => {
          swal("Error occured when trying to delete the checked line(s)!");
          throw error;
        });
    }).catch(swal.noop);  //prevent "cancel" exception thrown
  }

  startEditingRow(rowIndex, errorCol?){
    let focusColumn = "customerLineNo";

    //Set default column if there isnt any
    if (errorCol)
      focusColumn = errorCol;

    //Focus on ag-grid standard cells
    this.partsGrid.api.setFocusedCell(rowIndex, focusColumn );
    this.partsGrid.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: focusColumn,
      keyPress: null,
      charPress: ''
    });

    //focus on required field
    jQuery('.required input')[0].select(); //Selecting element that is red (required class)


      
  }

  isEditable(params, isQuantity:boolean){
      //Only alternate quantity is not editable
      return !params.node.data.isAlternate || !isQuantity;
  }

  populateGrid(quoteParts: QuotePart[]){
    let _self = this;
    let rowData = [];
    for(let i=0; i< quoteParts.length; i++){
      let row = this.createRowWithAlternates(quoteParts[i], _self);
      rowData.push(row);
    }
    
    this.rowDataSet = rowData;
    this.partsGrid.api.setRowData(rowData);

    if (quoteParts.length == 0){
    this.partsGrid.api.showNoRowsOverlay();
    }
    this.partsGrid.api.refreshCells();
  }

  createRowWithAlternates(quotePart , _self)
  {
    let alternates = new Array();
    for(let a=0; a < quotePart.alternates.length; a++) {
      alternates.push(this.createRow(quotePart.alternates[a], _self));
    }
    let row = this.createRow(quotePart, _self);
    row.alternates = alternates;
    return row;
  }

  createRow(quotePart: QuotePart, _self) {
    let commodity = _self.commodities.find(x => x.id == quotePart.commodityId);
    let packaging = _self.packagingTypes.find(x => x.id == quotePart.packagingId);
    var retValue = {
      quoteLineId:quotePart.quoteLineId,
      lineNo:quotePart.lineNo,
      customerLineNo:quotePart.customerLineNo,
      partNumber:quotePart.partNumber,
      partNumberStrip: quotePart.partNumberStrip,
      manufacturer:quotePart.manufacturer,
      customerPN:quotePart.customerPN,
      quantity:quotePart.quantity,
      price: NumberUtil.formatPrice(quotePart.price),
      leadTimeDays: quotePart.leadTimeDays,
      cost: NumberUtil.formatPrice(quotePart.cost),
      //gpm:quotePart.gpm,
      gp:_self.gpUtilities.GrossProfit(quotePart.quantity,quotePart.cost,quotePart.price),
      alternates:[],
      isAlternate:quotePart.isAlternate,
      dateCode:quotePart.dateCode,
      commodity:commodity,
      packaging:packaging,
      sourceMatchStatus: quotePart.sourceMatchStatus,
      sourceMatchCount: quotePart.sourceMatchCount,
      sourceMatchQty: quotePart.sourceMatchQty,
      sourceType: quotePart.sourceType,
      //packaging:{id:packaging.id, name:packaging.name},
      itemId:quotePart.ItemId,
      status : quotePart.statusId ? this.statuses.find(x => x.id == quotePart.statusId) : this.statuses[0], 
      comments: quotePart.comments,
      routedTo: quotePart.routedTo,
      isIhs:false,
      IsPrinted: quotePart.IsPrinted
    }
    return retValue;
  }

  handleAlert(quoteLineId) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        let rowIndex =  this.rowDataSet.findIndex(x => x.quoteLineId == quoteLineId);
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.populateData()
      }
    });
  }

  getNodeChildDetails(rowItem) {
    if(rowItem.alternates.length > 0)
    {
      return {
        group:true,
        children:rowItem.alternates,
        key:rowItem.lineNo,
      }
    }
    else {
      return null;
    }
  }

  childClicked()
  {
    this.onItemsChanged.emit(true);
  }

  getHeight(count:number)
  {
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  selectionChanges(){
    let rows = this.partsGrid.api.getSelectedRows();
    this.onPartsSelectionChanges.emit(rows);
  }

  onCellClicked(e){
    // this.onRowClicked.emit(e.data.quoteLineId);
    // this.objectInfo.emit(`Line ${e.data.lineNo} - ${e.data.partNumber}`);
    let allRowElements2 = jQuery("#partsGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#partsGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }

  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  
  resetGridColumns_Click() {
    this.populateData();
  }

  refreshGrid(){
    console.log("refresh quote-parts")

   this.populateData();
  }

  saveGridState_Click(event) {
    console.log(this.partsGrid);
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
        if (data.ColumnDef != null)
          this.partsGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef && (!_.isEmpty(JSON.parse(data.SortDef)))){
          this.partsGrid.api.setSortModel(JSON.parse(data.SortDef));
        }
        if (data.FilterDef && (!_.isEmpty(JSON.parse(data.FilterDef)))){
          this.partsGrid.api.setFilterModel(JSON.parse(data.FilterDef));
        }
    })
  }

  exportGrid_Click(event) {
    let url = 'api/quote/getPartExportList?quoteId=' + this.quoteId + '&versionId=' + this.quoteVersionId;
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
  
  routeQuoteLines(){
    const _self = this;
    let selectedNodes = _self.partsGrid.api.getSelectedRows();
    _self.routeQuoteLineIds = _.map(selectedNodes, node => {
      return {QuoteLineID: node.quoteLineId}
    });
    if (!selectedNodes || selectedNodes.length < 1){
      this.notificationService.alert('Please select one or more quote lines to route to buyer.');
    } else {
      jQuery('#divRouteModal').modal('toggle');
    }
  }

  onQuoteLineSelected(node){
    if (node.allChildrenCount > 0){
      _.forEach(node.allLeafChildren, leaf => {
        leaf.setSelected(node.selected);
      })
    }
  }

  onRouteToCompeleted(value){
    const _self = this;
    _self.populateData(false);
  }

  onQuoteExtraCommentSaved(){
    this.quoteService.partCommentIncrement();
  }

  hasPermission(permissionName: string){
    const permissions = this.ngxPermissionsService.getPermissions();
    let hasPermission = false;
    if (permissions[permissionName]) {
      hasPermission = true;
    }
    return hasPermission;
  }

createContextMenu(params){
  let btn = document.createElement('button');
  btn.className = 'btn btn-xs btn-secondary';
  btn.innerHTML ='<i class="fa fa-ellipsis-v"></i>';
  btn.style.margin = 'auto';

  //const menu = new CustomCellMenu(params.rowIndex,this.prepareCellMenuItems(params),this, params.node.data);
  btn.addEventListener('click',function(e){
    //menu.show({left: e.pageX, top: e.pageY});
  });
    
    return btn;
}

prepareCellMenuItems(params: ICellMenuParams, _self: any): ICellMenuItem[] {
  let data = params.node.data;
  let menuItems: ICellMenuItem[] = [
      {
          icon: 'fas fa-copy',
          name: 'Copy',
          action: null
      }];
  if (!data.isAlternate) {
      menuItems.push({
          icon: 'fas fa-plus',
          name: 'Add Alternate/ADL',
          action: (_self, params) => {
              _self.contextMenuAddAlternate(_self, params);
          },
      });
  }

  menuItems.push(_self.preparePrintMenuItem(data.IsPrinted ,_self));
  return menuItems;
}
  preparePrintMenuItem(isPrinted: boolean, _self: any): ICellMenuItem{
    const permissions = _self.ngxPermissionsService.getPermissions();
    let disabled = !permissions['CanEditLines'];

    return {
      icon:'fas fa-print',
      name: (isPrinted ? 'Enable' : 'Disable') + ' Print',
      action: disabled ? null : (_self, params,refreshCallback) => {
        _self.contextMenuTooglePrint(_self, params, refreshCallback);
      }
    }
  }

  contextMenuAddAlternate(_self, params){
    let data = params.data;
    var newAlternate = _self.createRow(_self.craeteNewQuotePart(), _self);
    let rowData = _self.rowDataSet.find(x => x.quoteLineId === data.quoteLineId);
    rowData.alternates.push(newAlternate);
    let quoteLineId = data.quoteLineId;
    _self.partsGrid.api.setRowData(_self.rowDataSet);
    let nodes = _self.partsGrid.api.getRenderedNodes();
    let changedNode = nodes.find(x => x.data.quoteLineId == quoteLineId);
    changedNode.setExpanded(true);
    let lastChild = changedNode.childrenAfterGroup.find(x => x.lastChild == true);
    _self.startEditingRow(lastChild.rowIndex);
  }

  contextMenuTooglePrint(_self, params, refreshMenuCallback:(menuItem: ICellMenuItem)=>void){
    let data = params.data;
    let newValue = !data.IsPrinted;
    _self.quoteService.setQuoteLinePrint(data.quoteLineId, newValue).takeUntil(_self.ngUnsubscribe)
    .subscribe(
      data => {
        if (data == 0) {
          params.data.IsPrinted = newValue;
          refreshMenuCallback(this.preparePrintMenuItem(newValue ,_self));
        }
      });
      return newValue;
  }

}


