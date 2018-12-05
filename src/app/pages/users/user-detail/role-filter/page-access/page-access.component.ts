import { Component, ViewEncapsulation, Input, SimpleChanges } from '@angular/core';
import { UsersService } from './../../../../../_services/users.service';
import { GridOptions, ColumnApi } from "ag-grid";
import { NotificationsService } from 'angular2-notifications';
import { UserNavigationRole } from './../../../../../_models/roles/userNavigationRole';
import { Subject } from 'rxjs/Subject';
import { UserRole } from '../../../../../_models/roles/userRole';
import * as _ from 'lodash';

@Component({
	selector: 'az-page-access',
	templateUrl: './page-access.component.html',
	styleUrls: ['./page-access.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class PageAccessComponent {
	@Input() userId: number;

	private navigationRoles: Array<UserNavigationRole>;
	private navRolesGrid: GridOptions;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private _loadingEnd: boolean = false;

	constructor(
		private usersService: UsersService,
		private _notificationsService: NotificationsService
	) {
		this.navRolesGrid = {
			toolPanelSuppressSideButtons: true,
			rowSelection:'multiple',
			suppressRowClickSelection:true,
			suppressContextMenu:true,
			suppressCellSelection: true,
			suppressMultiSort:true,
			editType:'fullRow',
			defaultColDef:{
				suppressMenu:true
			  },
			enableSorting: true,
			suppressDragLeaveHidesColumns: true
			


		}
		const _self = this;
		// _self.navRolesGrid = {
		// 	rowSelection: "multiple",
		// 	suppressRowClickSelection: true
		// };
	}

	ngOnChanges(changes: SimpleChanges) {
		const userIdChanges = changes.userId;
		if (userIdChanges && userIdChanges.currentValue) {
			this.createNavRolesGrid();
			this.populateGrids();
		}
	}

	populateGrids() {
		this.usersService.getNavigationRolesForUser(this.userId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.navigationRoles = data;
				this.populateNavGrid(this.navigationRoles);
			});
	}

	createNavRolesGrid() {
		const _self = this;
		this.navRolesGrid.columnDefs = [
			{
				headerName: '',
				field: "selectedForUser",
				//checkboxSelection: true,
				width: 1,
				minWidth: 1,
				cellRenderer: function(params){
					return _self.createCheckbox(params)
				},
				//cellRenderer: (params)=> _self.createCheckbox.bind(_self),
				pinned:'left'
				
			},
			{
				headerName: 'Page Access',
				field: 'pageAccess'
			}
		];
	}

	populateNavGrid(userRoles: Array<any>) {
		this._loadingEnd = false;
		let navDataSource = [];
		userRoles.forEach(element => {
			navDataSource.push({
				pageAccess: element.roleName,
				checked: element.checked,
				roleId: element.roleId,
				userRoleId: element.userRoleId
			})
		});
		this.navRolesGrid.api.setRowData(navDataSource);
		//this.selectNodes(this.navRolesGrid);
		this.navRolesGrid.api.sizeColumnsToFit();
	}

	selectNodes(gridOptions: GridOptions) {
		const _self = this;
		gridOptions.api.forEachNode(node => {
			if (node.data.checked) {
				node.setSelected(true);
			};
		});
		_self._loadingEnd = true;
	}

	createCheckbox(params){
		const _self = this;
		let checkbox = document.createElement('input');
		checkbox.type='checkbox';
		checkbox.name="name";
		checkbox.value="value";
		checkbox.checked = params.data.checked;
		checkbox.addEventListener('change',function(event){
			  _self.onRowSelected(params, this.checked);
			  
		})
		return checkbox;
	}

	testFunc(){
		alert("tessFun");
	}
    
	onRowSelected(event, checked) {	
		const _self = this;
		const eventNode = event.node.data;
		const roleId = eventNode.roleId;
		const userRoleId = eventNode.userRoleId;
		let payload: UserNavigationRole;
		payload = {
			roleId: roleId,
			userRoleId: userRoleId,
			userId: +_self.userId,
			isDeleted: checked ? 0 : 1
		};
		this.usersService.setNavigationRoleForUser(payload).subscribe(data => {
			if (!userRoleId) {
				let rowWithoutUserRoleId = _.find(_self.navigationRoles, (navRole: UserNavigationRole) => !navRole.userRoleId && roleId == navRole.roleId);
				rowWithoutUserRoleId.userRoleId = data.userRoleId;
				rowWithoutUserRoleId.checked = data.checked;
				rowWithoutUserRoleId.isDeleted = data.isDeleted;
			} else {
				let rowToUpdate = _.find(_self.navigationRoles, (navRole: UserNavigationRole) => navRole.userRoleId == userRoleId);
				rowToUpdate.isDeleted = data.isDeleted;
				rowToUpdate.checked = data.checked;
			}
			_self._notificationsService.success(
				'Good Job',
				'Successfully updated page access',
				{
					pauseOnHover: false,
					clickToClose: false
				}
			);
			_self.populateNavGrid(_self.navigationRoles);
		});
	}
}
