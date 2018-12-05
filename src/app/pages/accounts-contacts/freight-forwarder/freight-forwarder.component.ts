import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { CarrierService } from './../../../_services/carrier.service';
import { element } from 'protractor';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { dashCaseToCamelCase } from '@angular/animations/browser/src/dsl/style_normalization/web_animations_style_normalizer';
import { SelectEditorComponent } from './../../_sharedComponent/select-editor/select-editor.component';
import { NotificationsService } from 'angular2-notifications';
import { CarrierList } from './../../../_models/carrier/carrierList';
import { Observable } from 'rxjs/Observable';
import { AccountCarrier } from './../../../_models/carrier/accountCarrier';
import { IsDefaultCheckboxComponent} from './is-default-checkbox/is-default-checkbox.component';
import * as _ from 'lodash';

@Component({
  selector: 'az-freight-forwarder',
  templateUrl: './freight-forwarder.component.html',
  styleUrls: ['./freight-forwarder.component.scss']
})

export class FreightForwarderComponent {
  private ACGridOptions: GridOptions;
  private ACData = [];
  private columnDefs: any[];
  private rowDataSet = [];
  private carrierObject: CarrierList[];
  @Input() accountId: number;

  constructor(private carrierService: CarrierService, private _notificationsService: NotificationsService) {
    let _self = this;
    this.ACGridOptions = {
      animateRows: true,
      headerHeight: 30,
      rowHeight: 30,
      suppressContextMenu:true,
      suppressRowClickSelection: true,
      editType: 'fullRow',
      onRowEditingStopped: function (event) { _self.saveRow(event, _self) },
      pagination: true,
      paginationPageSize: 5,
      rowSelection: 'multiple',
      toolPanelSuppressSideButtons:true,
      defaultColDef:{
        suppressMenu:true
      }
      
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let accountIdProp = changes["accountId"];
    if (accountIdProp != undefined) {
      this.accountId = accountIdProp.currentValue;
      this.setGridData();
    }

  }
  setGridData() {
    let dataRequired = Observable.forkJoin(
      this.carrierService.getCarriers(),
      this.carrierService.getAccountCarrier(this.accountId)
    );

    dataRequired.subscribe(data => {

      this.carrierObject = data[0];
      let accountsData = data[1];
      this.setColumnDefs(this, this.carrierObject);
      this.populateACGrid(accountsData);
      this.ACGridOptions.api.sizeColumnsToFit();
    });

  }

  setColumnDefs(_self, carrierObject) {
    let columnDefs = [
      {
        headerName: "Carrier",
        field: "carrier",
        headerClass: "grid-header",
        editable: true,
        width: 500,
        cellStyle: { 'overflow': 'visible' },
        cellEditorFramework: SelectEditorComponent,
        cellRenderer: this.SelectCellRenderer,
        cellEditorParams: {
          values: carrierObject.map(x => {
            return { id: x.carrierId, name: x.carrierName }
          })
        }
      },
      {
        headerName: "Account No",
        field: "accountNumber",
        headerClass: "grid-header",
        width: 500,
        editable: true
      },
      {
        headerName: "Default",
        field: "isDefault",
        headerClass: "grid-header",
        width: 500,
        cellEditorFramework:IsDefaultCheckboxComponent,
        cellRenderer: params => {
          return `<input type='checkbox' class="form-control" style='position:absolute; height:60%; top:20%;' disabled=true ${params.data.isDefault ? 'checked' : ''  } />`;
        },
        editable: true

      },

      {
        headerName: "",
        headerClass: "grid-header",
        cellRenderer: function (params) { return _self.deleteCarrierRenderer(params, _self) },
        cellStyle: { 'text-align': 'center' },
        width: 200
      }

    ]
    this.ACGridOptions.api.setColumnDefs(columnDefs);
  }

  populateACGrid(accountsData: any) {
    let dataSource = [];
    accountsData.forEach(element => {
      dataSource.push({
        carrier: { name: element.carrierName, id: element.carrierId },
        isDefault: element.isDefault,
        accountNumber: element.accountNumber,
        carrierId: element.carrierId,
        accountId: element.accountId
      })
    })
    this.rowDataSet = dataSource;
    this.ACGridOptions.api.setRowData(dataSource);
    this.ACGridOptions.api.sizeColumnsToFit();
  }

  onCellClicked(e) {
    let allRowElements2 = jQuery("#freightGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#freightGrid").find(`[row=${e.node.rowIndex}]`);
    allRowElements2.removeClass('highlight-row');
    rowElement2.addClass('highlight-row');
  }
  
  deleteCarrierRenderer(params, _self) {
    let anchor = document.createElement('a');
    let i = document.createElement('i');
    i.className = 'fas fa-times';
    i.title = "Delete Carrier";
    i.setAttribute('aria-hidden', 'true');
    i.style.color = 'green';
    i.style.fontSize = '25px';
    anchor.appendChild(i);
    anchor.href = "javascript:void(0)";
    anchor.addEventListener('click', function () {
      _self.carrierService.deleteAccountCarrier(params.data.accountId, params.data.carrierId).subscribe(data => {
        if (data = true) {
          _self._notificationsService.success("Successfully deleted the Carrier");
          _self.setGridData();
        } else {
          _self._notificationsService.error('Could not delete the Carrier');
          _self.setGridData();
        }
      })
    });
    return anchor;
  }

  onAddRow() {
    var newItem = this.createRow();
    this.rowDataSet.push(newItem);
    this.ACGridOptions.api.setRowData(this.rowDataSet);
    let rowIndex = this.rowDataSet.length - 1;
    this.startEditingRow(rowIndex);
  }

  startEditingRow(rowIndex) {
    this.ACGridOptions.api.setFocusedCell(rowIndex, 'carrier');

    this.ACGridOptions.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'carrier',
      keyPress: null,
    });
  }

  SelectCellRenderer(params) {
    if (params.value.name)
      return params.value.name;
    else return null;
  }

  saveRow(event, _self) {
    _self.carrierService.editCreateCarrier(event.node.data.accountId, event.node.data.carrier.id, event.node.data.accountNumber, event.node.data.isDefault).subscribe(data => {
      if (data) {
        _self._notificationsService.success("Successfully saved the Carrier");
        _self.setGridData();
      } else {
        _self._notificationsService.error('Could not save the Carrier');
        _self.setGridData();
      }
    })
  }

  createRow() {
    const defaultCarrierDropdown = _.find(this.carrierObject, (x) => x.carrierId == x.carrierId);
    var gridValue = {
      carrier: { id: defaultCarrierDropdown ? defaultCarrierDropdown.carrierId : null, name: defaultCarrierDropdown ? defaultCarrierDropdown.carrierName : null },
      accountNumber: null,
      isDefault: null,
      accountId: this.accountId
    }
    return gridValue;
  }

}
