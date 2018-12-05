import { Component, OnInit, Input, Output, OnChanges, EventEmitter, SimpleChange, OnDestroy, AfterViewInit } from '@angular/core';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { SharedService } from './../../../../_services/shared.service';
import { InspectionService } from './../../../../_services/inspection.service';
import { ItemBreakdown, BreakdownLine } from './../../../../_models/quality-control/inspection/itemBreakdown';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { NumericInputComponent } from './../../../_sharedComponent/numeric-input/numeric-input.component';
import { InputComService } from './../../../../_coms/input-com.service';
import { default as swal } from 'sweetalert2';
import { Subject } from 'rxjs/Subject';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { NotificationsService } from 'angular2-notifications';

import { GridOptions, defaultGroupComparator } from "ag-grid";
import * as _ from 'lodash';
import { ENGINE_METHOD_DIGESTS } from 'constants';
import { element } from 'protractor';

@Component({
  selector: 'az-item-breakdown',
  templateUrl: './item-breakdown.component.html',
  styleUrls: ['./item-breakdown.component.scss'],
  providers: [AGGridSettingsService, InputComService]
})
export class ItemBreakdownComponent implements OnInit, OnDestroy {
  private stockBreakdownList: ItemBreakdown[] = new Array<ItemBreakdown>();
  private selectedList: ItemBreakdown = new ItemBreakdown();
  private warehouses: any[] = new Array;
  private warehouseBins: any[] = new Array;
  private packagingTypes: any[] = new Array;
  private conditionTypes: any[] = new Array;
  private countryList: any[] = new Array
  private rowHeight = 30;
  private insComplete: boolean;
  public formIsNotValid: boolean;
  private headerHeight = 30;
  private breakdownGrid: GridOptions;
  private isCreatingNewStock = -1;
  private rowDataSet: any[];
  private selectedRowCount: number = 0;
  private discrepantList: any[] = [{ id: true, name: 'Discrepant' }, { id: false, name: 'Conforming' }];
  @Input() inspectionId: number;
  @Input() insIsComplete: boolean;
  @Output() qtyPassed = new EventEmitter<number>();
  @Output() qtyAccepted = new EventEmitter<number>();
  @Output() qtyRejected = new EventEmitter<number>();
  @Output() warehouseBinId = new EventEmitter<number>();
  @Output() stockDetails = new EventEmitter<any>();
  @Output() itemBreakdownComponent = new EventEmitter<any>();
  public breakdownNotifyOptions = {
    position: ['top', 'right'],
    timeOut: 1000,
    pauseOnHover: true,
    lastOnBottom: true,
    //clickToClose: true
  }
  private ngUnsubscribe: Subject<void> = new Subject<void>()
  constructor(
    private sharedService: SharedService,
    private inspectionService: InspectionService,
    private agGridSettings: AGGridSettingsService,
    private errorManagementService: ErrorManagementService,
    private _notificationsService: NotificationsService
  ) {
    this.initializeGrid();
    this.inspectionService.getInspectionRelatedData()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.warehouses = data[0];
        this.packagingTypes = data[1];
        this.conditionTypes = data[2];
        this.countryList = data[3];
        this.getStockBreakdownlist();
        this.runValidation(this.selectedList);
        this.emitWarehouseBin();
      })
  }

  initializeGrid(){
    var _self = this;
    this.breakdownGrid = {
      animateRows: true,
      enableGroupEdit: true,
      onRowEditingStopped: function (event) { _self.saveRow(event, _self) },
      onRowEditingStarted: function (event) { _self.setLineEditingMode(event, _self) },
      suppressRowClickSelection: true,
      enableColResize: true,
      editType: 'fullRow',
      suppressContextMenu: true,
      pagination: true,
      paginationPageSize: 25,
      toolPanelSuppressSideButtons: true,
      defaultColDef: {
        suppressMenu: true
      },
      onSelectionChanged: function (event) { _self.onSelectionChanged(event, _self) },
      enableSorting: true,
      suppressDragLeaveHidesColumns: true,
      rowSelection: 'multiple',
      onViewportChanged: function () {
        _self.breakdownGrid.api.sizeColumnsToFit();
      },
      rowHeight: _self.rowHeight,
      headerHeight: _self.headerHeight,
    };

  }

  handleValidationError(data) {
    let errorText = "";
    let colName = '';
    if (!data.dateCode) {
      errorText = 'Missing datecode!'
      colName = 'dateCode';
    }

    if (!data.expirationDate) {
      errorText = 'Missing expiration date!'
      colName = 'expirationDate';
    }

    if (!(data.numPacks > 0)) {
      errorText = 'Invalid number of packages!'
      colName = 'numPacks';
    }
    if (!(data.packQty > 0)) {
      errorText = 'Invalid quantity per package!';
      colName = 'packQty';
    }

    swal({
      title: "Validation Error",
      text: errorText,
      type: "error",
      confirmButtonText: "Edit",
      cancelButtonText: "Cancel Changes",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((value) => {
      this.startEditingBreakdownLine(data.breakdownId, colName)
    }, (dismiss) => {
      this.populateGrid(this.selectedList.itemStockBreakdownList);
    });
  }
  startEditingBreakdownLine(breakdownId, colName = '') {
    let rowIndex = this.rowDataSet.findIndex(x => x.breakdownId == breakdownId);
    if (rowIndex >= 0) {
      this.startEditingRow(rowIndex, colName);
    }
  }
  startEditingRow(rowIndex, colName = '') {
    var columnFocus = 'packQty';
    this.breakdownGrid.api.setFocusedCell(rowIndex, 'customerLineNo');
    if (colName)
      columnFocus = colName;

    this.breakdownGrid.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: columnFocus,
      keyPress: null,
    });
  }

  setLineEditingMode(event, _self) {
    var listIndex = this.selectedList.index;
    this.stockBreakdownList[listIndex].isLineEditingMode = true;

  }
  onAddRow() {
    this.runValidation(this.selectedList);
    if (!this.formIsNotValid) {
      var newItem = this.createRow(this.createNewBreakline());
      this.rowDataSet.push(newItem);
      this.breakdownGrid.api.setRowData(this.rowDataSet);
      let rowIndex = this.rowDataSet.length - 1;
      this.breakdownGrid.api.hideOverlay();
      this.startEditingRow(rowIndex);
    } else {
      swal({
        title: "Validation Error",
        text: "Please complete all required fields before adding an item breakdown line.",
        type: "error",
        confirmButtonText: "OK",
        allowOutsideClick: false
      });
    }
  }

  runValidation(itemStock) {
    this.formIsNotValid = false;
    if (itemStock.countryId == null || itemStock.packagingTypeId == null || itemStock.conditionId == null || itemStock.expirationDate == "" || !itemStock.dateCode) {
      this.formIsNotValid = true;
    } else {
      this.formIsNotValid = false;
    }
  }

  createNewBreakline() {
    let line = new BreakdownLine();
    let rowTemplate = this.selectedList;
    line.breakdownId = 0;
    line.conditionId = rowTemplate.conditionId;
    line.countryId = rowTemplate.countryId;
    line.dateCode = rowTemplate.dateCode;
    line.mfrLotNum = rowTemplate.mfrLotNum;
    line.expirationDate = rowTemplate.expirationDate;
    line.isDiscrepant = rowTemplate.isRejected ? true : false;
    line.numPacks = 0;
    line.packagingId = rowTemplate.packagingTypeId;
    line.packQty = 0;// rowTemplate.packQty;
    line.stockId = rowTemplate.itemStockId
    return line;
  }

  onRowsDelete() {
    var _self = this
    swal({
      title: 'Are you sure you want to delete ' + _self.selectedRowCount + ' selected lines?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then(function () {
      _self.deleteSelectedRows();
    }, function () {

    });
  }

  onSelectionChanged(event, self) {
    var selectedRows = self.breakdownGrid.api.getSelectedRows();
    if (selectedRows) {
      self.selectedRowCount = selectedRows.length
    }
  }

  deleteSelectedRows() {
    var _self = this;
    let rows = this.breakdownGrid.api.getSelectedRows();
    rows.forEach(r => {
      this.inspectionService.setBreakdownLine(this.createDbRow(r), r.breakdownId, true).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
        data => {
          if (data) {
            let indexOfItem = _self.rowDataSet.findIndex(x => x.breakdownId == r.breakdownId);
            let indexOfStock = _self.selectedList.index;
            //remove row from row data set
            _self.rowDataSet.splice(indexOfItem, 1);

            //apply revised data set to breakdownlist
            _self.stockBreakdownList[indexOfStock].itemStockBreakdownList = _.map(_self.rowDataSet, breakdownLine => _self.createDbRow(breakdownLine));

            //set new row data
            _self.breakdownGrid.api.setRowData(_self.rowDataSet);

            //update total Qty of stocks
            var newLineQty = _self.calculateBreakdownQty(r);
            _self.stockBreakdownList[indexOfStock].quantity -= newLineQty

            //Update totals
            _self.emitBreakdownSummary()

          }
        }
      );

    })
  }

  createDbRow(data) {
    
    let breakdownLine: BreakdownLine;
    breakdownLine = {
      breakdownId: data.breakdownId,
      stockId: data.stockId,
      isDiscrepant: data.discrepant.id,
      packQty: data.packQty,
      numPacks: data.numPacks,
      dateCode: data.dateCode,
      countryId: data.coo.id,
      conditionId: data.condition.id,
      packagingId: data.packaging.id,
      mfrLotNum: data.mfrLotNum,
      expirationDate: data.expirationDate
    }
    return breakdownLine;
  }

  saveRow(event, _self) {
    var data = event.node.data;
    _self.saveRowData(data);
  }

  saveRowData(rowData) {
    let breakdownId = rowData.breakdownId;
    if (!rowData.dateCode || !rowData.expirationDate
      || !rowData.numPacks || (!(rowData.packQty > 0))) {
      this.handleValidationError(rowData);
      return;
    }
    let newRow = this.createDbRow(rowData);
    this.inspectionService.setBreakdownLine(newRow, breakdownId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if (data) {
          var newBreakdownId = data;
          var newLineQty = this.calculateBreakdownQty(rowData);
          var oldLineQty = rowData.qty ? rowData.qty : 0;
          var listIndex = this.selectedList.index
          var lineIndex = 0;
          if (newRow.breakdownId == 0) {
            newRow.breakdownId = newBreakdownId;
            this.stockBreakdownList[listIndex].itemStockBreakdownList.push(newRow);
            this.stockBreakdownList[listIndex].isLineEditingMode = false;
          } else {
            lineIndex = this.stockBreakdownList[listIndex].itemStockBreakdownList.findIndex(x => x.breakdownId == newBreakdownId);
          }

          //set breakdownID of new stock created to current row
          rowData.breakdownId = data;

          //update line qty
          rowData.qty = newLineQty;

          //refresh grid
          this.breakdownGrid.api.setRowData(this.rowDataSet);

          //update breakdownlines list
          if (breakdownId)
            this.stockBreakdownList[listIndex].itemStockBreakdownList[lineIndex] = newRow;

          //update total Qty of breakdown
          this.stockBreakdownList[listIndex].quantity += (newLineQty - oldLineQty);
          this.emitBreakdownSummary();
        }

      },
      error => {
        this.handleAlert(breakdownId);
      }
    );
  }

  calculateBreakdownQty(line) {
    return (line.numPacks * line.packQty)
  }
  handleAlert(rowIndex) {
    this.errorManagementService.getApiError().subscribe((dismiss) => {
      if (!dismiss) {
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex);
        }
      } else {
        this.populateGrid(this.selectedList.itemStockBreakdownList);
      }
    });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.insComplete = false;
    let isComplete = changes["insIsComplete"]
    if(isComplete.currentValue){
      this.insComplete = true;
    }
    let idProp = changes["inspectionId"];
    if(idProp){
    this.inspectionId = idProp.currentValue;
    var _self = this;
    if (this.inspectionId > 0) {
      //_self.getStockBreakdownlist();
      //_self.runValidation(this.selectedList);
      //_self.emitWarehouseBin();
    }
  }
  }

  ngOnInit() {
    this.itemBreakdownComponent.emit(this);

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStockBreakdownlist() {
    var _self = this;
    this.inspectionService.getStockWithBreakdownsList(this.inspectionId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {

        this.stockBreakdownList = data;
        if (this.stockBreakdownList) {
          this.stockTab_Click(0)
          //this.getWarehouseBins();
          this.populateGrid(this.selectedList.itemStockBreakdownList);
          this.emitBreakdownSummary();
          _self.createGrid(true);
          // setTimeout(function () {
          //   _self.createGrid(true);
          // }, 1000);
        }

        console.log('Breakdown list', this.stockBreakdownList)
      });
  }

  stockTab_Click(index) {
    this.selectedList = this.stockBreakdownList[index];

    this.populateGrid(this.selectedList.itemStockBreakdownList);
    this.runValidation(this.selectedList);
    
    this.selectedRowCount = 0;
  }

  createRow(line) {
    const _self = this;
    let packaging = _self.packagingTypes.filter(x => x.id == line.packagingId)[0];
    let conditions = _self.conditionTypes.filter(x => x.id == line.conditionId)[0];
    let countries = _self.countryList.filter(x => x.countryId == line.countryId)[0];
    let discrepant = _self.discrepantList.filter(x => x.id == line.isDiscrepant)[0];
    let row = {
      breakdownId: line.breakdownId,
      stockId: line.stockId,
      packQty: line.packQty,
      mfrLotNum : line.mfrLotNum,
      numPacks: line.numPacks,
      qty: this.calculateBreakdownQty(line),
      dateCode: line.dateCode,
      discrepant: { id: line.isDiscrepant == true || line.isDiscrepant == 'true' ? true : false, name: discrepant.name ? discrepant.name : null },
      coo: { id: line.countryId ? line.countryId : 0, name: countries.name ? countries.name : null },
      condition: { id: line.conditionId ? line.conditionId : 0, name: conditions.name ? conditions.name : null },
      packaging: { id: line.packagingId ? line.packagingId : 0, name: packaging.name ? packaging.name : null },
      expirationDate: line.expirationDate ? line.expirationDate : null
      //shipDate: availLine.shipDate? _self.formatDate(availLine.shipDate): null,
    };
    
    return row;
  }


  populateGrid(data) {
    const _self = this;
    if (data) {
      _self.rowDataSet = _.map(data, breakdownLine => _self.createRow(breakdownLine));
    } else {
      _self.rowDataSet = [];
    }

    _self.breakdownGrid.api.setRowData(_self.rowDataSet);
    _self.breakdownGrid.api.sizeColumnsToFit();

    //Sum up total qty of rows
    let newQty = 0;
    _self.rowDataSet.forEach(x => {
      newQty += x.qty;
    });

    this.stockBreakdownList[this.selectedList.index].quantity = newQty;
    this.selectedList.quantity = newQty;

    if (_self.rowDataSet.length > 0)
      _self.breakdownGrid.api.hideOverlay();
    else
      _self.breakdownGrid.api.showNoRowsOverlay();
  }

  emitWarehouseBin() {
    let stockArray = [];
    this.stockBreakdownList.forEach(element => {
      stockArray.push({ id: element.itemStockId, warehouseBinId: Number(element.warehouseBinId)});
    });
    this.stockDetails.emit(stockArray);
    //this.warehouseBinId.emit(binId);

  }

  emitBreakdownSummary() {
    let qty_passed = 0;
    let discrepant_accepted = 0;
    let discrepant_rejected = 0;
    let _self = this;

    this.stockBreakdownList.forEach(x => {
      x.itemStockBreakdownList.forEach(i => {
        //validate as numeric
        if (i.packQty == null)
          i.packQty = 0;
        if (i.numPacks == null)
          i.numPacks = 0;

        let qtyToAdd = _self.calculateBreakdownQty(i);
        if (!i.isDiscrepant && !x.isRejected) {
          //quantity passed
          qty_passed += qtyToAdd

        }
        else if (i.isDiscrepant) {
          //Discrepant rejected
          if (x.isRejected)
            discrepant_rejected += qtyToAdd;
          //discrepant - accepted
          else
            discrepant_accepted += qtyToAdd;
        }
      })
    });

    this.qtyPassed.emit(qty_passed);
    this.qtyAccepted.emit(discrepant_accepted);
    this.qtyRejected.emit(discrepant_rejected);

    console.log('qty_passed', qty_passed)
    console.log('discrepant_accepted', discrepant_accepted)
    console.log('discrepant_rejected', discrepant_rejected)

  }

  createGrid(editable) {
    let _self = this;
    let columnDefs = [
      {
        headerName: "",
        headerClass: "grid-header",
        checkboxSelection: true,
        width: 30,
        maxWidth: 30,
        lockPinned: true,
        pinned: "left"
      },
      {
        headerName: "Discrepant",
        field: "discrepant",
        headerClass: "grid-header",
        width: 120,
        editable: function (params) {
          return _self.discrepantSelectEditable(params, _self);
        },
        cellRenderer: function (params) {
          var isRejected = _self.selectedList.isRejected.toString();

          //convert value to boolean
          params.value.id = ((params.value.id == 'true' || params.value.id == true) ? true : false);

          //if isRejected = true then always return discrepant
          if (params.value.id || isRejected == 'true')
            return 'Discrepant';

          //else return value
          return _self.discrepantList.filter(x => x.id == params.value.id)[0].name;
        },
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.discrepantList.map(x => { return { id: x.id, name: x.name } })
        },
      },
      {
        headerName: "COO",
        field: "coo",
        headerClass: "grid-header",
        cellRenderer: this.SelectCellRenderer,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.countryList.map(x => { return { id: x.countryId, name: x.name } })
        },
        comparator: _self.dropdownColComparator,
        width: 125,
      },
      {
        headerName: "Expiration Date",
        field: "expirationDate",
        headerClass: "grid-header",
        cellEditorFramework: DatePickerEditorComponent,
        //date needs to be in datepicker format
        cellEditorParams: {
          values: _self.countryList.map(x => { return { id: x.countryId, name: x.name } }),
        },
        editable: editable,
        width: 125,
        comparator: _self.dateColComparator
      },
      {
        headerName: "DateCode",
        field: "dateCode",
        headerClass: "grid-header",
        editable: editable,
        width: 65,
        cellClassRules: { 'required': this.requiredField }
      },
      {
        headerName: "Mfr Lot #",
        field: "mfrLotNum",
        headerClass: "grid-header",
        editable: editable,
        width: 65,
      },
      {
        headerName: "Qty per package",
        field: "packQty",
        headerClass: "grid-header",
        editable: editable,
        cellEditorFramework: NumericInputComponent,
        cellRenderer: function (params) { return params.data.packQty ? params.data.packQty.toLocaleString() : 0 },
        cellClassRules: { 'required': this.requiredField },
        cellStyle: { 'text-align': 'right' },
        minWidth: 125,
        width: 125
      },
      {
        headerName: "Packaging Type",
        field: "packaging",
        headerClass: "grid-header",
        cellRenderer: this.SelectCellRenderer,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.packagingTypes.map(x => { return { id: x.id, name: x.name } })
        },
        comparator: _self.dropdownColComparator,
        width: 100,
      },
      {
        headerName: "# Packages Count",
        field: "numPacks",
        headerClass: "grid-header",
        editable: editable,
        cellEditorFramework: NumericInputComponent,
        width: 125,
        cellClassRules: { 'required': this.requiredField }
      },
      {
        headerName: "Total Qty",
        field: "qty",
        headerClass: "grid-header",
        editable: false,
        minWidth: 110,
        width: 110,
        cellStyle: { 'text-align': 'right' },
        cellClassRules: { 'required': this.requiredField }
      },
      {
        headerName: "Packaging Condition",
        field: "condition",
        headerClass: "grid-header",
        cellRenderer: this.SelectCellRenderer,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.conditionTypes.map(x => { return { id: x.id, name: x.name } })
        },
        comparator: _self.dropdownColComparator,
        minWidth: 100,
      },
    ]
    this.breakdownGrid.api.setColumnDefs(columnDefs);

    this.breakdownGrid.rowHeight = this.rowHeight;
    this.breakdownGrid.headerHeight = this.headerHeight;

  }

  discrepantSelectEditable(params, self) {
    var isRejected = self.selectedList.isRejected;

    if (isRejected == 'false')
      return true;

    if (isRejected == 'true')
      return false;

    return !self.selectedList.isRejected;
  }

  SelectCellRenderer(params) {
    return params.value ? params.value.name : '';
  }

  returnItemStockDetails(index) {
    let details: ItemBreakdown;
    details = {
      itemStockId: this.stockBreakdownList[index].itemStockId,
      poLineId: this.stockBreakdownList[index].poLineId,
      itemId: this.stockBreakdownList[index].itemId,
      quantity: this.stockBreakdownList[index].quantity,
      warehouseBinId: this.stockBreakdownList[index].warehouseBinId,
      warehouseId: this.stockBreakdownList[index].warehouseId,
      mfrLotNum: this.stockBreakdownList[index].mfrLotNum,
      invStatusID: this.stockBreakdownList[index].invStatusID,
      externalId: this.stockBreakdownList[index].externalId,
      stockDescription: this.stockBreakdownList[index].stockDescription,
      packagingTypeId: this.stockBreakdownList[index].packagingTypeId,
      conditionId: this.stockBreakdownList[index].conditionId,
      countryId: this.stockBreakdownList[index].countryId,
      dateCode: this.stockBreakdownList[index].dateCode,
      expirationDate: this.stockBreakdownList[index].expirationDate,
      acceptedBinId: this.stockBreakdownList[index].acceptedBinId,
      acceptedBinName: this.stockBreakdownList[index].acceptedBinName,
      rejectedBinId: this.stockBreakdownList[index].rejectedBinId,
      rejectedBinName: this.stockBreakdownList[index].rejectedBinName,
      receivedDate: this.stockBreakdownList[index].receivedDate,
      inspectionWarehouseId: this.stockBreakdownList[index].inspectionWarehouseId,
      isRejected: this.stockBreakdownList[index].isRejected
    }
    
    return details;
  }

  newItemStock_Click() {
    this.saveItemStock()
  }

  changeStockStatus(stockid) {
    this.selectedList.isRejected = (this.selectedList.isRejected.toString() == 'false' ? false : true);
    var emitBinid = (this.selectedList.isRejected ? this.selectedList.rejectedBinId : this.selectedList.acceptedBinId);
    this.emitWarehouseBin();
  }

  saveItemStock(editingStockId: number = null) {
    var _self = this;
    var index = 0;

    //editing an exisiting stock
    if (editingStockId) {
      index = this.selectedList.index;
    }
    let itemStockDetails = this.returnItemStockDetails(index);
    itemStockDetails.itemStockId = editingStockId;  //clear stockID, we want to create a new one
    itemStockDetails.externalId = null; //unique to SAP
    itemStockDetails.isRejected = (itemStockDetails.isRejected.toString() == 'false' ? false : true);

    this.inspectionService.setItemStock(this.inspectionId, itemStockDetails).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        var stockBreakdownId = data;
        
        //creating new stock, initiate breakdownlist
        if (stockBreakdownId && !editingStockId) {
          itemStockDetails.itemStockBreakdownList = new Array<BreakdownLine>();
          _self.stockBreakdownList.push(itemStockDetails);
          var i = _self.stockBreakdownList.length - 1;
          _self.stockBreakdownList[i].itemStockId = stockBreakdownId;
          _self.stockBreakdownList[i].index = i;

          //load grid
          _self.stockTab_Click(i);
        }

        //editing existing stock
        else {
          var breakdownnList = _self.stockBreakdownList.find(x => x.itemStockId == editingStockId).itemStockBreakdownList;

          //if status is rejected, loop through breakdown rows and set each line to discrepant
          if (itemStockDetails.isRejected) {
            breakdownnList.forEach(list => {
              list.isDiscrepant = true;
              list.isDiscrepant = true;

              //Toggle row save 
              _self.saveRowData(_self.createRow(list));
            })
          }

          //emit conclusion summary data
          _self.emitBreakdownSummary();

          //emit bin to conclusion
          this.changeStockStatus(stockBreakdownId);
        }
      })

  }

  onDeleteItemStock(stockId) {
    var _self = this
    swal({
      title: 'Are you sure you want to delete this stock?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then(function () {
      _self.deleteItemStock(stockId, _self);
    }, function () {

    });
  }

  deleteItemStock(stockId, self) {
    self.inspectionService.deleteItemStock(stockId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        var stockDeleted = data;
        if (stockDeleted) {
          console.log('Deleted stockID ' + stockDeleted)

          //Set new selected stock to one before
          this.selectedList = this.stockBreakdownList[this.selectedList.index - 1];

          //Remove old stock
          this.stockBreakdownList.splice(this.stockBreakdownList.find(x => x.itemStockId == stockDeleted).index, 1);

          //Update stock index for stocks after the deleted one
          this.stockBreakdownList.forEach(x => {
            if (x.index > this.selectedList.index) {
              x.index--;
            }
          })

          //Emit summary with new quantities
          this.emitBreakdownSummary()

          //Emit warehouse bins with new stocks
          this.emitWarehouseBin()

          //Get breakdown grid for new selected warehouse
          this.populateGrid(this.selectedList.itemStockBreakdownList);
        }
      })
  }

  requiredField(params) {
    return _.trim(params.value) ? false : true;
  }

  dateColComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    let a = new Date(valueA);
    if (!a) {
      return 0;
    }
    let b = new Date(valueB);
    return a > b ? 1 : -1
  }

  dropdownColComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    if (!valueA || !valueA.name) return -1;
    return valueA.name.localeCompare(valueB.name)
  }

  initializeTabs() {

  }


  checkTabAndGridValidation() {
    let isValid;
    this.stockBreakdownList.forEach(element => {
      let itemGridLine = element.itemStockBreakdownList.length;
      if (!element.countryId  || !element.packagingTypeId  || !element.conditionId 
        || !element.expirationDate || !element.dateCode || itemGridLine == 0 || element.isLineEditingMode) {
        isValid = false;
      }else{
        isValid = true;
      }

    })
    return isValid;

  }



}
