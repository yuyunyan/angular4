import { Component, OnInit, ViewEncapsulation, OnDestroy, Output, EventEmitter } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { NavigationLink, Permission, Field, RoleDetails } from './../../../_models/roles/roleDetails';
import { RoleObjectType } from './../../../_models/roles/roleObjectType';
import { List } from 'linqts';
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
	selector: 'az-account-group-list',
	templateUrl: './account-group-list.component.html',
	styleUrls: ['account-group-list.component.scss'],
//	encapsulation: ViewEncapsulation.None
})

export class AccountGroupListComponent implements OnDestroy {

	@Output() onGroupRowClicked: EventEmitter<any>;
	@Output() onNewGroupBtnClicked: EventEmitter<number>;

	private gridOptions: GridOptions;
	public userData = [];
	private isDeleted: boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	// private searchString: string = '';

	constructor(
		private accountsService: AccountsContactsService, 
		private _notificationsService: NotificationsService)
	{
		this.onGroupRowClicked = new EventEmitter<any>();
		this.onNewGroupBtnClicked = new EventEmitter<number>();
		this.gridOptions = {
			rowHeight: 30,
			headerHeight: 30,
			rowSelection: "single",
			toolPanelSuppressSideButtons:true,
			defaultColDef:{suppressMenu:true},
			suppressContextMenu:true
			
		};

		this.accountsService.getAccountGroupModalStatus().subscribe(data => {
			if (data && data == 1){
				if (this.gridOptions.api){
					this.gridOptions.api.sizeColumnsToFit()	
				}
			}
		});

		this.accountsService.getAccountGroupChangeStatus().subscribe(accountGroupId => {
			if (accountGroupId && accountGroupId > 0){
				this.accountsService.getAccountGroupList()
					.takeUntil(this.ngUnsubscribe.asObservable())
					.subscribe(data => {
						let dataSource = [];
						if (!data.error && data.accountGroups) {
							let results = data.accountGroups;
							results.forEach(element => {
								dataSource.push({
									groupName: element.groupName,
									accountGroupId: element.accountGroupId
								});
							});
							this.userData = dataSource;
							this.gridOptions.rowSelection = "single";
							const accountGroup = _.find(this.userData, ag => ag.accountGroupId == accountGroupId);
							if (accountGroup){
								this.onGroupRowClicked.emit({
									accountGroupId: accountGroup.accountGroupId,
									groupName: accountGroup.groupName
								});
							}
						}
				});
			}
		});
	}

	ngOnInit() {
		this.createGroupListGrid();
		this.populateGroupListGrid();
	}

	refreshGrid(){
		console.log("quote");
		this.createGroupListGrid();
		this.populateGroupListGrid();
	}

	populateGroupListGrid(){
		this.accountsService.getAccountGroupList()
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				let dataSource = [];
				if (!data.error && data.accountGroups) {
					let results = data.accountGroups;
					results.forEach(element => {
						dataSource.push({
							groupName: element.groupName,
							accountGroupId: element.accountGroupId
						});
					});
					this.userData = dataSource;
					this.gridOptions.rowSelection = "single";
				}
		});
	}

	createGroupListGrid(){
		var _self = this;
		this.gridOptions.columnDefs = [
			{
				headerName: 'Group',
				field: "groupName",
				cellStyle: {'text-align': 'left'}
			},
			{
				headerName: "",
				field: "",
				headerClass: "grid-header",
				headerComponentFramework: <{new(): CustomHeaderComponent}> CustomHeaderComponent,
				headerComponentParams: { menuIcon: 'fas fa-times' },
        cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
        },
				width: 30,
				minWidth: 30,
      },
			{
				headerName: '',
				field: 'accountGroupId',
				hide: true
			}
		];
	}

	addNewGroup() {
		this.onNewGroupBtnClicked.emit();
	}

	deleteCellRenderer(_self, rowData){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-times';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this account group?',
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
		_self.accountsService.deleteAccountGroup(rowData.accountGroupId).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully delete the account group',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				const deletedRow = _.find(_self.userData, accountGroup => accountGroup.accountGroupId == rowData.accountGroupId);
				_self.userData = _.without(_self.userData, deletedRow);
				_self.gridOptions.api.setRowData(_self.userData);
				_self.onGroupRowClicked.emit({
					accountGroupId: -1,
					groupName: ''
				});
			}
		});
	}

	onRowClicked(node){
		this.onGroupRowClicked.emit({
			accountGroupId: node.data.accountGroupId,
			groupName: node.data.groupName
		});
	}
    
  ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
  }
}
