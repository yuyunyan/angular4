import { Component, OnInit, ViewEncapsulation, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { RolesService } from './../../../_services/roles.service';
import { NavigationLink, Permission, Field, RoleDetails } from './../../../_models/roles/roleDetails';
import { RoleObjectType } from './../../../_models/roles/roleObjectType';
import { List } from 'linqts';
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'az-roles-list',
	templateUrl: './roles-list.component.html',
	styleUrls: ['roles-list.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RolesListComponent implements OnDestroy {

	@Output() onRoleRowClicked: EventEmitter<number>;
	@Output() onNewRoleBtnClicked: EventEmitter<any>;

	private gridOptions: GridOptions;
	public userData = [];
	private isDeleted: boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private searchString: string = '';

	constructor(private rolesService: RolesService, private _notificationsService: NotificationsService) {
		this.onRoleRowClicked = new EventEmitter<number>();
		this.onNewRoleBtnClicked = new EventEmitter<number>();
		this.gridOptions = {
			rowHeight: 30,
			headerHeight: 30,
			suppressContextMenu:true,
			rowSelection: "single",
			toolPanelSuppressSideButtons:true,
		    defaultColDef:{suppressMenu:true}
		};

		this.rolesService.getRoleCreationStatus().subscribe(data => {
			if (data && data.roleId){
				this.populateRoleListGrid();
			}
		});
	}

	ngOnInit() {
		this.createRoleListGrid();
		this.populateRoleListGrid();
	}

	searchRoles(){
		this.populateRoleListGrid();
	}

	populateRoleListGrid(){
		this.rolesService.GetRoleList(this.searchString)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				let dataSource = [];
				if (!data.error && data.results) {
					let results = data.results;
					results.forEach(element => {
						dataSource.push({
							roleName: element.name,
							type: element.type,
							roleId: element.id
						});
					});
					this.userData = dataSource;
					this.gridOptions.rowSelection = "single";
				}
				this.gridOptions.api.sizeColumnsToFit();
		});
	
	}

	createRoleListGrid(){
		this.gridOptions.columnDefs = [
			{
				headerName: 'Role Name',
				field: "roleName",
				
			},
			{
				headerName: 'Type',
				field: "type",
				
				
			},
			{
				headerName: '',
				field: 'roleId',
				hide: true
			}
		];
	}

	addNewRole() {
		this.onNewRoleBtnClicked.emit();
	}

	onRowClicked(node){
		this.onRoleRowClicked.emit(node.data.roleId);
	}
    
  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }
}
