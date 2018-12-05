import { Component, ViewEncapsulation } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { Contacts } from './../../../_models/contactsAccount/contacts';
import * as _ from 'lodash';

@Component({
	selector: 'az-account-group',
	templateUrl: './account-group-master.component.html',
	styleUrls: ['account-group-master.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AccountGroupComponent {
	private groupDetailPermissions: Array<FieldPermission>;
	private selectedAccountGroupId: number;
	private onReadonly: boolean = true;
	private selectedGroupName: string = '';
	private groupName: string = '';
	private groupLinesData: Array<any>;
	private currentGroupLines;

	constructor(
		private _notificationsService: NotificationsService,
		private accountsService: AccountsContactsService
	) {
	}

	onNewGroupBtnClicked(){
		const _self = this;
		_self.selectedAccountGroupId = 0;
		_self.selectedGroupName = '';
		_self.groupName = '';
		_self.groupLinesData = [];
		_self.groupDetailPermissions = this.accountsService.getAccountGroupDetailPermissions();
		_self.currentGroupLines = []
		this.onReadonly = false;
	}

	onGroupRowClicked(accountGroup){
		const _self = this;
		if (accountGroup && accountGroup.accountGroupId == -1){
			_self.selectedAccountGroupId = undefined;
			_self.selectedGroupName = '';
			_self.groupName = '';
			_self.groupLinesData = [];
			_self.currentGroupLines = []
			_self.onReadonly = true;
			return;
		}
		_self.selectedAccountGroupId = accountGroup.accountGroupId;
		_self.selectedGroupName = accountGroup.groupName;
		_self.groupDetailPermissions = this.accountsService.getAccountGroupDetailPermissions();

		this.accountsService.getAccountGroupDetail(accountGroup.accountGroupId).subscribe(data => {
			// console.log(data);
			_self.groupName = (data.groupName? data.groupName : _self.selectedGroupName) + '';
			_self.groupLinesData = _.map(data.groupLines, gl => {
				let contact = new Contacts();
				contact.contactId = gl.contactId;
				contact.contactName = gl.contactName;
				return {
					contact: contact,
					accountName: gl.accountName,
					accountId: gl.accountId,
					accountTypes: gl.accountTypes,
					groupLineId: gl.groupLineId
				}
			});
			_self.onReadonly = true;
			_self.currentGroupLines = _.map(_self.groupLinesData, gld => gld);
		});
	}

	onFormStatusChange(event: string) {
		const _self = this;
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {
			_self.groupName = _self.selectedGroupName + '';
			_self.currentGroupLines = _.map(_self.groupLinesData, gl => gl);
      this.onReadonly = true;
    } else if (event == 'save') {
			_self.saveClicked();
    }
	}

	saveClicked(){
		const _self = this;
		if (_self.groupName == ''){
			_self._notificationsService.alert("Invalid group name, group name can not be empty");
			return;
		}
		const invalidGroupLine = _.some(_self.currentGroupLines, cgl => {
			return !cgl.accountId
		});

		if (invalidGroupLine){
			_self._notificationsService.alert("Please complete all required group line fields");
			return;
		}
		// console.log('Previous', this.groupLinesData);
		const groupLineIds = _.filter(_.map(_self.currentGroupLines, gl => gl.groupLineId), id => id && id > 0);
		// console.log('Current', this.currentGroupLines);
		// console.log('Current Ids', groupLineIds);
		
		let accountGroupLines = _.map(this.currentGroupLines, gl => {
			return {
				groupLineId: gl.groupLineId,
				accountId: gl.accountId,
				contactId: gl.contact? gl.contact.contactId: null,
				isDeleted: 0
			};
		});

		_.forEach(_self.groupLinesData, oldLine => {
			if (!_.includes(groupLineIds, oldLine.groupLineId)){
				accountGroupLines.push({
					groupLineId: oldLine.groupLineId,
					accountId: oldLine.accountId,
					contactId: oldLine.contact? oldLine.contact.contactId: null,
					isDeleted: 1
				});
			}
		});

		const payload = {
			accountGroupId: _self.selectedAccountGroupId,
			groupName: _self.groupName,
			isDeleted: 0,
			accountGroupLines: accountGroupLines
		};

		this.accountsService.saveAccountGroupDetail(payload).subscribe(data => {
			// console.log('AccountGroupId', data)
			if (data && data.accountGroupId){
				this.accountsService.onAccountGroupChanged(data.accountGroupId)
				this.onReadonly = true;
			}
		});
	}
}
