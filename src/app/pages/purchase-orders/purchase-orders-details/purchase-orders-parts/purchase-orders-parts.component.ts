import { Component, OnInit, OnDestroy, Input, SimpleChange, Output, EventEmitter, ViewEncapsulation,AfterViewInit } from '@angular/core';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { GridOptions, RowNode } from "ag-grid";
import { QuotePart} from './../../../../_models/quotes/quotePart';
import { Commodity } from './../../../../_models/shared/commodity';
import { PackagingType } from './../../../../_models/shared/packagingType';
import { ConditionType } from './../../../../_models/shared/ConditionType';
import { Item } from './../../../../_models/Items/item';
import { PurchaseOrderPart } from './../../../../_models/purchase-orders/purchaseOrderPart';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { CustomHeaderComponent } from './../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { default as swal } from 'sweetalert2';
import { Observable } from 'rxjs/Observable';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { ItemTypeaheadGridComponent } from './../../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { InputComService} from './../../../../_coms/input-com.service';
import { MfrInputComponent} from './../../../_sharedComponent/mfr-input/mfr-input.component';
import { ComoditySelectComponent } from './../../../_sharedComponent/comodity-select/comodity-select.component';
import { LinkCreator } from './../../../../_utilities/linkCreaator';
import { NumericInputComponent } from './../../../_sharedComponent/numeric-input/numeric-input.component';
import { PapaParseService } from 'ngx-papaparse';
import { GridSettings } from './../../../../_models/common/GridSettings';
import { PoSoUtilities } from './../../../../_utilities/po-so-utilities/po-so-utilities'; 
import { extractProgramSymbols } from '@angular/compiler';
import { WSAEINVALIDPROVIDER } from 'constants';
import { cellMenuColDefinition, ICellMenuItem, ICellMenuParams } from '../../../../_utilities/cellMenuGrid';
import { NumberUtil } from '../../../../_utilities/number/number-util';

@Component({
  selector: 'az-purchase-orders-parts',
  templateUrl: './purchase-orders-parts.component.html',
  styleUrls: ['./purchase-orders-parts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService, InputComService]
})
export class PurchaseOrdersPartsComponent implements OnDestroy,AfterViewInit {

  @Input() poId;
  @Input() poVersionId;
  @Input() externalId;
  private partsGrid:  GridOptions;
  private packagingTypes: PackagingType[];
  private conditionTypes: ConditionType[];
  private rowHeight= 30;
  private headerHeight= 30;
  private rowDataSet =[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private gridName = 'purchase-order-parts';
  private _selectedRowNode: RowNode;
  private _rowCount: number = 0;
  private poParts: PurchaseOrderPart[];
  private poLineId : number;
  private itemId : number ;
  private partNumber : string;
  private specBuyChecked : boolean;
  private isPOLineClicked : boolean = false;
  private selectedCost: number = 0;
  private selectedLineNum: number;
  private specBuyData = {};
  private poPartForUpdate = {};
  private commodities:Commodity[];
  private allocatedQtyUpdated : boolean = false;

  private poLineObjectTypeId: number;
  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private poLineAvailableQty : number;
  private defaultGridSettings: GridSettings;

  constructor(
    private papa: PapaParseService,
    private purchaseOrdersService: PurchaseOrdersService, 
    private errorManagementService: ErrorManagementService, 
    private agGridSettings: AGGridSettingsService,
    private ngxPermissionsService: NgxPermissionsService,
    private sopoUtilities: PoSoUtilities,
    private linkCreator:LinkCreator) {
    this.defaultGridSettings = new GridSettings();
    let _self = this;
    _self.poLineAvailableQty = 0;
    this.partsGrid = {
      animateRows:true,
      enableGroupEdit:true,
      onRowEditingStopped: function(event){_self.saveRow(event,_self)},
      enableColResize: true,
      enableSorting: true,
      suppressRowClickSelection: true,
      editType: 'fullRow',
      pagination: true,
      suppressContextMenu:true,
      paginationPageSize: 5,
      rowSelection: 'multiple',
      toolPanelSuppressSideButtons:true,
      context: {
        parentComponent: this
      },
      defaultColDef:{
        suppressMenu:true
      },
      onViewportChanged: function() {
        _self.partsGrid.api.sizeColumnsToFit();
      },
      enableFilter: true,
      floatingFilter: true
    };
    this.purchaseOrdersService.getPartCommentStatus().takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        if (data.increment) {
          _self.commentCountIncrement();
        }
      }
    )

    this.purchaseOrdersService.getPOLinesObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
      this.poLineObjectTypeId = objectTypeId;
    });

    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditLines = !!permissions['CanEditLines'];
      if (canEditLines) {
        _self.createGrid( _self.packagingTypes, _self.conditionTypes, canEditLines);
        _self.populateGrid(_self.poParts);
      }
    });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let poIdProp = changes['poId'];
    let poVersionIdProp = changes['poVersionId'];
    let externalIdProp = changes['externalId'];

    if (poIdProp && poIdProp.currentValue)
      this.poId = poIdProp.currentValue;
    if (poVersionIdProp && poVersionIdProp.currentValue)
      this.poVersionId = poVersionIdProp.currentValue;
    if (externalIdProp && externalIdProp.currentValue)
      this.externalId = externalIdProp.currentValue;

    if(this.poId && this.poVersionId){
        this.populateData(null);
    }else{
        //Create new Sales Order
    }
  }

  ngAfterViewInit(): void {
    jQuery(".purchaseOrderGridOuter .quotePartsButton").appendTo(".purchaseOrderGridOuter .ag-paging-panel");
  }

  populateData(callbackFunc)
  {
    this.purchaseOrdersService.getPurchaseOrderData(this.poId, this.poVersionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        const permissions = this.ngxPermissionsService.getPermissions();
        console.log('User permissions', permissions);
        let editable = false;
        if (permissions['CanEditLines']) {
          editable = true;
        }
        let height = data[0].length < this.partsGrid.paginationPageSize ? data[0].length: this.partsGrid.paginationPageSize;
        this._rowCount = height == 0 ? 7: height + 4;
        this.setHeightOfGrid(this._rowCount);
        this.poParts = data[0];
        this.commodities = data[2];
        this.conditionTypes = data[3];
        this.createGrid(data[1], data[3], editable);
        this.populateGrid(data[0]);
        this.loadGridState();
        if(callbackFunc) {
          callbackFunc();
        }
      });
  }

  //let rowIndex = this.partsGrid.api.getRenderedNodes().filter(x => x.data.soLineId == 0)[0].rowIndex;//this.rowDataSet.length - 1;


  setHeightOfGrid(count)
  { 
    let height = this.getHeight(count);
    document.getElementById('partsGrid').style.height = height+'px';
  }

  getHeight(count:number)
  {
    return (count * (this.rowHeight )) + this.headerHeight;
  }

  createGrid( packagingTypes: PackagingType[],  conditionTypes: ConditionType[], editable: boolean)
  {
    this.packagingTypes = packagingTypes;
    this.conditionTypes = conditionTypes;
    let _self = this;
    let columnDefs =  [
      {
        headerName:"",
        headerClass:"grid-header",
        checkboxSelection: true,
        width: 40,
        minWidth: 40,
        maxWidth: 40,
        lockPinned: true,
        pinned: "left",
        suppressFilter: true
      },
      {
        headerName:"Ln",
        field:"lineNo",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        width: 40,
        minWidth: 40,
        suppressFilter: true
      },
      {
        headerName:"Vln",
        field:"vendorLine",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        editable: editable,
        minWidth: 40,
        cellEditorFramework : NumericInputComponent,
        cellEditorParams: { integerOnly: true },
        suppressFilter: true
        //valueSetter: this.nameValueSetter
      },
      {
        headerName:"Part Number",
        field:"partNumber",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        editable: true,
        cellEditorFramework: ItemTypeaheadGridComponent,
        cellEditorParams: { keepDisabled: true ,values: {parentClassName : ".partsContainer"}
        }, 
        cellRenderer: (params) => {
          if(!params.node.data.itemId){
            return params.node.data.partNumber;
          }else{
          return this.linkCreator.createItemLink(params.node.data.itemId, params.node.data.partNumber);
        }
      }, 
        minWidth: 240,
        width: 240,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Manufacturer",
        field:"manufacturer",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        cellEditorFramework: MfrInputComponent,
        minWidth: 160,
        width: 160,
        editable: false,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Commodity",
        field: "commodity",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        valueGetter: this.SelectCellGetter,
        cellEditorFramework: ComoditySelectComponent,
        cellEditorParams: {
          values:this.commodities.map(x => {return {id:x.id, name:x.name}})
        },
        minWidth: 170,
        editable: editable,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Qty",
        field:"quantity",
        lockPinned: true,
        pinned: "left",
        headerClass:"grid-header",
        editable: editable,
        cellRenderer:function(params){return params.data.quantity.toLocaleString()},
        // valueGetter: (params) => { return params.data.quantity.toLocaleString()},
        cellEditorFramework : NumericInputComponent,
        cellEditorParams: { integerOnly: true, readFromProperty:'quantity'  },
        cellClassRules: {'required': this.requiredField},
        cellClass: "text-right",
        minWidth: 150,
        width: 150,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Cost(USD)",
        field:"cost",
        headerClass:"grid-header",
        editable: editable,
        minWidth: 120,
        cellEditorFramework : NumericInputComponent,
        cellClassRules: {'required': this.requiredField},
        cellClass: "text-right",
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"DateCode",
        field:"dateCode",
        headerClass:"grid-header",
        editable: editable,
        minWidth: 80,
        filter: 'agDateColumnFilter'
      },
       {
        headerName:"Packaging",
        field: "packaging",
        headerClass:"grid-header",
        valueGetter: this.SelectCellGetter,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
                 values:_self.packagingTypes.map(x => {return {id:x.id, name:x.name}})
             },
        minWidth: 100,
        comparator: _self.dropdownColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName:"Package Condition",
        field: "condition",
        headerClass:"grid-header",
        valueGetter: this.SelectCellGetter,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
                values:_self.conditionTypes.map(x => {return {id:x.id, name:x.name}})
            },
        minWidth: 100,
        comparator: _self.dropdownColComparator,
        filter: 'agSetColumnFilter'
      },
      // {
      //   headerName:"Promised Date",
      //   field:"promisedDate",
      //   headerClass:"grid-header",
      //   cellEditorFramework: DatePickerEditorComponent,
      //   editable: editable,
      //   minWidth: 120,
      //   width: 120
      // },
     
       {
        headerName:"Delivery Date",
        field:"dueDate",
        headerClass:"grid-header",
        cellEditorFramework: DatePickerEditorComponent,
        editable: editable,
        minWidth: 100,
        comparator: _self.dateColComparator,
        filter: 'agDateColumnFilter'
      },
      {
        headerName:"",
        field:"specBuyForUserId",
        headerClass:"grid-header",
        hide:true,
        suppressFilter: true
      },
      {
        headerName:"",
        field:"specBuyAccountId",
        headerClass:"grid-header",
        hide:true,
        suppressFilter: true
      },
      {
        headerName:"",
        field:"specBuyReason",
        headerClass:"grid-header",
        hide:true,
        suppressFilter: true
      },
      cellMenuColDefinition(this.prepareCellMenuItems, _self),
      {
        headerName:"Allocated",
        field:"allocatedDisplayId",
        headerClass:"grid-header",
        lockPinned: true,
        editable: false,
        colId: 'allocatedOrAvailable',
        valueGetter: (params) => params.data.allocatedDisplayId || 'Available',
        cellRenderer: _self.AllocatedRenderer,
        cellClass: "text-right",
        minWidth: 150, 
        width: 150,
        pinned:"right",
        filter: 'agSetColumnFilter',
      },
      {
        headerName:"Comments",
        field: 'comments',
        headerClass:"grid-header",
        headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function(params){return _self.commentsRenderer(params, _self)},
        cellStyle: {'text-align':'center'},
        width: 40,
        minWidth: 40,
        maxWidth: 40,
        lockPinned: true,
        pinned: "right",
        suppressFilter: true
      }
    ];

   
   this.partsGrid.api.setColumnDefs(columnDefs);
   
   this.partsGrid.rowHeight = this.rowHeight;
   this.partsGrid.headerHeight = this.headerHeight;
  
  }
  
  floatColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }
  
  dropdownColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    if (!valueA || !valueA.name) return -1;
    return valueA.name.localeCompare(valueB.name)
  }

  AllocatedRenderer(params){
    const allocatedOrAvailable = params.value;
    let div = document.createElement("div");
    if(params.data.allocatedQty && params.data.allocatedQty == params.data.quantity){
      let a = document.createElement("a");
      let soId = params.data.allocatedSalesOrderId;
      let soVersionId = params.data.allocatedSalesOrderVersionId;
      a.href =  'javascript:void(0)';
      a.style.textDecoration = 'underline';
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(`/pages/sales-orders/sales-order-details;soId=${soId};soVersionId=${soVersionId}`, "_blank")
      })
      a.innerText = allocatedOrAvailable;
      div.appendChild(a);
      return div;
    }
    div.innerHTML = allocatedOrAvailable;
    return div;
  }

  dateColComparator(valueA, valueB, nodeA, nodeB, isInverted){
    let a = new Date(valueA);
    if (!a) {
      return 0;
    }
    let b = new Date(valueB);
    return a > b ? 1: -1
  }

  requiredField(params) 
  {
    return params.value ? false: true; 
  }

  SelectCellRenderer(params) {
    if (params.value)
      return params.value.name;
    else return null;
  }

  SelectCellGetter(params) {
    const field = params.colDef.field
    return params.data && params.data[field] ? params.data[field].name : null;
  }

  updateSpecBuyEvent($event){
    if($event) { 
      
        if(this.poId && this.poVersionId){
        this.populateData(null);
      }
    }
  }

  populateGrid(poParts: PurchaseOrderPart[])
  {
    let _self = this;
    let rowData = poParts.map(x => this.createDataRow(x, _self));
    this.rowDataSet = rowData;
    this.partsGrid.api.setRowData(rowData);
    this.partsGrid.api.sizeColumnsToFit();
  }

  createDataRow(poPart: PurchaseOrderPart, _self){
    
    let packaging =  _.find(_self.packagingTypes, (x) => x.id == poPart.packagingId);
    let condition =  _.find(_self.conditionTypes, (x) => x.id == poPart.conditionId);
    var retValue = {
      poLineId:poPart.poLineId,
      lineNo:poPart.lineNo,
      vendorLine:poPart.vendorLine,
      statusId: poPart.statusId,
      manufacturer:poPart.manufacturer,
      quantity:poPart.quantity,
      cost: NumberUtil.formatPrice(poPart.cost),
      dateCode:poPart.dateCode,
      commodity:{id:poPart.commodityName, name:poPart.commodityName},
      packaging:{
        id: packaging ? packaging.id: null,
        name: packaging ? packaging.name: ''
      },
      condition:{
        id: condition ? condition.id: null,
        name: condition ? condition.name: ''
      },
      
      itemId:poPart.itemId,
      dueDate:poPart.dueDate,
      promisedDate:poPart.promisedDate,
      comments: poPart.comments,
      isSpecBuy : poPart.isSpecBuy,
      specBuyForUserId : poPart.specBuyForUserId,
      specBuyForAccountId : poPart.specBuyForAccountId,
      specBuyReason : poPart.specBuyReason,
      partNumber:poPart.partNumber,
      allocatedQty : poPart.allocatedQty,
      allocatedSalesOrderId: poPart.allocatedSalesOrderId,
      allocatedDisplayId: _self.sopoUtilities.DisplayOrderId(poPart.externalId, poPart.allocatedSalesOrderId),
      allocatedSalesOrderVersionId: poPart.allocatedSalesOrderVersionId
    };
    return retValue;
  }

  saveRow(event, _self) {
    let poLineId = event.node.data.poLineId;
    this.isPOLineClicked = false;

    this.partNumber = event.node.data.partNumber;
    this.itemId = event.node.data.itemId;

    if(event.node.data.itemId == 0 || !event.node.data.quantity || !event.node.data.cost || event.node.data.cost == '0.00' || event.node.data.cost == '0')
      {
        this.handleValidationError(event.node.data);
        return;    
      }

    if (!event.node.data.condition)
      event.node.data.condition = {id: null, name: ''}

    let poPart:PurchaseOrderPart;


    poPart={
      poLineId:event.node.data.poLineId,
      lineNo:event.node.data.lineNo,
      vendorLine:event.node.data.vendorLine,
      statusId: event.node.data.statusId,
      quantity: event.node.data.quantity,
      cost: Number(NumberUtil.formatPrice(event.node.data.cost)),
      packagingId:event.node.data.packaging.id,
      conditionId: event.node.data.condition.id,
      promisedDate:event.node.data.promisedDate,
      dateCode:event.node.data.dateCode,
      itemId:event.node.data.itemId,
      dueDate:event.node.data.dueDate,
      partNumber:event.node.data.partNumber
    }
        
    _self.purchaseOrdersService.setPurchaseOrderPart(poPart, poLineId, this.poId, this.poVersionId, event.node.data.isIhs).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
          
          let ln = event.node.data;
          ln.poLineId = data.poLineId;
          ln.lineNo = data.lineNo;
          ln.itemId = data.itemId;
          ln.statusId = data.statusId;
          ln.cost = NumberUtil.formatPrice(data.cost);
          event.node.data.isIhs = false;
          _self.partsGrid.api.refreshRows([event.node]);
          
      },
      error => {
        this.handleAlert(poLineId);
      }
    );
    }

    handleValidationError(data){
      
          let errorText = "";
          if(data.itemId == 0){
            errorText = "Please select an item from the suggested Items";
          }
          else{
            errorText = "Required fields not populated";
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
            let rowIndex =  this.rowDataSet.findIndex(x => x.poLineId == data.poLineId);
            this.startEditingRow(rowIndex); 
          }, (dismiss) => {
            this.populateData(null);
          });
        }

  onAddRow() {

    
    var newItem = this.createDataRow(this.createNewPOPart(), this);
    
    this.rowDataSet.push(newItem);
    this.partsGrid.api.setRowData(this.rowDataSet);
    this.partsGrid.api.paginationGoToLastPage();

    //let rowIndex = this.rowDataSet.length - 1;
   let rowIndex = this.partsGrid.api.getRenderedNodes().filter(x => x.data.poLineId == 0)[0].rowIndex;

      this.startEditingRow(rowIndex);  
      this.setHeightOfGrid(this._rowCount + 1);
      this.isPOLineClicked = false;
  }

  triggerSave(){
    this.partsGrid.api.stopEditing();
  }

  createNewPOPart()
  {
        let poPart = new PurchaseOrderPart();  
        //set default values for the drop downs
        poPart.packagingId = this.packagingTypes[0].id;
        poPart.conditionId = this.conditionTypes[0].id;
        poPart.itemId = 0;
        poPart.lineNo = 0;
        poPart.poLineId = 0;
        poPart.comments = 0;
        poPart.commodityName=this.commodities[0].name;
        poPart.quantity = 0;
        return poPart;
  }

  startEditingRow(rowIndex)
  {
    this.isPOLineClicked = false;
    this.partsGrid.api.setFocusedCell(rowIndex, 'vendorLine');
    
    this.partsGrid.api.startEditingCell({
        rowIndex: rowIndex,
        colKey: 'vendorLine',
        keyPress: null,
        //charPress: '0'
    });
  }

  refreshGrid(){
    console.log("refresh purchase-orders-parts")

    this.populateData(null);
  }

  deleteRows() {
    let rows = this.partsGrid.api.getSelectedRows();
    let poLinesToDelete = rows.map(x => x.poLineId);
    const _self = this;
    swal({
      title: "Delete Rows",
      text: "Are you sure you want to delete selected parts?",
      type: "warning",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((value) => {
      _self.purchaseOrdersService.deletePurchaseOrderParts(poLinesToDelete)
        .takeUntil(_self.ngUnsubscribe.asObservable())
        .subscribe(success => {
          if (success) {
            poLinesToDelete.forEach(itemToDelete => {
              let indexOfItem = _self.rowDataSet.findIndex(x => x.poLineId == itemToDelete);
              _self.rowDataSet.splice(indexOfItem, 1);
            });
          };
          _self.partsGrid.api.setRowData(_self.rowDataSet);
        }, error => {
          _self.handleAlert(-1);
        });
    }, (dismiss) => {
      return;
    }).catch(swal.noop);

  }

  handleAlert(poLineId) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        let rowIndex =  this.rowDataSet.findIndex(x => x.poLineId == poLineId);
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.populateData(null)
      }
    });
  }

  qtyChanged(poLineId : number){

      if(this.poId && this.poVersionId){
        this.populateData(() => this.selectRow(this.partsGrid,poLineId) );
      }
     
  }

  onCellClicked(e){
    this.onRowSelection(e.node);
  }

  getSpecBuyDetails(params){
    const regex = /[^0-9]/g;
    this.specBuyData = {
      userId : params.data.specBuyForUserId,
      accountId : params.data.specBuyForAccountId,
      specReason : params.data.specBuyReason
    };
    this.poPartForUpdate = {
     vendorLine:params.data.vendorLine,
     statusId: params.data.statusId,
     quantity:parseInt(String(params.data.quantity).replace(regex, '')),
     cost:params.data.cost ,
     dateCode:params.data.dateCode,
     packagingId: params.data.packaging.id,              
     conditionId: params.data.condition.Id,
     dueDate:params.data.dueDate,
     promisedDate:params.data.promisedDate,
    }
  }
  updateSpecBuy(params){
    const regex = /[^0-9]/g;
    if(params.data.isSpecBuy){
      let poPart:PurchaseOrderPart;
      poPart = {
        poLineId:params.data.poLineId,
        vendorLine:params.data.vendorLine,
        statusId:  params.data.statusId,
        quantity:parseInt(String(params.data.quantity).replace(regex, '')),
        cost:params.data.cost ,
        dateCode:params.data.dateCode,
        packagingId: params.data.packaging.id,   
        conditionId: params.data.condition.id,           
        dueDate:params.data.dueDate,
        promisedDate:params.data.promisedDate,
        itemId:this.itemId,
        isSpecBuy : false,
        specBuyForUserId : params.data.specBuyForUserId,
        specBuyForAccountId : params.data.specBuyForUserId,
        specBuyReason: params.data.specBuyReason,
        partNumber : params.data.partNumber
      };
      this.purchaseOrdersService.setPurchaseOrderPart(poPart ,this.poLineId, this.poId, this.poVersionId, params.data.isIhs).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe( data => {
        this.populateData(null);
        this.updatePOLineOnGridRow(poPart);
       });
    }
   
    this.partNumber = params.data.partNumber;
    this.itemId = params.data.itemId;
    this.specBuyChecked = false;
     this.isPOLineClicked = true;
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
      _self.clickedPOLineId = params.data.poLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#po-part-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1){
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      _self.hoverObjectId = params.data.poLineId;
      jQuery('#po-part-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#po-part-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#po-part-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#po-part-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function(){
      jQuery('#po-part-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function(){
      _self.clickedPOLineId = params.data.poLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#po-part-comment-modal").modal('toggle');
    });
    return div;
  }

  commentCountIncrement(){
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}
  resetGridColumns_Click() {
    //reset grid column widths
    this.partsGrid.api.sizeColumnsToFit();
    
    //reset sort/filter/columns using original
    this.partsGrid.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.partsGrid.api.setSortModel(this.defaultGridSettings.SortDef);
    this.partsGrid.api.setFilterModel(this.defaultGridSettings.FilterDef); 
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
    //Set default values before loading a new state
   this.defaultGridSettings.ColumnDef = this.partsGrid.columnApi.getColumnState();
   this.defaultGridSettings.SortDef = this.partsGrid.api.getSortModel();
   this.defaultGridSettings.FilterDef = this.partsGrid.api.getFilterModel();

   //Call load grid state API
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null)
          this.partsGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null)
          this.partsGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null)
          this.partsGrid.api.setFilterModel(JSON.parse(data.FilterDef));
    })
  }

  exportGrid_Click(event) {
   var senderEl = event.currentTarget;
   this.agGridSettings.parseGridData(this.partsGrid, this.gridName);
         //Alert Animation
         var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
         jQuery(alertEl).fadeIn("slow");
         jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
           // Animation complete.
          });
  }
  // exportGrid_Click(event) {
  //   let url = 'api/purchase-order/getPurchaseOrderExportLines?poId=' + this.poId + '&poVersionId=' + this.poVersionId
  //   var senderEl = event.currentTarget;

  //   //Button disabled/text change
  //   jQuery(senderEl).attr('disabled','')
  //   jQuery(senderEl).find('span').text('Exporting...');

  //   this.agGridSettings.GetGridExport(url).subscribe(
  //     data => {
  //       if (data.success) {
  //         //Button enabled/text change
  //        jQuery(senderEl).removeAttr('disabled');
  //        jQuery(senderEl).find('span').text('Export');
  //        //Alert Animation
  //        var alertEl = jQuery(senderEl).parent('.ag-grid-sort').find('.grid-Download');
  //        jQuery(alertEl).fadeIn("slow");
  //        jQuery(alertEl).delay(5000).fadeOut( "slow", function() {
  //          // Animation complete.
  //        });
  //       }
  //     })
  // }

  onPOLineCommentSaved(){
    this.purchaseOrdersService.partCommentIncrement();
  }
  
  selectRow(gridOptions: GridOptions , poLineId : number) {
    gridOptions.api.forEachNode(node => {
		 if(parseInt(String(node.data.poLineId)) == poLineId ){
        this.onRowSelection(node);     
     }
		});
  }
  
  onRowSelection(node : RowNode){
    const regex = /[^0-9]/g;
    let allRowElements2 = jQuery("#partsGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#partsGrid").find(`[row=${node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = node;
    this.poLineId = this._selectedRowNode.data.poLineId;
    this.partNumber = this._selectedRowNode.data.partNumber;
    this.itemId = node.data.itemId;
    this.selectedCost = this._selectedRowNode.data.cost;
    this.selectedLineNum = this._selectedRowNode.data.lineNo;

    let poLineQty = parseInt(String(node.data.quantity).replace(regex, '')) 
    poLineQty = poLineQty ? poLineQty : 0;
    let allocatedQty =  parseInt(String(node.data.allocatedQty).replace(regex, '')) 
    allocatedQty = allocatedQty ? allocatedQty : 0;

    this.poLineAvailableQty = poLineQty;
    this.specBuyChecked = (node.data.isSpecBuy != null ? node.data.isSpecBuy : false); 
    if(this.specBuyChecked) {
      this.isPOLineClicked = false;
      this.getSpecBuyDetails(node);
      jQuery('az-purchase-orders-parts .ag-grid-sort').css('top','48.3%;');
    }
    else {
      this.isPOLineClicked = true;
    }
    //Move export functions
    jQuery('az-purchase-orders-parts .ag-grid-sort').css('top','72.3%');
  }

  private currentRefreshMenuCallback;
  prepareCellMenuItems(params: ICellMenuParams,_self: any): ICellMenuItem[] {
    let data = params.node.data;
    let menuItems: ICellMenuItem[] = [
      {
        icon: 'fas fa-copy',
        name: 'Copy',
        action: null
      },
      {
        icon: ( data.isSpecBuy ? 'far fa-check-square' : 'far fa-square'),
        name: 'Spec Buy',
        action: (_self, params,refreshCallback) => {
            _self.onSpecBuyChange(_self, params, refreshCallback);
            _self.currentRefreshMenuCallback = (isSpecBuy: boolean) => {
              params.data.isSpecBuy = isSpecBuy;
              refreshCallback({icon: isSpecBuy ? 'far fa-check-square':'far fa-square', name: 'Spec Buy', action: null});
            }
        },
      }];

    return menuItems;
  }
  
  onSpecBuyChange(_self:any , params: ICellMenuParams) {
    if (_self.poLineId > 0) {
        if (!params.data.isSpecBuy) {
            _self.specBuyChecked = true;
            _self.specBuyData = {
                userId: params.data.specBuyForUserId,
                accountId: params.data.specBuyForAccountId,
                specReason: params.data.specBuyReason
            };
            _self.poPartForUpdate = {
                vendorLine: params.data.vendorLine,
                statusId: params.data.statusId,
                quantity: params.data.quantity,
                cost: params.data.cost,
                dateCode: params.data.dateCode,
                packagingId: params.data.packaging.id,
                conditionId: params.data.condition.id,
                dueDate: params.data.dueDate,
                promisedDate: params.data.promisedDate,
            }
            _self.isPOLineClicked = false;
        } else {
            _self.specBuyChecked = false;
            _self.isPOLineClicked = true;
            _self.updateSpecBuy(params);
        }
    }
  }

  updatePOLineOnGridRow(poLine){
    if(this.currentRefreshMenuCallback){
      this.currentRefreshMenuCallback(poLine.isSpecBuy);
    }
  }

}
