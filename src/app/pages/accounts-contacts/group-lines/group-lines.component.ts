import { Component, ViewEncapsulation, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { AccountTypeaheadGridComponent } from './../../_sharedComponent/account-typeheader-in-grid/account-typeheader-grid.component';
import { InputComService } from './../../../_coms/input-com.service';
import { ContactEditorComponent } from './../../_sharedComponent/contact-input/contact-input.component';
import { Contacts } from './../../../_models/contactsAccount/contacts';
import { CustomHeaderComponent } from './../../_sharedComponent/az-custom-header/az-custom-header.component';
import * as _ from 'lodash';

@Component({
	selector: 'az-group-line',
	templateUrl: './group-lines.component.html',
	styleUrls: ['group-lines.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [InputComService]
})
export class GroupLineComponent {
	private groupLinesGridOptions: GridOptions;
	@Input() groupLinesData;
	@Input() onReadonly;
	@Output() onSyncingGroupLines: EventEmitter<any>;
	private rowData;

	private _permissionsData;
	constructor() {
		const _self = this;
		this.groupLinesGridOptions = {
			rowHeight: 30,
			headerHeight: 30,
			suppressRowClickSelection: true,
			toolPanelSuppressSideButtons:true,
			suppressContextMenu:true,
			animateRows: true,
			enableGroupEdit: true,
			enableColResize: true,
			editType: 'fullRow',
			onRowEditingStopped: function(event){_self.syncGroupLines(event, _self)},
      		pagination: true,
			paginationPageSize:10
		};
		_self.onSyncingGroupLines = new EventEmitter<any>();
		// this.checkRowService.getCheckboxStatus().subscribe(data => {
		// 	const toUpdatePermission = _.find(_self._permissionsData, permission => permission.permissionId == data.permissionId);
		// 	toUpdatePermission.selectedForRole = data.checked;
		// 	_self.onSavingPermissions.emit(_self._permissionsData);
		//
	}

	ngOnChanges(changes: SimpleChanges) {
		const groupLinesDataChange = changes['groupLinesData'];
		const onReadonlyChange = changes['onReadonly'];
		if (groupLinesDataChange && groupLinesDataChange.currentValue){
			this.createGroupLinesGrid(true);
			this._permissionsData = _.map(this.groupLinesData, gl => gl);
			// console.log(this.permissionsData)
			this.populateGroupLinesGrid(this._permissionsData);
		}
		if (onReadonlyChange && this.groupLinesData){
			this.createGroupLinesGrid(this.onReadonly);
			// console.log(this.permissionsData)
			this.populateGroupLinesGrid(this._permissionsData);
		}
	}

	createGroupLinesGrid(onReadonly: boolean) {
		const _self = this;
		const columnDefs = [
			{
				headerName: 'Account',
				field: "accountName",
				headerClass: "grid-header",
				cellRenderer: _self.accountCellRenderer,
				cellEditorFramework: AccountTypeaheadGridComponent,
				editable: !onReadonly,
				width: 60,
				cellEditorParams: { values: {parentClassName : ".groupPartsContainer"} },
				cellClassRules: {
					'invalid-group-line-input': function (params) {
						return !params.data.accountId;
					}
				}
			},
			{
				headerName: 'Type',
				field: 'accountTypes',	
				headerClass: "grid-header",
				cellRenderer: _self.accountCellRenderer,
				width: 80
			},
			{
				headerName: "Contact",
				field: "contact",
				editable: !onReadonly,
				headerClass: "grid-header",
				cellRenderer: this.ContactCellRenderer,
				cellEditorFramework: ContactEditorComponent,
				width: 60
			},
			{
				headerName: "Remove",
				field: 'remove',
				headerClass: "grid-header",
				headerComponentFramework: <{ new(): CustomHeaderComponent }>CustomHeaderComponent,
				headerComponentParams: { menuIcon: 'fas fa-times' },
				cellRenderer: function (params) { return _self.deleteCellRenderer(params, _self) },
				cellStyle: { 'text-align': 'center' },
				lockedPin: true,
				pinned: 'right',
				minWidth: 20,
				width: 20,
				hide: !!onReadonly
			}
		];
		this.groupLinesGridOptions.api.setColumnDefs(columnDefs);
	}

	populateGroupLinesGrid(groupLinesData: Array<any>){
		const _self = this;
		_self.rowData= groupLinesData.map(x => this.createDataRow(x, _self));
		this.groupLinesGridOptions.api.setRowData(_self.rowData);
		this.groupLinesGridOptions.api.sizeColumnsToFit();
	}

	createDataRow(groupLineData, _self){
		let groupLineContact = new Contacts();
		groupLineContact.contactId = groupLineData.contact.contactId;
		groupLineContact.contactName = groupLineData.contact.contactName;
		var retValue = {
			contact: groupLineContact,
			accountName: groupLineData.accountName,
			accountId: groupLineData.accountId,
			accountTypes: _.join(groupLineData.accountTypes, ', '),
			groupLineId: groupLineData.groupLineId
		};
		return retValue;
 	}

	accountCellRenderer(params){
		return params.value;
	}

	addAccountToGroup(){
		const _self = this;
		if (_self.onReadonly){
			return;
		}
		const newGroupLine = {
			accountId: undefined,
			accountName: '',
			accountTypes: '',
			contact: {
				contactId: undefined,
				contactName: ''
			},
			groupLineId: undefined
		};
		_self.rowData.push(newGroupLine);
		this.groupLinesGridOptions.api.setRowData(_self.rowData);
		let rowIndex = this.rowData.length - 1;
    this.startEditingRow(rowIndex);  
	}

	startEditingRow(rowIndex){
    this.groupLinesGridOptions.api.setFocusedCell(rowIndex, 'accountName');
    
    this.groupLinesGridOptions.api.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'accountName',
      keyPress: null,
    });
  }

	syncGroupLines(event, _self){
		console.log("1");
		_self.onSyncingGroupLines.emit(this.rowData);
		
	}

	ContactCellRenderer(params) {
    if(typeof params.value !== 'undefined'){
      return params.value.firstName? params.value.firstName + ' ' + params.value.lastName: params.value.contactName;
    } else{
      return ''
    }
	}
	
	deleteCellRenderer(rowData, _self){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-times';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			if (_self.onReadonly){
				return;
			}
			swal({
				title: 'Are you sure you want to delete this account from the group?',
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
	
	onDeleteClicked(_self, rowDataSet){
    let indexToDelete = _.indexOf(_self.rowData, rowDataSet.data);
    _self.rowData.splice(indexToDelete, 1);
		_self.groupLinesGridOptions.api.setRowData(_self.rowData);
		_self.syncGroupLines(null, _self);
  }
}
