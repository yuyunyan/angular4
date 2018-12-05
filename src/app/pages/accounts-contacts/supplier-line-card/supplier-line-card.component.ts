import { Manufacturer } from './../../../_models/Items/manufacturer';
import { Commodity } from './../../../_models/shared/commodity';
import { AccountFocusObjectType } from './../../../_models/contactsAccount/accountFocusObjectType';
import { AccountFocusType } from './../../../_models/contactsAccount/accountFocusType';
import { AccountFocus } from './../../../_models/contactsAccount/accountFocus';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { FocusObjectTypeComponent } from './../../_sharedComponent/focus-object-type/focus-object-type.component';
import { FocusNameComponent } from './../../_sharedComponent/focus-name/focus-name.component';
import { Component, OnInit, SimpleChange, Input, ViewEncapsulation } from '@angular/core';
import { List } from 'linqts';
import { default as swal } from 'sweetalert2';
import { GridOptions, ColumnApi, IDatasource, Grid } from 'ag-grid';
import { Subject } from 'rxjs/Subject';
import { NotificationsService } from 'angular2-notifications';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { ErrorManagementService } from './../../../_services/errorManagement.service';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';

@Component({
  selector: 'az-supplier-line-card',
  templateUrl: './supplier-line-card.component.html',
  styleUrls: ['./supplier-line-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SupplierLineCardComponent {
  private agGridOptions: GridOptions;
  private accountFocuses: AccountFocus[];
  private focusObjectTypes: AccountFocusObjectType[];
  private commodities: Commodity[];
  private manufacturers: Manufacturer[];
  private commonArray = [];
  private focusTypes: AccountFocusType[];
  private canEditFocus:boolean = true;
  private canEditGrid:boolean = true;


  private rowHeight = 30;
  private headerHeight = 35;

  private rowDataSet = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() accountId: number;

  constructor(private acService: AccountsContactsService,
    private errorManagementService: ErrorManagementService, private _notificationsService: NotificationsService, private ngxPermissionsService: NgxPermissionsService, ) {
    let _self = this;
    this.checkPermissionOfCanEditFocus();

    this.agGridOptions = {
      animateRows: true,
      headerHeight: 30,
      enableColResize:true,
      rowHeight: 30,
      pagination: true,
      suppressContextMenu:true,
      paginationPageSize: 5,
      editType: this.canEditFocus? 'fullRow':'none',
      onRowEditingStopped:  function (event) { _self.runValidation(event.node.data) },
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      }
      
      
    };
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let accountIdProp = changes["accountId"];
    if (accountIdProp != undefined) {
      this.accountId = accountIdProp.currentValue;
      this.getAccountFocusesData();
    }
    
    this.checkPermissionOfCanEditFocus();
  }

  runValidation(data) {
    if (data.focusObject.id === 10000) {
      this.getAccountFocusesData();
      setTimeout(() => {
        this.onAddRow();
      }, 400);
      this._notificationsService.error("Manufacturer doesn't exist");
    } else {
      this.saveRow(data)
    }
  }

  getAccountFocusesData() {
    this.acService.getAccountFocusData(this.accountId).subscribe(data => {
      this.accountFocuses = data[0];
      this.focusObjectTypes = data[1];
      this.focusTypes = data[2];
      this.commodities = data[3];
      this.manufacturers = data[4].manufacturers;
      if (this.commodities && this.manufacturers) {
        this.commonArray = this.getSingleFocusObjectsArray(this.commodities, this.manufacturers);
      }

      let height = data[0].length < this.agGridOptions.paginationPageSize ? data[0].length : this.agGridOptions.paginationPageSize;
      this.setHeightOfGrid(height + 1);
      this.createGrid(data[1], data[2], this.commonArray);
      this.populateGrid(this.accountFocuses);
    });
  }

  setHeightOfGrid(count) {
    let height;
    if (count <= 5) {
      height = this.getHeight(5); //Minimum 5 rows tall
    }
    else {
      height = this.getHeight(count);
    }
    document.getElementById('supplierGrid').style.height = (200 + height) + 'px';
  }

  getHeight(count: number) {
    return ((count + 1) * (this.rowHeight)) + this.headerHeight;
  }

  getSingleFocusObjectsArray(commodities, manufacturers) {
    let focusObject = {};
    let finalArray = [];
    commodities.forEach(element => {
      focusObject = {
        id: element.id,
        name: element.name,
        objectTypeId: 101 //commodity
      }
      finalArray.push(focusObject);
    });
    manufacturers.forEach(element => {
      focusObject = {
        id: element.MfrID,
        name: element.MfrName,
        objectTypeId: 102
      }
      finalArray.push(focusObject);
    });
    return finalArray;
  }

  saveRow(data) {
    const _self = this;
    if (!data) {
      return;
    }
    if (data.focusObject != undefined && data.focusTypeObject != undefined && data.focusObjectTypeObject != undefined) {
      let focusObjectType = _self.focusObjectTypes.find(x => {
        return x.objectTypeId == data.focusObject.objectTypeId
      });
      const payload = {
        focusId: data.focusId,
        accountId: data.accountId,
        focusTypeId: data.focusTypeObject.id,
        focusObjectTypeId: focusObjectType ? focusObjectType.focusObjectTypeId : null,
        objectId: data.focusObject.id
      };
      this.acService.setAccountFocus(payload).subscribe(data => {
        this._notificationsService.success('Successfully saved the focus');
        _self.getAccountFocusesData();
      }, error => {
        let newCreatedRow = _self.rowDataSet.findIndex(row => row.focusId === undefined);
        this.handleAlert(newCreatedRow);
      });
    } else {
      this._notificationsService.error('Could not save the focus');
      _self.getAccountFocusesData();
    }

  }

  onAddRow() {
    var newItem = this.createRow(this.createNewAccountFocus());
    this.rowDataSet.push(newItem);
    this.agGridOptions.api.setRowData(this.rowDataSet);
    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);
  }

  createRow(af: AccountFocus) {
    let focusObject, focusObjectId, focusObjectName, focusObjectTypeId;
    if (af.commodityId != null) {
      focusObject = this.commodities.find(x => x.id == af.objectId)
      if (focusObject) {
        focusObjectId = focusObject.id;
        focusObjectName = focusObject.name;
      }
    }
    else if (af.mfrId != null) {
      focusObject = this.manufacturers.find(x => x.MfrID == af.objectId)
      if (focusObject) {
        focusObjectId = focusObject.MfrID;
        focusObjectName = focusObject.MfrName;
      } else {
        focusObjectId = af.mfrId;
        focusObjectName = af.objectValue;
      }
    }
    let focusObjectFinal = {
      id: focusObjectId,
      name: focusObjectName
    };
    var retValue = {
      focusId: af.focusId,
      accountId: af.accountId,
      focusObjectTypeId: af.focusObjectTypeId,
      focusTypeObject: {
        id: af.focusTypeId,
        name: af.focusName
      },
      focusObjectTypeObject: {
        id: af.objectTypeId,
        name: af.objectName,
        focusObjectTypeId: af.focusObjectTypeId
      },
      focusObject: focusObjectFinal,
      objectTypeId: af.objectTypeId,
      objectId: af.objectId,
    }

    return retValue;
  }

  createNewAccountFocus() {
    let af = new AccountFocus();
    const defaultFocusObjectType = _.find(this.focusObjectTypes, (x) => x.objectTypeId == 101);
    const defaultFocusType = _.find(this.focusTypes, (x) => x.typeRank == 1)
    const defaultFocusObject = _.find(this.commonArray, (x) => (x.objectTypeId == 101));

    af.focusId = 0;
    af.accountId = this.accountId;
    af.objectName = defaultFocusObjectType ? defaultFocusObjectType.objectTypeName : null; //Commodity
    af.focusTypeId = defaultFocusType ? defaultFocusType.focusTypeId : null;
    af.focusName = defaultFocusType ? defaultFocusType.focusName : null; //Normal
    af.objectTypeId = defaultFocusObjectType ? defaultFocusObjectType.objectTypeId : null;
    af.focusObjectTypeId = defaultFocusObjectType ? defaultFocusObjectType.focusObjectTypeId : null;
    af.objectId = defaultFocusObject ? defaultFocusObject.id : null;
    af.commodityId = defaultFocusObject ? defaultFocusObject.id : null;
    af.mfrId = null;

    return af;
  }


  startEditingRow(rowIndex) {
    this.agGridOptions.api.setFocusedCell(rowIndex, 'focusObjectTypeObject');

    this.agGridOptions.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'focusObjectTypeObject',
      keyPress: null,
    });
  }

  handleAlert(rowIndex) {
    this.errorManagementService.getApiError().subscribe((dismiss) => {
      if (!dismiss) {
        if (rowIndex >= 0) {
          this.startEditingRow(rowIndex);
        }
      } else {
        this.getAccountFocusesData();
      }
    });
  }
  createGrid(focusObjectTypes, focusTypes, commonArray) {
    const _self = this;
    let columnDefs = [
      {
        headerName: 'Type',
        field: 'focusObjectTypeObject',
        headerClass: "grid-header",
        width: 100,
        editable: _self.canEditGrid,
        cellEditorFramework: FocusObjectTypeComponent,
        cellRenderer: this.selectCellRenderer,
        cellEditorParams: {
          values: focusObjectTypes.map(x => {
            return { id: x.objectTypeId, name: x.objectTypeName, focusObjectTypeId: x.focusObjectTypeId }
          })
        }
      },
      {
        headerName: 'Name',
        field: 'focusObject',
        headerClass: "grid-header",
        width: 200,
        minWidth: 200,
        editable: _self.canEditGrid,
        cellEditorFramework: FocusNameComponent,
        cellRenderer: this.selectCellRenderer,
        cellStyle: { 'overflow': 'visible' },
        cellEditorParams: {
          value: {parentClassName : ".partsContainer" },
          values:commonArray.map(x => {
            return { id: x.id, name: x.name, objectTypeId: x.objectTypeId }
          })
        }
      },
      {
        headerName: 'focusId',
        field: 'focusId',
        headerClass: "grid-header",
        width: 100,
        hide: true,
      },
      {
        headerName: 'accountId',
        field: 'accountId',
        headerClass: "grid-header",
        width: 100,
        hide: true,
      },
      {
        headerName: 'Link',
        field: 'focusTypeObject',
        headerClass: "grid-header",
        width: 100,
        editable: _self.canEditGrid,
        cellEditorFramework: SelectEditorComponent,
        cellRenderer: this.selectCellRenderer,
        cellEditorParams: {
          values: focusTypes.map(x => {
            return { id: x.focusTypeId, name: x.focusName }
          })
        }
      },
      {
        headerName: '',
        field: '',
        width: 20,
        lockedPin: true,
        pinned: 'right',
        cellRenderer: this.canEditFocus? function (params) { return _self.closeRenderer(params, _self) }:null,
      }
    ];
    this.agGridOptions.columnDefs = columnDefs;
    this.agGridOptions.api.setColumnDefs(columnDefs);
  }

  populateGrid(accountFocus: AccountFocus[]) {

    let rowData = [];
    for (let i = 0; i < accountFocus.length; i++) {
      let row = this.createRow(accountFocus[i]);
      rowData.push(row);
    }

    this.rowDataSet = rowData;
    this.agGridOptions.api.setRowData(rowData);
    this.agGridOptions.api.sizeColumnsToFit();
  }

  selectCellRenderer(params) {
    if (typeof params.value !== 'undefined')
      return params.value.name;
  }

  closeRenderer(params, _self) {
    let div = document.createElement('div');
    div.className += 'deleteCellAnchor';
    jQuery(div).css({ "text-align": "center", "padding-right": "2px" });
    if (params.data && !params.data.focusId) {
      return div;
    }
    let anchor = document.createElement('a');
    anchor.href = "javascript:void(0)";
    let i = document.createElement('i');
    i.className = 'fas fa-times';
    i.style.color = "#01A282";
    i.setAttribute('aria-hidden', 'true');
    jQuery(i).addClass("greenClass");
    anchor.appendChild(i);
    anchor.addEventListener("click", function () {
      swal({
        title: 'Are you sure?',
        text: "Are you sure you want to delete the focus?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        _self.DeleteRow(params);
      }, function () {

      });
    });
    div.appendChild(anchor);
    return div;
  }

  DeleteRow(params) {
    const _self = this;
    if (!params.data.focusId) {
      let newAddedFocus = _self.rowDataSet.pop();
      params.data.focusId = newAddedFocus.focusId;
      _self.agGridOptions.api.setRowData(_self.rowDataSet);
    }
    _self.acService.deleteAccountFocus(params.data.focusId).subscribe(data => {
      _self._notificationsService.success(
        'Successfully deleted the focus');
      _self.getAccountFocusesData();
    });
  }

  onCellClicked(e) {
    let allRowElements2 = jQuery("#linesGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#linesGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row')
  }

  checkPermissionOfCanEditFocus() {
    let permissions = this.ngxPermissionsService.getPermissions();
    if (!permissions['CanEditFocus']) {
      this.canEditFocus= false;
      this.canEditGrid = false;
      return;
    }
  }

}
