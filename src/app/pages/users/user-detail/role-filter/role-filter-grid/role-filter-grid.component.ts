import { Component, ViewEncapsulation, Input, SimpleChanges } from '@angular/core';
import { UsersService } from './../../../../../_services/users.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GridOptions, ColumnApi } from "ag-grid";
import { RoleObjectType } from './../../../../../_models/roles/roleObjectType';
import { List } from 'linqts';
import { NotificationsService } from 'angular2-notifications';
import { UserRole } from './../../../../../_models/roles/userRole';
import { UserRoleSelectEditorComponent } from './../user-role-select-editor/user-role-select-editor.component';
import { CustomHeaderComponent } from './../../../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'az-role-filter-grid',
  templateUrl: './role-filter-grid.component.html',
	styleUrls: ['./role-filter-grid.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class RoleFilterGridComponent {
	@Input() userId: number;
	private generalRolesGrid: GridOptions;
  private userRoles: Array<UserRole>;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private filterTypeOptions: Array<any>;
	private roleOptions: Array<any>;
	private typeOptions: Array<any>;
	private filterObjectOptions: Array<any>;

  constructor(
		private usersService: UsersService,
		private _notificationsService: NotificationsService) {
		const _self = this;
		_self.generalRolesGrid = {
			enableColResize: false,
			rowHeight: 30,
			headerHeight: 30,
			editType: 'fullRow',
			suppressContextMenu:true,
			toolPanelSuppressSideButtons:true,
			defaultColDef:{suppressMenu:true},
      onRowEditingStopped: function(event){
				_self.saveRow(event,_self)
			},
      	};
	}

	ngOnChanges(changes: SimpleChanges) {
		const userIdChanges = changes.userId;
		if (userIdChanges && userIdChanges.currentValue){
			this.populateGrids();
		}
	}
	
	populateGrids(){
		const _self = this;
		this.usersService.getUserRoleData(this.userId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				_self.filterTypeOptions = data[1];
				_self.filterObjectOptions = _self.addAllOptions(data[1], _.concat([], data[4]));
				_self.roleOptions = data[2];
				_self.typeOptions = data[3];
				_self.createGeneralRolesGrid();
				_self.userRoles = data[0].results;
				_self.populateNonNavGrid(_self.userRoles);
			});
	}
	
	addAllOptions(filterTypeOptions, filterObjectOptions){
		let filterObjectTypeIds = _.uniq(_.map(filterTypeOptions, o => o.filterObjectTypeId));
		let allObjectOptions = new Array<any>(); 
		filterObjectTypeIds.forEach(objectTypeId => {
			let filterObject = {
				objectId: 0,
				objectTypeId: objectTypeId,
				objectName: 'All'
			};
			allObjectOptions.push(filterObject)
		});
		return _.concat(allObjectOptions, filterObjectOptions);
	}

  createGeneralRolesGrid(){
    var _self = this;
    let columnDefs = [
      {
        headerName: 'Type',
				field: 'type',
				width: 185,
				editable: true,
				cellEditorFramework: UserRoleSelectEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellEditorParams: {
					values: _self.typeOptions
						.map(x => {return {
							id:x.objectTypeId,
							name:x.objectName,
							objectTypeId: null
						}})
				}
      },
      {
        headerName: 'Role',
				field: 'role',
				editable: true,
				width: 195,
				cellEditorFramework: UserRoleSelectEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellEditorParams: {
					values: _self.roleOptions
						.map(x => {return {
							id:x.roleId,
							name:x.roleName,
							objectTypeId: x.objectTypeId
						}})
				}
      },
      {
        headerName: 'Filter',
				field: 'filterType',
				editable: true,
				width: 350,
				cellEditorFramework: UserRoleSelectEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellEditorParams: {
					values: _self.filterTypeOptions
						.map(x => {return {
							id:x.typeSecurityId,
							name:x.typeDescription,
							objectTypeId: x.objectTypeId,
							filterObjectTypeId: x.filterObjectTypeId,
							filterTypeId: x.filterTypeId
						}})
				}
			},
			{
        headerName: 'Value',
				field: 'filterObject',
				editable: true,
				width: 350,
        cellEditorFramework: UserRoleSelectEditorComponent,
				cellRenderer: _self.selectCellRenderer,
				cellEditorParams: {
					values: _self.filterObjectOptions.map(x => {return {
						id:x.objectId,
						name:x.objectName,
						objectTypeId: x.objectTypeId
					}})
				}
			},
			{
        headerName: "",
		field: "",
		lockedPin: true,
		pinned: 'right',
				headerClass: "grid-header",
				// headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
				// headerComponentParams: { menuIcon: 'fa-ban' },
        cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
        },
				width: 30,
				minWidth: 30,
      }
		];
		this.generalRolesGrid.api.setColumnDefs(columnDefs);
	}
	
	selectCellRenderer(params) {
		return params.value? params.value.name: '';
  }
	
  populateNonNavGrid(userRoles: Array<UserRole>){
		const _self = this;
		let dataSource = [];
		
		userRoles.forEach(element=>{
			let securityType = _.find(_self.typeOptions, (x) => x.objectTypeId == element.objectTypeId);
			let filterType =  _.find(_self.filterTypeOptions, (x) => x.typeSecurityId == element.typeSecurityId);
			let filterObject = _.find(_self.filterObjectOptions, (x) => x.objectId == element.filterObjectId && x.objectTypeId == element.filterObjectTypeId);
			let role = _.find(_self.roleOptions, (x) => x.roleId == element.roleId);

			if (filterType.filterTypeId == 1) {
				filterObject = _.find(_self.filterObjectOptions, (x) => x.objectId == element.filterObjectId && x.objectTypeId == 32);
			}

			dataSource.push({
				userRoleId: element.userRoleId,
				type: {
					id: securityType? securityType.objectTypeId: null,
					name: securityType? securityType.objectName: null
				},
				role: {
					id: role? role.roleId: null,
					name: role? role.roleName: null
				},
				filterType: {
					id: filterType ? filterType.typeSecurityId : null,
					name: filterType ? filterType.typeDescription : null,
					filterTypeId: filterType? filterType.filterTypeId: null,
					filterObjectTypeId: filterType? filterType.filterObjectTypeId: null
				},
				filterObject: {
					id: filterObject? filterObject.objectId: null,
					name: filterObject? filterObject.objectName: null
				},
				objectTypeId: element.objectTypeId
			});
		});
    this.generalRolesGrid.api.setRowData(dataSource);
	}
	
	saveRow(event, _self){
		let userRoleId = event.node.data.userRoleId;
		let payload = {
			typeSecurityId: event.node.data.filterType.id,
			roleId: event.node.data.role.id,
			filterObjectId: event.node.data.filterObject.id,
			userRoleId: event.node.data.userRoleId,
			userId: +_self.userId,
			isDeleted: 0
		};
		_self.usersService.saveUserRoles(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully saved the role',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				// if (!userRoleId) {
				// 	_self.userRoles = _.map(_self.userRoles, userRole => {
				// 		return userRole.userRoleId? userRole: _.assign(new UserRole(), userRole, data.userRole);
				// 	});
				// 	_self.populateNonNavGrid(_self.userRoles);
				// }
				_self.populateGrids();
			}
		});
	}

	deleteCellRenderer(_self, rowData){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-ban';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this role?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.onDeleteClicked(_self, rowData);
			}, function(){
				
			});
		})
		div.appendChild(anchor);
		return div;
	}

	onDeleteClicked(_self, rowData){
		let payload = {
			typeSecurityId: rowData.filterType.id,
			roleId: rowData.role.id,
			filterObjectId: rowData.filterObject.id,
			userRoleId: rowData.userRoleId,
			userId: +_self.userId,
			isDeleted: 1
		};
		_self.usersService.saveUserRoles(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully deleted the role.',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				const deletedRow = _.find(_self.userRoles, userRole => userRole.userRoleId == data.userRole.userRoleId);
				_self.userRoles = _.without(_self.userRoles, deletedRow);
				_self.populateNonNavGrid(_self.userRoles);
			}
		});
	}

	onAddRole(){
		const _self = this;
		const newUserRole = _self.createNewUserRole();
    
    _self.userRoles.push(newUserRole);
    _self.populateNonNavGrid(_self.userRoles);

    let rowIndex = _self.userRoles.length - 1;
    this.startEditingRow(rowIndex);  
    this.setHeightOfGrid();
	}

	startEditingRow(rowIndex) {
    this.generalRolesGrid.api.setFocusedCell(rowIndex, 'type');
    
    this.generalRolesGrid.api.startEditingCell({
			rowIndex: rowIndex,
			colKey: 'type',
			keyPress: null
    });
	}

	setHeightOfGrid() {
		let heightTxt = document.getElementById('generalRolesGrid').style.height;
    document.getElementById('generalRolesGrid').style.height = (parseInt(_.replace(heightTxt, 'px', '')) + 30)+'px';
  }
	
	createNewUserRole() {
		const _self = this;
		const defaultRole = _.find(_self.roleOptions, o => o.objectTypeId == 1);
		const defaultFilterType = _.find(_self.filterTypeOptions, o => o.objectTypeId == 1);
		let defaultFilterObject;

		defaultFilterObject = defaultFilterType 
			? _.find(_self.filterObjectOptions, o => 
				o.objectTypeId == 32)
			: null;

		let newUser = new UserRole();
		newUser.userRoleId = null;
    newUser.roleId = defaultRole? defaultRole.roleId: null,
    newUser.roleName = defaultRole? defaultRole.roleName: "";
    newUser.objectTypeName = "Account";
    newUser.objectTypeId = 1;
    newUser.filterTypeId = defaultFilterType? defaultFilterType.filterTypeId: null,
    newUser.filterObject = defaultFilterObject? defaultFilterObject.objectName: null;
    newUser.filterObjectId = defaultFilterObject? defaultFilterObject.objectId: null;
    newUser.filterObjectTypeId = defaultFilterType? defaultFilterType.filterObjectTypeId: null;
    newUser.typeSecurityId = defaultFilterType? defaultFilterType.typeSecurityId: null;
    newUser.typeDescription = defaultFilterType? defaultFilterType.typeDescription: null;
		
		return newUser;
  }
}
