import { Component, ViewEncapsulation, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi, Grid } from "ag-grid";
import { RolesService } from './../../../_services/roles.service';
import { NavigationLink, Permission, Field, RoleDetails } from './../../../_models/roles/roleDetails';
import { RoleObjectType } from './../../../_models/roles/roleObjectType';
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { CheckRowComponent } from './../../_sharedComponent/check-row/check-row.component';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { RadioSelectComponent } from './../../_sharedComponent/radio-select/radio-select.component';
import { RadioSelectService } from './../../_sharedComponent/radio-select/radio-select.service';

import * as _ from 'lodash';

@Component({
	selector: 'az-roles-fields',
	templateUrl: './roles-fields.component.html',
	styleUrls: ['roles-fields.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RolesFieldsComponent{

	private fieldsGridOptions: GridOptions;
	@Input() fieldsData;
	@Input() onReadonly;
	@Output() onSavingFields: EventEmitter<any>;

	private _fieldsData;

	constructor(private radioSelectService: RadioSelectService) {
		const _self = this;
		this.fieldsGridOptions = {
			rowHeight: 30,
			headerHeight: 30,
			rowSelection: "multiple",
			suppressContextMenu:true,
			suppressRowClickSelection: true,
			toolPanelSuppressSideButtons:true,
		    defaultColDef:{suppressMenu:true}
		};

		_self.onSavingFields = new EventEmitter<any>();

		this.radioSelectService.getRadioStatus().subscribe(data => {
			const toUpdateField = _.find(_self._fieldsData, field => field.fieldId == data.fieldId);
			if (data.newStatus == 'visible'){
				toUpdateField.isEditable = false;
				toUpdateField.selectedForRole = true;
			} else if (data.newStatus == 'invisible'){
				toUpdateField.selectedForRole = false;
			} else {
				toUpdateField.isEditable = true;
				toUpdateField.selectedForRole = true;
			}
			_self.onSavingFields.emit(_self._fieldsData);
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		const fieldDataChange = changes['fieldsData'];
		const onReadonlyChange = changes['onReadonly'];
		if (fieldDataChange && fieldDataChange.currentValue){
			this.createFieldsGrid();
			this._fieldsData = _.map(this.fieldsData, fd => fd);
			// console.log(this.fieldsData)
			this.populateFieldGrid(this._fieldsData);
		}
		if (onReadonlyChange && onReadonlyChange.currentValue && this._fieldsData){
			this.createFieldsGrid();
			// console.log(this._fieldsData)
			this.populateFieldGrid(this._fieldsData);
		}
  }
	
	createFieldsGrid() {
		const _self = this;
		const columnDefs = [
			{
					field: "invisible",
					headerName:"invisible",
					headerClass:"grid-header",
					headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
					headerComponentParams: { menuIcon: 'fa-eye-slash' },
					width: 40,
					minWidth: 40,
					cellRendererFramework: RadioSelectComponent
			},
			{
					headerName:"visible",
					field: "visible",
					headerClass:"grid-header",
					headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
					headerComponentParams: { menuIcon: 'fa-eye' },
					width: 40,
					minWidth: 40,
					cellRendererFramework: RadioSelectComponent
			},
			{
					headerName:"canEdit",
					field: "canEdit",
					headerClass:"grid-header",
					headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
					headerComponentParams: { menuIcon: 'fas fa-pen-square' },
					width: 40,
					minWidth: 40,					
					cellRendererFramework: RadioSelectComponent
			},
			{
					headerName: 'Fields',
					field: "fieldName",
					minWidth: 200,
					maxWidth:400
					
			}
		]
		this.fieldsGridOptions.api.setColumnDefs(columnDefs);
	}

	populateFieldGrid(fieldData: Array<any>){
		const _self = this;
		let rowData = fieldData.map(x => this.createDataRow(x, _self));
		this.fieldsGridOptions.api.setRowData(rowData);
		// this.selectNodes(this.permissionGridOptions);
		this.fieldsGridOptions.api.sizeColumnsToFit();
	}

	createDataRow(fieldData, _self){
		var retValue = {
			fieldId: fieldData.fieldId,
			fieldName: fieldData.fieldName,
			canEdit: false,
			invisible: false,
			visible: false,
			labelField: fieldData.fieldType == 'Label'
		};
		if (fieldData.isEditable){
			retValue.canEdit = true;
		} else if (fieldData.selectedForRole){
			retValue.visible = true;
		} else {
			retValue.invisible = true;
		}
		return retValue;
 }
}
