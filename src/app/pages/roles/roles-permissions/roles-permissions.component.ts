import { Component, ViewEncapsulation, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi, Grid } from "ag-grid";
import { RolesService } from './../../../_services/roles.service';
import { NavigationLink, Permission, Field, RoleDetails } from './../../../_models/roles/roleDetails';
import { RoleObjectType } from './../../../_models/roles/roleObjectType';
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { CheckRowComponent } from './../../_sharedComponent/check-row/check-row.component';
import { CheckRowService } from './../../_sharedComponent/check-row/check-row.service';
import * as _ from 'lodash';

@Component({
	selector: 'az-roles-permissions',
	templateUrl: './roles-permissions.component.html',
	styleUrls: ['roles-permissions.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RolesPermissionsComponent{
	private permissionGridOptions: GridOptions;
	@Input() permissionsData;
	@Input() onReadonly;
	@Output() onSavingPermissions: EventEmitter<any>;

	private _permissionsData;
	constructor(private checkRowService: CheckRowService) {
		const _self = this;
		this.permissionGridOptions = {
			rowHeight: 30,
			headerHeight: 30,
			rowSelection: "multiple",
			suppressContextMenu:true,
			suppressRowClickSelection: true,
			toolPanelSuppressSideButtons:true,
		    defaultColDef:{suppressMenu:true}
		};
		_self.onSavingPermissions = new EventEmitter<any>();
		this.checkRowService.getCheckboxStatus().subscribe(data => {
			const toUpdatePermission = _.find(_self._permissionsData, permission => permission.permissionId == data.permissionId);
			toUpdatePermission.selectedForRole = data.checked;
			_self.onSavingPermissions.emit(_self._permissionsData);
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		const permissionDataChange = changes['permissionsData'];
		const onReadonlyChange = changes['onReadonly'];
		if (permissionDataChange && permissionDataChange.currentValue){
			this.createPermissionsGrid(false);
			this._permissionsData = _.map(this.permissionsData, pd => pd);
			// console.log(this.permissionsData)
			this.populatePermissionGrid(this._permissionsData);
		}
		if (onReadonlyChange && onReadonlyChange.currentValue && this.permissionsData){
			this.createPermissionsGrid(this.onReadonly);
			// console.log(this.permissionsData)
			this.populatePermissionGrid(this._permissionsData);
		}
  }

	createPermissionsGrid(onReadonly: boolean) {
		const _self = this;
		const columnDefs = [
			{
        headerName: '',
				field: "selectedForRole",
				cellRendererFramework: CheckRowComponent,
				width: 20,
				minWidth: 20
      },
			{
				headerName: 'Permission',
				field: "permName",
				width:200
			},
			{
				headerName: 'Description',
				field: 'description',
				width:200
			}
		];
		this.permissionGridOptions.api.setColumnDefs(columnDefs);
	}

	populatePermissionGrid(permData: Array<any>){
		const _self = this;
		let rowData = permData.map(x => this.createDataRow(x, _self));
		this.permissionGridOptions.api.setRowData(rowData);
		this.selectNodes(this.permissionGridOptions);
		this.permissionGridOptions.api.sizeColumnsToFit();
	}

	createDataRow(permData, _self){
		var retValue = {
			permName:permData.permName,
			checked: permData.selectedForRole,
			roleId: permData.roleId,
			description: permData.description,
			permissionId: permData.permissionId
		};
		return retValue;
 }

	selectNodes(gridOptions: GridOptions) {
		const _self = this;
		gridOptions.api.forEachNode(node => {
			if (node.data.checked) {
				node.setSelected(true);
			};
		});
	}
}
