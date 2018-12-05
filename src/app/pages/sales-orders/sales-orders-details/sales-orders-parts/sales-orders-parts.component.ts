import { Component, OnInit, Input, SimpleChange, OnDestroy, Output, EventEmitter, ViewEncapsulation, AfterViewInit } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { SalesOrdersService } from './../../../../_services/sales-orders.service';
import { GridOptions, RowNode } from "ag-grid";
import { QuotePart } from './../../../../_models/quotes/quotePart';
import { Commodity } from './../../../../_models/shared/commodity';
import { PackagingType } from './../../../../_models/shared/packagingType';
import { Item } from './../../../../_models/Items/item';
import { SalesOrderPart } from './../../../../_models/sales-orders/salesOrderPart';
import { SelectEditorComponent } from './../../../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../../../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { CustomHeaderComponent } from './../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { default as swal } from 'sweetalert2';
import { Observable } from 'rxjs/Observable';
import { AGGridSettingsService } from './../../../../_services/ag-grid-settings.service';
import { ErrorManagementService } from './../../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { ItemTypeaheadGridComponent } from './../../../_sharedComponent/item-typeahead-in-grid/item-typeahead-grid.component';
import { InputComService } from './../../../../_coms/input-com.service';
import { MfrInputComponent } from './../../../_sharedComponent/mfr-input/mfr-input.component';
import { ComoditySelectComponent } from './../../../_sharedComponent/comodity-select/comodity-select.component';
import { LinkCreator } from './../../../../_utilities/linkCreaator';
import { ConditionType } from './../../../../_models/shared/ConditionType';
import { GPUtilities } from '../../../../_utilities/gp-utilities/gp-utilities';
import { NumberUtil } from '../../../../_utilities/number/number-util';
import { cellMenuColDefinition, ICellMenuItem, ICellMenuParams } from '../../../../_utilities/cellMenuGrid';


@Component({
  selector: 'az-sales-orders-parts',
  templateUrl: './sales-orders-parts.component.html',
  styleUrls: ['./sales-orders-parts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AGGridSettingsService, InputComService]
})
export class SalesOrdersPartsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() soId;
  @Input() soVersionId;
  @Input() objectTypeId;
  @Input() deliveryRuleId;
  @Output() onRowClicked = new EventEmitter<number>();
  @Output() objectInfo = new EventEmitter<string>();

  private orderNo: number;
  private soLineId: number;
  private originalOrderQty: number;
  private neededQty: number
  private itemId: number;

  private infoSoLineId : number;
  private deliveryStatus : string;
  private invoiceStatus : string;
  private itemPartNumber : string;

  private partsGrid: GridOptions;
  private packagingTypes: PackagingType[];
  private conditionTypes: ConditionType[];
  private deliveryRuleList: Array<any>;
  private rowHeight = 30;
  private headerHeight = 30;
  private rowDataSet = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private soParts;
  private generalPermission = 'generalPermission';
  private commodities: Commodity[];

  private _selectedRowNode: RowNode;
  private gridName = 'sales-orders-parts';

  private hoverObjectInfo: string;
  private hoverObjectId: number;
  private clickedSOLineId: number;
  private soLineObjectTypeId: number;
  private clickedObjectInfo: string;

  constructor(private salesOrdersService: SalesOrdersService,
    private agGridSettings: AGGridSettingsService,
    private _notificationsService: NotificationsService,
    private router: Router,
    private errorManagementService: ErrorManagementService,
    private ngxPermissionsService: NgxPermissionsService,
    private gpUtilities: GPUtilities,
    private linkCreator: LinkCreator) {

    let _self = this;
    this.partsGrid = {
      animateRows: true,
      enableGroupEdit: true,
      onRowEditingStopped: function (event) { _self.saveRow(event, _self) },
      suppressRowClickSelection: true,
      enableColResize: true,
      editType: 'fullRow',
      suppressContextMenu: true,
      pagination: true,
      paginationPageSize: 5,
      enableSorting: true,
      suppressDragLeaveHidesColumns: true,
      defaultColDef: { 
        suppressMenu: true
      },
      rowSelection: 'multiple',
      toolPanelSuppressSideButtons: true,
      context: {
        parentComponent: this
      },
      onViewportChanged: function () {
        _self.partsGrid.api.sizeColumnsToFit();
      },
      rowHeight: _self.rowHeight,
      headerHeight: _self.headerHeight,
      enableFilter: true,
      floatingFilter: true
    };
    this.salesOrdersService.getPartCommentStatus().subscribe(data => {
      if (data.increment) {
        _self.commentCountIncrement();
      }
    });

    this.salesOrdersService.getSOLinesObjectTypeId()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((objectTypeId) => {
        this.soLineObjectTypeId = objectTypeId;
      });


      
    this.ngxPermissionsService.permissions$.subscribe((permissions) => {
      const canEditLines = !!permissions['CanEditLines'];
      let canFulfill;

      if (localStorage.getItem(this.generalPermission)) {
        const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
        if (_.includes(permissionList, 'CanFulfill16')) {
          canFulfill = { name: 'CanFulfill16' };
        }
      }
      if (canEditLines || canFulfill) {
        _self.createGrid(_self.conditionTypes, _self.packagingTypes, _self.deliveryRuleList, canEditLines, true);
        _self.populateGrid(_self.soParts);
      }
    });
  }

  ngOnInit() { }

  ngAfterViewInit(): void {
    jQuery(".salesOrderGridOuter .quotePartsButton").appendTo(".salesOrderGridOuter .ag-paging-panel");
  }

  triggerSave() {
    this.partsGrid.api.stopEditing();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let soIdProp = changes['soId'];
    let soVersionIdProp = changes['soVersionId'];
    let soLineObjectTypeId = changes['objectTypeId'];
    if (soIdProp && soVersionIdProp) {
      this.soId = soIdProp.currentValue;
      this.soVersionId = soVersionIdProp.currentValue;
    }
    if (soLineObjectTypeId) {
      this.objectTypeId = soLineObjectTypeId.currentValue;
    }
    if (this.soId && this.soVersionId) {
      this.populateData();
    } else {
      //Create new Sales Order
    }
  }

  populateData() {
    this.salesOrdersService.getSalesOrderData(this.soId, this.soVersionId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        const permissions = this.ngxPermissionsService.getPermissions();
        let editable = false;
        let canFulfill = false;
        this.setHeightOfGrid(data[0].length);
        if (permissions['CanEditLines']) {
          editable = true;
        }
        if (localStorage.getItem(this.generalPermission)) {
          const permissionList = JSON.parse(localStorage.getItem(this.generalPermission));
          if (_.includes(permissionList, 'CanFulfill16')) {
            canFulfill = true;
          }
        }
        this.soParts = data[0];
        this.commodities = data[2];
        this.deliveryRuleList = data[3];
        this.conditionTypes = data[4];
        let height = data[0].length < this.partsGrid.paginationPageSize ? data[0].length : this.partsGrid.paginationPageSize;
        this.setHeightOfGrid(height + 1);
        this.createGrid(data[4], data[1], data[3], editable, canFulfill);
        this.populateGrid(data[0]);
      });
  }

  setHeightOfGrid(count) {
    let height;
    if (count <= 5) {
      height = this.getHeight(5); //Minimum 5 rows tall
    }
    else if (count > 25) {
      height = this.getHeight(25);
    }
    else {
      height = this.getHeight(count);
    }
    document.getElementById('partsGrid').style.height = height + 'px';
  }

  getHeight(count: number) {
    return (count * (this.rowHeight)) + this.headerHeight;
  }

  createGrid(conditionTypes: ConditionType[], packagingTypes: PackagingType[], deliveryRuleList, editable, fulfill) {
    this.packagingTypes = packagingTypes;
    this.deliveryRuleList = deliveryRuleList;
    this.conditionTypes = conditionTypes;
    let _self = this;
    let columnDefs = [
      {
        headerName: "",
        headerClass: "grid-header",
        checkboxSelection: true,
        width: 40,
        minWidth: 40,
        maxWidth: 40,
        lockPinned: true,
        pinned: "left",
        suppressFilter: true
      },
      {
        headerName: "Ln",
        field: "lineNo",
        headerClass: "grid-header",
        width: 40,
        lockPinned: true,
        pinned: "left",
        minWidth: 40,
        suppressFilter: true
      },
      {
        headerName: "CLn",
        field: "customerLineNo",
        headerClass: "grid-header",
        editable: true,
        lockPinned: true,
        pinned: "left",
        width: 50,
        minWidth: 50,
        suppressFilter: true
      },
      {
        headerName: "Part Number",
        field: "partNumber",
        lockPinned: true,
        pinned: "left",
        cellClassRules: { 'required': this.requiredField },
        headerClass: "grid-header",
        editable: editable,
        cellRenderer: (params) => {
          if(!params.node.data.itemId){
            return params.node.data.partNumber;
          }else{
          return this.linkCreator.createItemLink(params.node.data.itemId, params.node.data.partNumber)
          }
        },
        cellEditorFramework: ItemTypeaheadGridComponent,
        cellEditorParams: { keepDisabled: true, values: { parentClassName: ".partsContainer" } },
        width: 150,
        minWidth: 150,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Manufacturer",
        field: "manufacturer",
        lockPinned: true,
        pinned: "left",
        headerClass: "grid-header",
        cellEditorFramework: MfrInputComponent,
        minWidth: 150,
        editable: true,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Commodity",
        field: "commodity",
        lockPinned: true,
        pinned: "left",
        headerClass: "grid-header",
        valueGetter: this.SelectCellGetter,
        cellEditorFramework: ComoditySelectComponent,
        cellEditorParams: {
          values: this.commodities.map(x => { return { id: x.id, name: x.name } })
        },
        minWidth: 100,
        editable: true,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Internal PN",
        field: "customerPN",
        lockPinned: true,
        pinned: "left",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 120,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Quantity",
        field: "quantity",
        lockPinned: true,
        pinned: "left",
        headerClass: "grid-header",
        editable: editable,
        cellRenderer: function (params) { return params.data.quantity.toLocaleString() },
        newValueHandler: function (params) {
          const trimmedValue = parseInt(params.newValue.replace(',', ''));
          if (!isNaN(trimmedValue)) {
            params.data["quantity"] = trimmedValue;
            return true;
          }
          else {
            alert("invalid input for quantity");
            return false;
          }
        },
        cellClassRules: { 'required': this.requiredField },
        cellStyle: { 'text-align': 'right' },
        minWidth: 60,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Reserved",
        field: "reserved",
        lockPinned: true,
        pinned: "left",
        headerClass: "grid-header",
        minWidth: 100,
        cellStyle: { 'text-align': 'right' },
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Price(USD)",
        field: "price",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 75,
        cellClassRules: { 'required': (params)=>{ return !NumberUtil.isPriceValid(params.value) } },
        cellStyle: { 'text-align': 'right' },
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Cost(USD)",
        field: "cost",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 75,
        cellClassRules: { 'required': (params)=>{ return !NumberUtil.isPriceValid(params.value) } } ,
        cellStyle: { 'text-align': 'right' },
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "GP(%)",
        headerClass: "grid-header",
        valueGetter: '(((data.quantity * data.price) - (data.quantity * data.cost)) / (data.quantity * data.price) * 100).toFixed(2)+"%"',
        volatile: editable,
        cellRenderer: 'animateShowChange',
        minWidth: 80,
        cellStyle: { 'text-align': 'right' },
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "GP (USD)",
        field: "gp",
        headerClass: "grid-header",
        minWidth: 80,
        comparator: _self.floatColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "DateCode",
        field: "dateCode",
        headerClass: "grid-header",
        editable: editable,
        minWidth: 65,
        filter: 'agDateColumnFilter'
      },
      {
        headerName: "Packaging",
        field: "packaging",
        headerClass: "grid-header",
        valueGetter: this.SelectCellGetter,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.packagingTypes.map(x => {
            return { id: x.id, name: x.name }
          })
        },
        comparator: _self.dropdownColComparator,
        minWidth: 100,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Package Condition",
        field: "condition",
        headerClass: "grid-header",
        valueGetter: this.SelectCellGetter,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.conditionTypes.map(x => { return { id: x.id, name: x.name } })
        },
        minWidth: 100,
        comparator: _self.dropdownColComparator,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Ship Date",
        field: "shipDate",
        headerClass: "grid-header",
        cellEditorFramework: DatePickerEditorComponent,
        editable: editable,
        minWidth: 105,
        comparator: _self.dateColComparator,
        filter: 'agDateColumnFilter'
      },
      {
        headerName: "Delivery Rule",
        field: "deliveryRule",
        headerClass: "grid-header",
        valueGetter: this.SelectCellGetter,
        editable: editable,
        cellEditorFramework: SelectEditorComponent,
        cellEditorParams: {
          values: _self.deliveryRuleList.map(x => { return { id: x.deliveryRuleId, name: x.deliveryRuleName } })
        },
        comparator: _self.dropdownColComparator,
        minWidth: 100,
        filter: 'agSetColumnFilter'
      },
      {
        headerName: "Due Date",
        field: "dueDate",
        headerClass: "grid-header",
        cellEditorFramework: DatePickerEditorComponent,
        editable: editable,
        minWidth: 105,
        comparator: _self.dateColComparator,
        filter: 'agDateColumnFilter'
      },
      {
        headerName: "Status",
        field: "statusName",
        headerClass: "grid-header",
        editable: false,
        minWidth: 65,
        filter: 'agSetColumnFilter'
      },
      cellMenuColDefinition(this.prepareCellMenuItems, _self),
      {
        headerName: "Allocations",
        field: 'allocations',
        headerClass: "grid-header",
        headerComponentFramework: <{ new(): CustomHeaderComponent }>CustomHeaderComponent,
        cellRenderer: function (params) {
          return _self.allocationRenderer(_self,
            params.data.lineNo,
            params.data.soLineId,
            params.data.itemId,
            params.data.quantity,
            params.data.reserved,
            fulfill)
        },
        cellStyle: { 'text-align': 'center' },
        headerComponentParams: { menuIcon: 'fas fa-exchange-alt' },
        minWidth: 43,
        width: 43,
        lockPinned: true,
        pinned: "right",
        suppressFilter: true
      },
      {
        headerName: "Info",
        headerClass: "grid-header",
        headerComponentFramework: <{ new(): CustomHeaderComponent }>CustomHeaderComponent,
        cellRenderer: function (params) {
          return _self.infoRenderer(_self,
            params.data.deliveryStatus,
            params.data.invoiceStatus,
            params.data.soLineId,
            params.data.partNumber,
          )
        },
        cellStyle: { 'text-align': 'center' },
        headerComponentParams: { menuIcon: 'fas fa-info-circle' },
        minWidth: 40,
        width: 40,
        lockPinned: true,
        pinned: "right",
        suppressFilter: true
      },
      {
        headerName: "Comments",
        field: 'comments',
        headerClass: "grid-header",
        headerComponentFramework: <{ new(): CustomHeaderComponent }>CustomHeaderComponent,
        headerComponentParams: { menuIcon: 'fa-comment' },
        cellRenderer: function (params) { return _self.commentsRenderer(params, _self) },
        cellStyle: { 'text-align': 'center' },
        minWidth: 40,
        width: 40,
        lockPinned: true,
        pinned: "right",
        suppressFilter: true
      }
    ];

    this.partsGrid.api.setColumnDefs(columnDefs);

    this.partsGrid.rowHeight = this.rowHeight;
    this.partsGrid.headerHeight = this.headerHeight;

  }

  infoRenderer(_self,deliveryStatus,invoiceStatus,soLineId,partNumber){
    let anchor = document.createElement('i');
    anchor.className = 'fas fa-info-circle';
    anchor.title = "Info";
    anchor.style.cursor = "pointer";

    anchor.addEventListener("click", function () {
      _self.infoSoLineId = soLineId;
      _self.deliveryStatus = deliveryStatus;
      _self.invoiceStatus = invoiceStatus;
      _self.itemPartNumber = partNumber;
      jQuery("#mdlInfoSoLine").modal('show');
    })
    return anchor;
  }

  requiredField(params) {
    return _.trim(params.value) ? false : true;
  }

  allocationRenderer(_self,lineNo, soLineId, itemId, orderQty, reservedQty, canFulFill) {
    let anchor = document.createElement('i');
    anchor.className = 'fas fa-exchange-alt';
    anchor.style.marginLeft = '12px';
    anchor.title = "Allocations";
    anchor.style.cursor = "pointer";

    if (canFulFill) {
      anchor.addEventListener("click", function () {
        _self.orderNo = _self.soId;
        _self.soLineId = soLineId;
        _self.soLineNum = lineNo;
        _self.itemId = itemId;
        _self.originalOrderQty = orderQty;
        _self.neededQty = _self.reverseLocaleString(orderQty) - _self.reverseLocaleString(reservedQty);

        jQuery('.partsContainer').css('height', 'auto');
        jQuery('.partsContainer').css('left', '10px')
      });
    }
    return anchor;
  }

  commentsRenderer(params, _self) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.className = 'fas fa-comments';
    i.title = "Add Comments";
    i.setAttribute('aria-hidden', 'true');
    i.style.color = 'black';
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";
    anchor.addEventListener('click', function () {
      _self.clickedSOLineId = params.data.soLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#so-part-comment-modal").modal('toggle');
    });
    if (params.data.comments < 1) {
      return anchor;
    }
    let div = document.createElement('div');
    div.className = 'comment-col-div';
    div.innerHTML = params.data.comments > 0 ? ('' + params.data.comments) : '';
    div.addEventListener('mouseenter', (e) => {
      _self.hoverObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      _self.hoverObjectId = params.data.soLineId;
      jQuery('#so-part-comment-preview').find('.modal-content').css('display', 'block');
      jQuery('#so-part-comment-preview').find('.modal-content').css('position', 'fixed');
      jQuery('#so-part-comment-preview').find('.modal-content').css('top', (e.y - 150) + 'px');
      jQuery('#so-part-comment-preview').find('.modal-content').css('left', (e.x - 500) + 'px');
    });
    div.addEventListener('mouseleave', function () {
      jQuery('#so-part-comment-preview').find('.modal-content').css('display', 'none');
      _self.hoverObjectId = undefined;
    });
    div.addEventListener('click', function () {
      _self.clickedSOLineId = params.data.soLineId;
      _self.clickedObjectInfo = `Line ${params.data.lineNo} - ${params.data.partNumber}`;
      jQuery("#so-part-comment-modal").modal('toggle');
    });
    return div;
  }

  SelectCellRenderer(params) {
    return params.value ? params.value.name : '';
  }

  SelectCellGetter(params) {
    const field = params.colDef.field
    return params.data && params.data[field] ? params.data[field].name : null;
  }

  reverseLocaleString(locale: string): number {
    if (typeof locale !== 'string') {
      return locale;
    }
    const reg = /[^0-9]/g;
    return parseInt(locale.replace(reg, ''));
  }


  availabilityChanged(event) {
    if (event) {
      this.populateData();
      let currentPage = this.partsGrid.api.paginationGetCurrentPage();
      this.partsGrid.api.paginationGoToPage(currentPage);
    }
  }

  populateGrid(soParts: SalesOrderPart[]) {
    console.log(soParts);
    let _self = this;
    let rowData = soParts.map(x => this.createDataRow(x, _self));
    this.rowDataSet = rowData;
    this.partsGrid.api.setRowData(rowData);
    this.partsGrid.api.sizeColumnsToFit();

    if (soParts.length == 0)
      this.partsGrid.api.showNoRowsOverlay();
  }

  floatColComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    if (!valueA) {
      return 0;
    }
    return parseFloat(valueA) - parseFloat(valueB);
  }

  dropdownColComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    if (!valueA || !valueA.name) return -1;
    return valueA.name.localeCompare(valueB.name)
  }

  dateColComparator(valueA, valueB, nodeA, nodeB, isInverted) {
    let a = new Date(valueA);
    if (!a) {
      return 0;
    }
    let b = new Date(valueB);
    return a > b ? 1 : -1
  }

  createDataRow(soPart: SalesOrderPart, _self) {
    let condition = _self.conditionTypes.find(x => x.id == soPart.packagingConditionId);
    let packaging = _self.packagingTypes.find(x => x.id == soPart.packagingId);
    let commodity = _self.commodities.find(x => x.id == soPart.commodityId);
    let deliveryRule = _self.deliveryRuleList.find(x => x.deliveryRuleId == soPart.deliveryRuleId);
    let retValue =
    {
      soLineId: soPart.soLineId,
      lineNo: soPart.lineNo,
      customerLineNo: soPart.customerLineNo,
      manufacturer: soPart.manufacturer,
      customerPN: soPart.customerPN,
      quantity: soPart.quantity,
      reserved: soPart.reserved,
      price: NumberUtil.formatPrice(soPart.price),
      cost: NumberUtil.formatPrice(soPart.cost),
      shipDate: soPart.shipDate,
      dateCode: soPart.dateCode,

      deliveryRule: {
        id: deliveryRule ? deliveryRule.deliveryRuleId : 0,
        name: deliveryRule ? deliveryRule.deliveryRuleName : ''
      },

      commodity: commodity,
      packaging: {
        id: packaging ? packaging.id : 0,
        name: packaging ? packaging.name : ''
      },
      condition: {
        id: condition ? condition.id : null,
        name: condition ? condition.name : ''
      },
      gp: _self.gpUtilities.GrossProfit(soPart.quantity, soPart.cost, soPart.price),
      itemId: soPart.itemId,
      dueDate: soPart.dueDate,
      deliveryStatus:soPart.deliveryStatus,
      invoiceStatus:soPart.invoiceStatus,
      comments: soPart.comments,
      partNumber: soPart.partNumber,
      statusName: soPart.statusName
    }

    return retValue;
  }

  saveRow(event, _self) {
    let invalidPrice = !NumberUtil.isPriceValid(event.node.data.price);
    let invalidCost = !NumberUtil.isPriceValid(event.node.data.cost);
    if (invalidPrice || invalidCost) {
      let errorText = (`Invalid Input in ${invalidPrice && invalidCost ? 'Price and Cost'
        : (invalidCost ? 'Cost' : 'Price')} cell.`);
      swal({
        title: "Validation Error",
        text: errorText,
        type: "error",
        confirmButtonText: "Edit",
        cancelButtonText: "Cancel Changes",
        showCancelButton: true,
        allowOutsideClick: false

      }).then((value) => {
        _self.startEditingSoLine(event.node.data.soLineId)
      }, (dismiss) => {
        _self.populateData();
      });
      return;
    }
    let soLineId = event.node.data.soLineId;

    if (event.node.data.itemId == 0 || !event.node.data.quantity || !event.node.data.price || !event.node.data.cost) {
      this.handleValidationError(event.node.data);
      return;
    }

   let soPart = {
      soLineId: event.node.data.quoteLineId,
      lineNo: event.node.data.lineNo,
      customerLineNo: event.node.data.customerLineNo,
      manufacturer: event.node.data.manufacturer,
      commodityName: event.node.data.commodity.name,
      customerPN: _.trim(event.node.data.customerPN) ? _.trim(event.node.data.customerPN) : null,
      quantity: event.node.data.quantity,
      reserved: event.node.data.reserved,
      price: NumberUtil.formatPrice(event.node.data.price),
      cost: NumberUtil.formatPrice(event.node.data.cost),
      deliveryRuleId: event.node.data.deliveryRule ? event.node.data.deliveryRule.id : null,
      packagingId: event.node.data.packaging.id ? event.node.data.packaging.id : null,
      packagingConditionId: event.node.data.condition ? event.node.data.condition.id : null,
      shipDate: event.node.data.shipDate,
      dateCode: _.trim(event.node.data.dateCode),
      itemId: event.node.data.itemId,
      dueDate: event.node.data.dueDate,
      partNumber: event.node.data.partNumber,
      commodityId: event.node.data.commodity.id,
      statusName: event.node.data.statusName
    }

    _self.salesOrdersService.setSalesOrderPart(soPart, soLineId, this.soId, this.soVersionId, event.node.data.isIhs).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {

        let ln = event.node.data;
        let deliveryRule = _.find(_self.deliveryRuleList, dr => dr.deliveryRuleId == data.deliveryRuleId);
        ln.soLineId = data.soLineId;
        ln.lineNo = data.lineNo;
        ln.manufacturer = data.manufacturer;
        ln.commodityName = data.commodityName;
        ln.itemId = data.itemId;
        ln.dataCode = data.dateCode;
        ln.customerPN = data.customerPN;
        ln.deliveryRule = {
          id: deliveryRule ? deliveryRule.deliveryRuleId : null,
          name: deliveryRule ? deliveryRule.deliveryRuleName : ''
        };
        ln.price = NumberUtil.formatPrice(data.price);
        ln.cost = NumberUtil.formatPrice(data.cost);
        ln.comments = ln.comments ? ln.comments : data.comments;
        _self.partsGrid.api.refreshRows([event.node]);
        event.node.data.isIhs = false;
        this.populateData();
      },
      error => {
        this.handleAlert(soLineId);
      }
    );
  }

  onAddRow() {

    var newItem = this.createDataRow(this.createNewSOPart(), this);

    this.rowDataSet.push(newItem);
    this.partsGrid.api.setRowData(this.rowDataSet);
    //this.partsGrid.api.refreshView();
    this.partsGrid.api.paginationGoToLastPage();
    //Get dummy row that has blank SoLineID, handles desc/asc sorting 
    let rowIndex = this.partsGrid.api.getRenderedNodes().filter(x => x.data.soLineId == 0)[0].rowIndex;//this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);
  }

  createNewSOPart() {
    let quotePart = new SalesOrderPart();

    //set default values for the drop downs
    quotePart.packagingId = this.packagingTypes[0].id;
    quotePart.packagingConditionId = this.conditionTypes[0].id;
    quotePart.itemId = 0;
    quotePart.lineNo = 0;
    quotePart.soLineId = 0;
    quotePart.commodityId = this.commodities[0].id;
    quotePart.quantity = 0;
    quotePart.reserved = 0;
    quotePart.statusName = 'Open';
    quotePart.deliveryRuleId = this.deliveryRuleId ? this.deliveryRuleId : this.deliveryRuleList[0].deliveryRuleId;
    return quotePart;
  }

  startEditingRow(rowIndex) {

    this.partsGrid.api.setFocusedCell(rowIndex, 'customerLineNo');

    this.partsGrid.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'customerLineNo',
      keyPress: null,
      //charPress: '0'
    });
  }

  deleteRows() {
    let rows = this.partsGrid.api.getSelectedRows();
    let soLinesToDelete = rows.map(x => x.soLineId);
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
      _self.salesOrdersService.deleteQuoteParts(soLinesToDelete)
        .takeUntil(_self.ngUnsubscribe.asObservable())
        .subscribe(success => {
          if (success) {
            soLinesToDelete.forEach(itemToDelete => {
              let indexOfItem = _self.rowDataSet.findIndex(x => x.soLineId == itemToDelete);
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

  handleAlert(soLineId) {
    this.errorManagementService.getApiError().subscribe((dismiss) => {
      if (!dismiss) {
        this.startEditingSoLine(soLineId);
      } else {
        this.populateData();
      }
    });
  }

  handleValidationError(data) {

    let errorText = "";
    if (data.itemId == 0) {
      errorText = "Please select an item from the suggested Items";
    }
    else {
      errorText = "Required fields not populated";
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
      this.startEditingSoLine(data.soLineId)
    }, (dismiss) => {
      this.populateData();
    });
  }

  startEditingSoLine(soLineId) {

    let rowIndex = this.rowDataSet.findIndex(x => x.soLineId == soLineId);
    if (rowIndex >= 0) {

      this.startEditingRow(rowIndex);
    }
  }


  createObservable(): Observable<boolean> {

    return Observable.of(true).delay(1);
  }

  onCellClicked(e) {
    this.onRowClicked.emit(e.data.soLineId);
    this.objectInfo.emit(`Line ${e.data.lineNo} - ${e.data.partNumber}`);
    let allRowElements2 = jQuery("#partsGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#partsGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
    this._selectedRowNode = e.node;
  }

  commentCountIncrement() {
    const commentCount = this._selectedRowNode.data.comments;
    this._selectedRowNode.setDataValue('comments', commentCount + 1);
  }


  resetGridColumns_Click() {
    if (this.partsGrid.columnApi && this.partsGrid.columnDefs) {
      this.partsGrid.columnApi.resetColumnState();
    }
    if (this.partsGrid.api) {
      this.partsGrid.api.sizeColumnsToFit();
    }
  }

  saveGridState_Click(event) {
    this.agGridSettings.saveGridState(this.gridName, this.partsGrid).subscribe(
      data => {
        var alertEl = jQuery(event.target).parent('.ag-grid-sort').find('.grid-Alert');
        jQuery(alertEl).fadeIn("slow");
        jQuery(alertEl).delay(5000).fadeOut("slow", function () {
          // Animation complete.
        });
      });
  }

  loadGridState() {
    this.agGridSettings.loadGridState(this.gridName).subscribe(
      data => {
        if (data.ColumnDef != null && this.partsGrid.columnApi)
          this.partsGrid.columnApi.setColumnState(JSON.parse(data.ColumnDef));

        if (data.SortDef != null && this.partsGrid.api)
          this.partsGrid.api.setSortModel(JSON.parse(data.SortDef));

        if (data.FilterDef != null && this.partsGrid.api)
          this.partsGrid.api.setFilterModel(JSON.parse(data.FilterDef));
      })
  }

  refreshGrid() {
    console.log("refresh sales-order-parts")

    this.populateData();
  }

  exportGrid_Click(event) {
    let url = 'api/sales-order/getSalesOrderExportLines?soId=' + this.soId + '&soVersionId=' + this.soVersionId
    var senderEl = event.currentTarget;

    //Button disabled/text change
    jQuery(senderEl).attr('disabled', '')
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
          jQuery(alertEl).delay(5000).fadeOut("slow", function () {
            // Animation complete.
          });
        }
      })
  }

  onSOExtraCommentSaved() {
    this.salesOrdersService.partCommentIncrement();
  }

  prepareCellMenuItems(params: ICellMenuParams, _self: any): ICellMenuItem[] {
    let menuItems: ICellMenuItem[] = [
      {
        icon: 'fas fa-copy',
        name: 'Copy',
        action: null
      }];  
    return menuItems;
  }
  
  
}
