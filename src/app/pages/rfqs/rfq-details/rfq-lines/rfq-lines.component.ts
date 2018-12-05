import { Component, OnInit, Input, Output, SimpleChange, OnDestroy, EventEmitter, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {RfqsService} from './../../../../_services/rfqs.service';
import { Subject } from 'rxjs/Subject';
import { GridOptions } from "ag-grid";
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { ItemCommodity } from './../../../../_models/Items/itemCommodity';
import { PackagingType  } from './../../../../_models/shared/packagingType';
import {SelectEditorComponent} from '../../../_sharedComponent/select-editor/select-editor.component';
import { RfqLine } from './../../../../_models/rfqs/RfqLine';
import { Observable } from 'rxjs/Observable';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { NotificationsService } from 'angular2-notifications';
import { default as swal } from 'sweetalert2';
import { NumericInputComponent } from './../../../_sharedComponent/numeric-input/numeric-input.component';
import { Currency } from '../../../../_models/shared/currency';
import { GridSettings } from './../../../../_models/common/GridSettings';;
import { CurrencyPipe } from '@angular/common';
import { ColumnFilterComponent } from './../../../_sharedComponent/column-filter/column-filter.component';
import { ItemTypeaheadGridComponent } from './../../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { MfrInputComponent } from './../../../_sharedComponent/mfr-input/mfr-input.component';
import { ComoditySelectComponent } from './../../../_sharedComponent/comodity-select/comodity-select.component';
import { debug } from 'util';
import { Manufacturer } from '../../../../_models/Items/manufacturer';

@Component({
  selector: 'az-rfq-lines',
  templateUrl: './rfq-lines.component.html',
  styleUrls: ['./rfq-lines.component.scss'],
  providers: [AGGridSettingsService]
})
export class RfqLinesComponent implements OnInit, OnDestroy,AfterViewInit {


  @Input() rfqId;
  @Input() currencyId;
  @Output() onRfqLineIdChanged = new EventEmitter<any>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private rfqLinesGrid: GridOptions;
  private rowLimit: number = 25;
  private commodityList: ItemCommodity[];
  private packagingTypes: PackagingType[];
  private rowData: any[];
  private addingNewRow : boolean;
  private gridName = 'rfq-lines';
  private defaultGridSettings: GridSettings;
  private rowHeight= 35;
  private headerHeight= 30;

  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  }

  constructor(
    private rfqsService: RfqsService, 
    private router:Router,
    private agGridSettings: AGGridSettingsService, 
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService,
    private notificationService: NotificationsService) {
    this.defaultGridSettings = new GridSettings();
    let _self = this;
    this.rfqLinesGrid = {
      animateRows:true,
      enableColResize: true,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true},
      enableServerSideFilter: true,
      suppressContextMenu:true,
      suppressRowClickSelection: true,
      pagination: true,
      enableSorting: true,
      paginationPageSize:25,
      rowSelection: 'multiple',
      rowHeight:35,
      editType: 'fullRow',
      onRowEditingStopped: function(event){_self.saveRow(event)},
      context : {
           parentComponent: this
       },
      };
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    jQuery(".vendorPartsGrid .quotePartsButton").appendTo(".vendorPartsGrid .ag-paging-panel");
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange })
  {
    let rfqIdProp = changes['rfqId'];
    if(rfqIdProp && rfqIdProp.currentValue) {
      this.populateData();
    }
    let currencyIdProp = changes['currencyId'];
    if (currencyIdProp && currencyIdProp.currentValue) {
      this.currencyId = '(' + currencyIdProp.currentValue + ')';
    }
  }

populateData(){
  this.rfqsService.getRfqLinesForDetailsGrid(this.rfqId , null ).subscribe(
    data => {
      const permissions = this.ngxPermissionsService.getPermissions();
      let editable = false;
      console.log('edit permissions', permissions);
      if (permissions['CanEditLines27']) {
        editable = true;
      }
      let rfqLines = data[0].rfqLines;
      this.commodityList = data[1].results;
      this.packagingTypes = data[2];
      this.createColumns(editable);
      this.populateGrid(rfqLines);
    }
  );
}

triggerSave(){
  this.rfqLinesGrid.api.stopEditing();
}

populateGrid(rfqLines){
  this.rowData = rfqLines.map(rfqLine =>{ return this.createDataRow(rfqLine) });
  if (this.rfqLinesGrid.api){
    this.rfqLinesGrid.api.setRowData(this.rowData);
    this.loadGridState();
    this.rfqLinesGrid.api.sizeColumnsToFit();
  }
}

refreshGrid(){
  console.log("refresh rfq-lines")

  this.populateData();
}

createColumns(editable){
  var _self = this;  

  const columnDef = [
        {
          headerName:"",
          headerClass:"grid-header",
          checkboxSelection: true,
          width: 30,
          minWidth: 30,
          maxWidth: 30,
          suppressSorting: true,
          lockPinned: true,
          pinned: "left"
        },  
        {
          headerName:"Ln",
          field:"lineNum",
          headerClass:"grid-header",
          width:60,
          suppressFilter: true
        },
        {
          headerName:"Part Number",
          field:"partNumber",
          headerClass:"grid-header",
          width:100,
          editable: editable,
          filterFramework: ColumnFilterComponent,
          cellClassRules: {'required': this.requiredField},
          cellRenderer: function (params) {
            if(!params.data.itemId){
              return params.data.partNumber;
            }else{
            return _self.PartNumberCellRenderer(params, _self);
            }
          },
          cellEditorParams: {
            values: {parentClassName : ".partsContainer"}
          },
          suppressMovable: true,
          lockPinned: true,
          cellEditorFramework: ItemTypeaheadGridComponent,
        },
        {
          headerName:"Manufacturer",
          field:"manufacturer",
          headerClass:"grid-header",
          width:90,
          editable: editable,
          lockPinned: true,
          valueGetter: function(params){  
            return params.data.manufacturer;
          },
          cellEditorFramework:MfrInputComponent,
          filterFramework: ColumnFilterComponent,
        },
        {
          headerName:"Commodity",
          field:"commodity",
          headerClass:"grid-header",
          width:150,
          editable: editable,
          cellRenderer: this.SelectCellRenderer,
          cellEditorFramework: ComoditySelectComponent,
          cellEditorParams: {
            values:_self.commodityList.map(x => { return {id:x.CommodityID, name:x.CommodityName} })
          },
          comparator: _self.dropdownColComparator,
          filterFramework: ColumnFilterComponent
       },
        {
          headerName:"Quantity",
          field:"qty",
          headerClass:"grid-header",
          width:50,
          suppressMovable: true,
          lockPinned: true,
          suppressFilter: true,
          editable: editable,
          cellStyle: {'text-align':'right'},
          cellClassRules: {'required': this.requiredField},
          cellEditorParams: { integerOnly: true },
          cellEditorFramework: NumericInputComponent,
          cellRenderer: this.numericCellRenderer,
       },
        {
          headerName:"Target " + _self.currencyId,
          field:"targetCost",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellStyle: {'text-align':'right'},
          cellEditorFramework: NumericInputComponent,
          cellRenderer: this.numericCellRenderer,
        },
        {
          headerName:"Req DC",
          field:"dateCode",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          suppressFilter: true
        },
        {
          headerName:"Packaging",
          field:"packaging",
          headerClass:"grid-header",
          width:70,
          editable: editable,
          cellRenderer: this.SelectCellRenderer,
          cellEditorFramework: SelectEditorComponent,
          cellEditorParams: {
            values:_self.packagingTypes.map(x => { return {id:x.id, name:x.name} })
          },
          comparator: _self.dropdownColComparator,
        },
        {
          headerName:"Note",
          field:"note",
          headerClass:"grid-header",
          width:130,
          editable: editable,
        },
        {
          headerName:"Response Qty",
          field:"sourcesTotalQty",
          headerClass:"grid-header",
          cellStyle: {'text-align':'right'},
          width:70,
          cellRenderer: function (params) {
            if (params.data.hasNoStock == 1)
              return 'No Stock';
            return params.data.sourcesTotalQty?  params.data.sourcesTotalQty.toLocaleString(): params.data.sourcesTotalQty;
          },
        },
        {
          headerName: "",
          field: "",
          headerClass: "grid-header",
          cellRenderer: function (params) {
            return _self.editClick(_self, params);
          },
          width: 70,
          lockPinned: true,
          pinned: "right"
        }
      ];
      this.rfqLinesGrid.columnDefs = columnDef;
      if (this.rfqLinesGrid.api){
        this.rfqLinesGrid.api.setColumnDefs(columnDef);
        this.rfqLinesGrid.rowHeight = this.rowHeight;
        this.rfqLinesGrid.headerHeight = this.headerHeight;
      }
    }
    
    SelectCellRenderer(params) {
      if(typeof params.value !== 'undefined')
        return params.value.name;
    }

    dropdownColComparator(valueA, valueB, nodeA, nodeB, isInverted){
      if (!valueA || !valueA.name) return -1;
      return valueA.name.localeCompare(valueB.name)
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
      if (params.value) {
        var val = params.value.toString();
        var decimalIndex = val.indexOf('.') != -1? val.indexOf('.'): 0;
        var decimalArg = decimalIndex > 0? val.substring(decimalIndex, val.length).length - 1: 0;
        return parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: decimalArg});
      }
      else
        return '0';
    }

    editClick(_self, params) {
      let rfqlineId = params.data.rfqLineId;
      let rqfPartNumber = params.data.partNumber;
      let rfqManufacturer = params.data.manufacturer;
      let rfqItemId = params.data.itemId;

      let btn = document.createElement('button');
      btn.style.width = '95%';
      btn.style.height = '25px';
      btn.style.fontSize = '9pt';
      let span = document.createElement('span');
      span.textContent = 'Responses'
      btn.appendChild(span);

      if (params.data.sourcesTotalQty > 0)
        btn.className = 'btn-details btn-affirm';

      else
        btn.className = 'btn-none'

      btn.addEventListener("click", function () {

        _self.rfqLineId = rfqlineId;

       _self.onRfqLineIdChanged.emit({
          rfqLineId: rfqlineId,
          partNumber: rqfPartNumber,
          manufacturer: rfqManufacturer,
          itemId: rfqItemId
        });
       //_self.onRfqLineIdChanged.emit(rfqlineId);
      })
      return btn;
  }
  requiredField(params) 
  {
    return params.value ? false: true; 
  }

  createDataRow(rfqLine: RfqLine){
    return {
              rfqLineId: rfqLine.rfqLineId,
              lineNum: rfqLine.lineNum,
              partNumber: rfqLine.partNumber,
              itemId: rfqLine.itemId,
              manufacturer: rfqLine.manufacturer,
              commodity: { id:rfqLine.commodityId, name:rfqLine.commodityName },
              qty:rfqLine.qty,
              targetCost:rfqLine.targetCost,
              dateCode:rfqLine.dateCode,
              packaging:{ id:rfqLine.packagingId, name:rfqLine.packagingName },
              note:rfqLine.note,
              sourcesTotalQty:rfqLine.sourcesTotalQty,
              partNumberStrip: rfqLine.partNumberStrip,
              hasNoStock:rfqLine.hasNoStock,
              isIhs: rfqLine.isIhs
    }
  }

  saveRow(event) {
     let rfqLineId = event.node.data.rfqLineId;
     if(this.returnFirstInvalidGridColumn(event.node.data)) { 
            this.handleValidationError(event.node.data);
           //this.handleAlert(rfqLineId);
            return;
          }
         
        let nodeData = event.node.data;
        this.rfqsService.setrfqLine(nodeData.rfqLineId, nodeData.partNumber, nodeData.itemId, nodeData.manufacturer, nodeData.commodity.id,
        nodeData.qty, nodeData.targetCost,nodeData.dateCode, nodeData.packaging.id, nodeData.note, nodeData.isIhs, this.rfqId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
          rfqLine => {
            
            //Update soLineId and lineNo for new row
            if(event.node.data.rfqLineId === 0)
            {
              let index = this.rowData.findIndex(function(x){return x.rfqLineId === 0});
              let newRow = this.createDataRow(rfqLine);
              this.rowData[index] = newRow;
              event.node.data = newRow;
            }
            this.rfqLinesGrid.api.refreshRows([event.node]);

          },
          error => {
            this.handleAlert(rfqLineId);
          }
        );;
        
  }

  returnFirstInvalidGridColumn(rowData) {
    if ((!rowData.partNumber) || (!(rowData.partNumber.length > 0)))
      return "partNumber";

    else if (!(rowData.manufacturer))
      return 'manufacturer';

    else if (!(rowData.qty > 0) || (rowData.qty == ''))
      return 'qty';

    else
      return
  }

  handleValidationError(data){
    let errorText = "Required fields not populated";
    let errorCol = this.returnFirstInvalidGridColumn(data);

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
      this.startEditingRfqLine(data.rfqLineId, errorCol)    
    }, (dismiss) => {
      this.populateData();
    });
  }


  startEditingRfqLine(rfqLineId, errorCol?) {
    let rowIndex = this.rowData.findIndex(x => x.rfqLineId == rfqLineId);
    if (rowIndex >= 0) {
      this.startEditingRow(rowIndex, errorCol);
    }
  }

  onAddRow(){
    
    let _self = this;
    this.rfqLinesGrid.api.paginationGoToLastPage();
    var newItem = this.createDataRow(this.createNewSRfqLine());
    this.rowData.push(newItem);
    this.rfqLinesGrid.api.setRowData(this.rowData);
    let rowIndex = this.rowData.length - 1;
    this.startEditingRow(rowIndex);

  }

   startEditingRow(rowIndex, errorCol?){
    let focusColumn = "partNumber";

    //Set default column if there isnt any
    if (errorCol)
        focusColumn = errorCol;

    //Focus on ag-grid standard cells
    this.rfqLinesGrid.api.setFocusedCell(rowIndex, focusColumn);
    this.rfqLinesGrid.api.startEditingCell({
        rowIndex: rowIndex,
        colKey: focusColumn,
        keyPress: null,
        charPress: '' //charPress: '0'
    });

    //focus on required field
    jQuery('.required input')[0].select(); //Selecting element that is red (required class)
  }


  createNewSRfqLine(){
    let rfqLine = new RfqLine();
    
    //set default values for the drop downs
    
    rfqLine.rfqLineId = 0;
    rfqLine.packagingId = this.packagingTypes[0].id;
    rfqLine.commodityId = this.commodityList[0].CommodityID;
    rfqLine.manufacturer = '',
    rfqLine.partNumber = ''
    rfqLine.itemId = 0;
    rfqLine.sourcesTotalQty = 0;
    return rfqLine;
  }

  deleteRows(){
    let rows = this.rfqLinesGrid.api.getSelectedRows();
    if (rows.length == 0){
      this.notificationService.alert('Please select one or more rfq lines');
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
      let rfqLinesToDelete = rows.map(x => x.rfqLineId);
      let _self = this;
      this.rfqsService.deleteRfqLines(rfqLinesToDelete).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
        data => {
          _self.populateData();
        },
        error => {
          _self.handleAlert(-1);
        }
      );
    }).catch(swal.noop);  //prevent "cancel" exception thrown
  }

  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }

  handleAlert(rfqLineId) {
    this.errorManagementService.getApiError().subscribe((dismiss)=>{
      if (!dismiss) {
        let rowIndex =  this.rowData.findIndex(x => x.rfqLineId == rfqLineId);
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex); 
        }
      } else {
        this.populateData()
      }
    });
  }
  
  createObservable(): Observable<boolean>
  {
      return Observable.of(true).delay(1);
  }

  resetGridColumns_Click() {
    //reset sort/filter/columns using original
    this.rfqLinesGrid.columnApi.setColumnState(this.defaultGridSettings.ColumnDef);
    this.rfqLinesGrid.api.setSortModel(this.defaultGridSettings.SortDef);
    this.rfqLinesGrid.api.setFilterModel(this.defaultGridSettings.FilterDef);

    //reset grid column widths
    this.rfqLinesGrid.api.sizeColumnsToFit();


  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.rfqLinesGrid).subscribe(
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
    this.defaultGridSettings.ColumnDef = this.rfqLinesGrid.columnApi.getColumnState();
    this.defaultGridSettings.SortDef = this.rfqLinesGrid.api.getSortModel();
    this.defaultGridSettings.FilterDef = this.rfqLinesGrid.api.getFilterModel();

    //Call load grid state API
    var _self = this;
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        //must be in try, grid state load succeeds but always throws a JS error (could be due to the grid being double loaded)
        try {
          if (data.ColumnDef != null)
            _self.rfqLinesGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

          if (data.SortDef != null)
            _self.rfqLinesGrid.api.setSortModel(JSON.parse(data.SortDef));

          if (data.FilterDef != null && this.rfqLinesGrid.api)
            _self.rfqLinesGrid.api.setFilterModel(JSON.parse(data.FilterDef));
        }
        catch (e) {
          console.log('grid state loaded in try/catch');
        }
    })
  }

  exportGrid_Click(event) {
    let url ='api/rfqs/getRfqLinesExport?rfqId='+ this.rfqId + '&statusId=0';
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
}
