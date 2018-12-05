import { Component, OnInit, Input, SimpleChange, OnDestroy, Output, EventEmitter, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RfqsService } from './../../../../_services/rfqs.service';
import { GridOptions } from "ag-grid";
import { SelectEditorComponent } from '../../../_sharedComponent/select-editor/select-editor.component';
import { CustomHeaderComponent } from './../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { QuoteService } from './../../../../_services/quotes.service';
import { PackagingType } from './../../../../_models/shared/packagingType';
import { RfqLineResponse } from './../../../../_models/rfqs/RfqLineResponse';
import { default as swal } from 'sweetalert2';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { SourcingService } from './../../../../_services/sourcing.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { NumericInputComponent } from '../../../_sharedComponent/numeric-input/numeric-input.component';
import { NotificationsService } from 'angular2-notifications';
import { ItemTypeaheadGridComponent } from './../../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { ColumnFilterComponent } from './../../../_sharedComponent/column-filter/column-filter.component';
import { MfrInputComponent } from './../../../_sharedComponent/mfr-input/mfr-input.component';
import { GridSettings } from './../../../../_models/common/GridSettings';
import { NumberUtil } from '../../../../_utilities/number/number-util';

@Component({
  selector: 'az-rfq-responses',
  templateUrl: './rfq-responses.component.html',
  styleUrls: ['./rfq-responses.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService]
})
export class RfqResponsesComponent implements OnInit, OnDestroy,AfterViewInit {

  @Input() rfqLineId : number;
  @Input() partNumber: string;
  @Input() manufacturer: string;
  @Input() itemId: number;
  @Output() onRowClicked = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();
  private showResponses: boolean = false;
  private rfqLineResponsesGrid: GridOptions;
  private packagingTypes: PackagingType[];
  private rowData: any[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private _selectedRowNode;
  private gridName = 'rfq-responses';

  private rfqLineObjectTypeId: number;
  private sourcesJoinObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private sourcesJoinCommentUId: number;
  private clickedSourceId: number;
  private clickedObjectInfo: string;
  private defaultGridSettings: GridSettings;

  constructor(
    private router:Router,
    private rfqsService: RfqsService, 
    private quoteService: QuoteService, 
    private agGridSettings: AGGridSettingsService, 
    private sourcingService: SourcingService,
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService,
    private notificationService: NotificationsService) {
      this.defaultGridSettings = new GridSettings();

    let _self = this;
    this.rfqLineResponsesGrid = {
      animateRows:true,
      enableColResize: true,
      pagination: true,
      paginationPageSize:20,
      suppressContextMenu:true,
      rowSelection: 'multiple',
      toolPanelSuppressSideButtons:true,
      rowHeight:30,
      headerHeight: 30,
      editType: 'fullRow',
      onRowEditingStopped: function(event){_self.saveRow(event)},
      suppressRowClickSelection: true,
      context : {
           parentComponent: this
       },
       onGridReady: e => {
        setTimeout( () => {
            _self.loadGridState();
        }, 0)
      }
      };

    this.quoteService.getPackagingTypes().subscribe(
      data => {
        this.packagingTypes = data;
        const permissions = this.ngxPermissionsService.getPermissions();
        let editable = false;
        if (permissions['CanEditLines27']) {
          editable = true;
        }
        this.createColumns(editable);
    });

    this.rfqsService.getPartCommentStatus().subscribe(
      data => {
        if (data.increment){
          _self.commentCountIncrement()
        }
    });

    this.rfqsService.getVendorRfqLineObjectTypeId().subscribe((objectTypeId) => {
      this.rfqLineObjectTypeId = objectTypeId;
    });

    this.sourcingService.getSourcesJoinObjectTypeId().subscribe((objectTypeId) => {
      this.sourcesJoinObjectTypeId = objectTypeId;
    });
  }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    jQuery(".rfqGridOuter .quotePartsButton").appendTo(".rfqGridOuter .ag-paging-panel");
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let rfqLineIdProp = changes['rfqLineId'];
    let rfqLinePartNumber = changes['partNumber'];
    let rfqLineManufacturer = changes['manufacturer'];
    let rfqLineItemId = changes['itemId'];
    let rfqLineMfrId = changes['mfrId'];
    if(rfqLineIdProp &&  rfqLineIdProp.currentValue)
    {
      this.rfqLineId = rfqLineIdProp.currentValue
      this.showResponses = true;
      this.populateData();
    }

    if(rfqLinePartNumber &&  rfqLinePartNumber.currentValue) {
      this.partNumber = rfqLinePartNumber.currentValue
    }

    if(rfqLineManufacturer &&  rfqLineManufacturer.currentValue) {
      this.manufacturer = rfqLineManufacturer.currentValue
    }

    if(rfqLineItemId &&  rfqLineItemId.currentValue) {
      this.itemId = rfqLineItemId.currentValue
    }
  }

  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

  populateData(){
  this.rfqsService.getRfqLineResponses(this.rfqLineId).subscribe(
    data => {
      let rfqLineResponses = data;
      if (this.rfqLineResponsesGrid.api){
        this.populateGrid(rfqLineResponses);
        this.loadGridState();
      }
    }
  );
}

createColumns(editable)
{
  var _self = this;  
    let columnDefs = [
        {
          headerName:"",
          headerClass:"grid-header",
          checkboxSelection: true,
          width: 40,
          minWidth: 40,
          lockPinned: true,
          pinned: "left"
        },  
        {
          headerName:"Ln",
          field:"lineNum",
          headerClass:"grid-header",
          width:50
        },
        {
          headerName:"Part Number",
          field:"partNumber",
          headerClass:"grid-header",
          width:100,
          editable: editable,
          cellClassRules: {'required': this.showRequiredField},
          filterFramework: ColumnFilterComponent,
          cellRenderer: function (params) {
            if(!params.data.itemId){
              return params.data.partNumber;
            }else{
            return _self.PartNumberCellRenderer(params, _self);
            }
          },
          cellEditorFramework: ItemTypeaheadGridComponent,
          cellEditorParams: {
            values: {parentClassName : ".partsRFQContainer"}
          },
          lockPinned: true,
        },
        {
          headerName:"Manufacturer",
          field:"manufacturer",
          headerClass:"grid-header",
          width:50,
          editable: editable,
          lockPinned: true,
          cellClassRules: {'required': this.showRequiredField},
          valueGetter: function(params){  
            return params.data.manufacturer;
          },
          cellEditorFramework:MfrInputComponent,
          filterFramework: ColumnFilterComponent,
        },
        {
          headerName:"Offer Qty",
          field:"offerQty",
          headerClass:"grid-header",
          width:50,
          editable: editable,
          cellStyle: {'text-align':'right'},
          cellEditorFramework: NumericInputComponent,
          cellEditorParams: { integerOnly: true },
          cellClassRules: {'required': this.showRequiredField}
        },
        {
          headerName:"Cost",
          field:"cost",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellStyle: {'text-align':'right'},
          cellEditorFramework: NumericInputComponent,
          comparator: _self.floatColComparator,
          suppressFilter: true,
          cellClassRules: {'required': this.showRequiredField}
        },
        {
          headerName:"Date Code",
          field:"dateCode",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellStyle: _self.cellAlignment,
          cellClassRules: {'required': this.showRequiredField}
        },
        {
          headerName:"MOQ",
          field:"moq",
          headerClass:"grid-header",
          width:70,
          cellEditorFramework: NumericInputComponent,
          cellEditorParams: { integerOnly: true },
          cellRenderer: this.numericCellRenderer,
          editable: editable
        },
        {
          headerName:"SPQ",
          field:"spq",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellEditorFramework: NumericInputComponent,
          cellEditorParams: { integerOnly: true },
          cellRenderer: this.numericCellRenderer,
        },
         {
          headerName:"Lead Time",
          field:"leadTime",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellRenderer: function(params){ 
            if (params.data.isNoStock)
              return null;
            return params.data.leadTime
          }
        },
         {
          headerName:"Valid For Hours",
          field:"validforHours",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellEditorFramework: NumericInputComponent,
          cellRenderer: this.numericCellRenderer,
        },
        {
          headerName:"Packaging",
          field:"packaging",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellRenderer: function(params){
            return params.value? params.value.name: null
          },
          cellEditorFramework: SelectEditorComponent,
          cellEditorParams: {
            values:_self.packagingTypes.map(x => { return {id:x.id, name:x.name} })
          },
        },
        {
          headerName:"Comments",
          field: 'comments',
          headerClass:"grid-header",
          headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
          headerComponentParams: { menuIcon: 'fa-comment' },
          cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
          cellStyle: {'text-align':'center'},
          minWidth: 40,
          width: 40,
          lockPinned: true,
          pinned: "right"
        }
      ];
      this.rfqLineResponsesGrid.columnDefs = columnDefs;
    }

    cellAlignment(params) {
      if (params.data.isNoStock)
        return {'text-align':'center'}
      return {'text-align':'right'}
    }
    PartNumberCellRenderer(params, self){
      let a = document.createElement('a');    
      a.text = params.value;
      if (params.data.itemId) {
        a.style.color = '#0874B7';
        a.style.textDecoration = 'underline';
        a.style.cursor = 'pointer';
        a.onclick = function () {
          self.router.navigate(['pages/items/items/item-details',{itemId: params.data.itemId}]);
        }
      }
      return a;
    }

    numericCellRenderer(params){
      if (params.data.isNoStock)
        return null;
      return params.value? parseFloat(params.value).toLocaleString(): '';
    }
    
    floatColComparator(valueA, valueB, nodeA, nodeB, isInverted){
      if (!valueA) {
        return 0;
      }
      return parseFloat(valueA) - parseFloat(valueB);
    }
    
    showRequiredField(params){
      if (params.data.isNoStock)
        return false;
      else
        return params.value ? false: true; 
    }

    populateGrid(rfqLineResponses){
      this.rowData = rfqLineResponses.map(rfqLineResponse =>{ return this.createDataRow(rfqLineResponse) });
      this.rfqLineResponsesGrid.api.setRowData(this.rowData);
      this.rfqLineResponsesGrid.api.sizeColumnsToFit();
    }

  createDataRow(rfqLineResponse: RfqLineResponse)
  {
    return {
      sourceId: rfqLineResponse.sourceId,
      lineNum: rfqLineResponse.lineNum,
      partNumber: rfqLineResponse.partNumber,
      manufacturer: rfqLineResponse.manufacturer,
      offerQty:rfqLineResponse.offerQty,
      cost: NumberUtil.formatPrice(rfqLineResponse.cost),
      itemId: rfqLineResponse.itemId,
      dateCode:rfqLineResponse.dateCode,
      packaging: rfqLineResponse.isNoStock?  {id: null, name: null}: { id:rfqLineResponse.packagingId, name:rfqLineResponse.packagingName },
      moq:rfqLineResponse.moq,
      spq: rfqLineResponse.spq,
      leadTime:rfqLineResponse.leadTimeDays,
      validforHours:rfqLineResponse.validforHours,
      comments: rfqLineResponse.comments,
      isNoStock: rfqLineResponse.isNoStock,
      isIhs: rfqLineResponse.isIhs
    }
  }
  returnFirstInvalidGridColumn(rowData) {
    if ((!rowData.partNumber) || (!(rowData.partNumber.length > 0)))
      return "partNumber";

    else if (!(rowData.manufacturer))
      return 'manufacturer';

    else if (!rowData.dateCode)
      return "dateCode";

      //Check for IsNoStock before validating the rest of the fields
    else {
      if (rowData.isNoStock)
        return null;

      else if (!(rowData.offerQty > 0) || (rowData.offerQty == ''))
        return 'offerQty';

      else if (!(rowData.cost > 0) || (rowData.cost == ''))
        return 'cost';

      else
        return null;
    }
  }

  saveRow(event) {
    let sourceId = event.node.data.sourceId;
    let nodeData = event.node.data;   
    if(this.returnFirstInvalidGridColumn(nodeData)){
      this.handleValidationError(nodeData);
      //this.handleAlert(nodeData);
      return;
    }
        
    this.rfqsService.setrfqLineResponse(nodeData.sourceId, nodeData.partNumber, nodeData.itemId, nodeData.manufacturer, nodeData.offerQty,
      NumberUtil.formatPrice(nodeData.cost), nodeData.dateCode, nodeData.packaging? nodeData.packaging.id: null, nodeData.moq, nodeData.spq,nodeData.validforHours,nodeData.leadTime, nodeData.isNoStock, nodeData.isIhs, this.rfqLineId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      rfqLineresponse => {
        
        //Update soLineId and lineNo for new row
        if(sourceId === 0)
        {
          let index = this.rowData.findIndex(function(x){return x.sourceId === 0});
          let newRow = this.createDataRow(rfqLineresponse);
          this.rowData[index] = newRow;
          event.node.data = newRow;
        }
        event.node.data.cost = NumberUtil.formatPrice(event.node.data.cost);
        this.rfqLineResponsesGrid.api.refreshRows([event.node]);

      },
      error => {
        this.handleAlert(event.node.data);
      }
    );;       
  }

  handleValidationError(data) {
    let sourceId = data.sourceId;
    let errorText = "";
    let errorCol = this.returnFirstInvalidGridColumn(data);
    let rowIndex =  this.rowData.findIndex(x => x.sourceId == sourceId);

    //Field data validation
    if (errorCol) {
      errorText = "Required fields not populated";
    }
    //Item validation
    else if (data.itemId == 0) {
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
      this.startEditingRow(rowIndex, errorCol)    
    }, (dismiss) => {
      this.populateData();
    });
  }

  handleAlert(sourceId) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss){
        let rowIndex =  this.rowData.findIndex(x => x.sourceId == sourceId);
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.populateData();
      }
    });
  }

  startEditingRow(rowIndex, errorCol?){
    let focusColumn = "partNumber";
    
    //Set default column if there isnt any
    if (errorCol)
        focusColumn = errorCol;
    
    //Focus on ag-grid standard cells
    this.rfqLineResponsesGrid.api.setFocusedCell(rowIndex, focusColumn);
    this.rfqLineResponsesGrid.api.startEditingCell({
        rowIndex: rowIndex,
        colKey: focusColumn,
        keyPress: null,
        charPress: ''
    });

    //focus on required field
    if (jQuery('.required input').length > 0)
      jQuery('.required input')[0].select(); //Selecting element that is red (required class)
  }

   createObservable(): Observable<boolean>{
      return Observable.of(true).delay(1);
  }

  onAddRow(isNoStock: boolean = false){
    
    let _self = this;
    
    var newItem = this.createDataRow(this.createNewResponse(isNoStock));
    
    this.rowData.push(newItem);
    this.rfqLineResponsesGrid.api.setRowData(this.rowData);
    this.rfqLineResponsesGrid.api.paginationGoToLastPage();
    
    let rowIndex = this.rowData.length - 1;
    this.startEditingRow(rowIndex);  

    //Complete Edit without user confirmation
    if (isNoStock)
      this.rfqLineResponsesGrid.api.stopEditing();
  }

   createNewResponse(isNoStock: boolean = false){
        let rfqLineResponse = new RfqLineResponse();
        
        //set default values for the drop downs
        
        rfqLineResponse.packagingId = this.packagingTypes[0].id;
        rfqLineResponse.manufacturer = this.manufacturer;
        rfqLineResponse.partNumber = this.partNumber;
        rfqLineResponse.itemId = this.itemId;
        rfqLineResponse.sourceId = 0;
        rfqLineResponse.isNoStock = isNoStock;
        
        //Set blank values for 'no stock'
        if (isNoStock) {
          rfqLineResponse.cost = 0;
          rfqLineResponse.dateCode = '-'
          rfqLineResponse.offerQty = 0;
          rfqLineResponse.packagingId = 0;// 0;//null;
          rfqLineResponse.moq =  0;// 0;//null;
          rfqLineResponse.spq = 0;// 0;//null;
          rfqLineResponse.leadTimeDays = 0;// 0;//null;
          rfqLineResponse.validforHours = 0;// 0;//null;
        }
        return rfqLineResponse
  }

  deleteRows() {
    let rows = this.rfqLineResponsesGrid.api.getSelectedRows();
    if (rows.length == 0) {
      this.notificationService.alert('Please select one or more response lines');
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
      let sourceIdsToDelete = rows.map(x => x.sourceId);
      let _self = this;
      this.rfqsService.deleteRfqLineResponses(sourceIdsToDelete, this.rfqLineId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
        data => {
          _self.populateData();
        },
        error => {
          _self.handleAlert(-1);
        }
      );
    }).catch(swal.noop);  //prevent "cancel" exception thrown
  }
  

  onCellClicked(e){
    this.onRowClicked.emit(e.data.sourceId);
    this.objectInfo.emit(`Line ${e.data.lineNum} - ${e.data.offerQty} qty`);
    let allRowElements2 = jQuery("#rfqLineResponsesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#rfqLineResponsesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row');
    this._selectedRowNode = e.node;
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
      _self.clickedObjectInfo = `${params.data.manufacturer} - Quantity ${params.data.offerQty}`;
      _self.getSourcesJoinCommentUIdForClick();
      jQuery("#source-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `${params.data.manufacturer} - Quantity ${params.data.offerQty}`;
      _self.hoverObjectId = params.data.sourceId;
      _self.getSourcesJoinCommentUIdForHoverOver();
      jQuery('#source-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#source-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#source-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#source-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#source-comment-preview').find('.modal-content').css('display', 'none');
      _self.sourcesJoinCommentUId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedSourceId = params.data.sourceId;
      _self.clickedObjectInfo = `${params.data.manufacturer} - Quantity ${params.data.offerQty}`;
      _self.getSourcesJoinCommentUIdForClick();
      jQuery("#source-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }

  resetGridColumns_Click() {
    this.rfqLineResponsesGrid.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.rfqLineResponsesGrid.api.setSortModel(this.defaultGridSettings.SortDef);
    this.rfqLineResponsesGrid.api.setFilterModel(this.defaultGridSettings.FilterDef);
    this.rfqLineResponsesGrid.api.sizeColumnsToFit();
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.rfqLineResponsesGrid).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.defaultGridSettings.ColumnDef = this.rfqLineResponsesGrid.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.rfqLineResponsesGrid.api.getSortModel();
   this.defaultGridSettings.FilterDef = this.rfqLineResponsesGrid.api.getFilterModel();

    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        console.log('Load Grid Settings: ')
        console.log(data);
        if (data.ColumnDef != null)
          this.rfqLineResponsesGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.rfqLineResponsesGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.rfqLineResponsesGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  refreshGrid(){
    this.populateData();
  }

  onResponseCommentSaved(){
    this.commentCountIncrement();
  }

  getSourcesJoinCommentUIdForHoverOver(){
    const _self = this;
    if (_self.rfqLineId && _self.hoverObjectId && _self.rfqLineObjectTypeId) {
      _self.sourcingService.getSourcesJoinCommentUId(_self.rfqLineId, _self.rfqLineObjectTypeId, _self.hoverObjectId).subscribe(
        data => {
          _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
        }
      )
    }
  }

  getSourcesJoinCommentUIdForClick(){
    const _self = this;
    if (_self.rfqLineId && _self.clickedSourceId && _self.rfqLineObjectTypeId) {
      _self.sourcingService.getSourcesJoinCommentUId(_self.rfqLineId, _self.rfqLineObjectTypeId, _self.clickedSourceId).subscribe(
        data => {
          _self.sourcesJoinCommentUId = data > 0 ? data : undefined;
        }
      )
    }
  }
}
