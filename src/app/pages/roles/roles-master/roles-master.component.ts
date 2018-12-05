import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { RolesService } from './../../../_services/roles.service';
import { RoleTypeOption } from './../../../_models/roles/roleTypeOption';
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { RoleDetails, Permission, Field, NavigationLink, NavTree } from './../../../_models/roles/roleDetails';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import * as _ from 'lodash';

@Component({
	selector: 'az-roles-master',
	templateUrl: './roles-master.component.html',
	styleUrls: ['roles-master.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class RolesMasterComponent {
	private roleName: string;;
	private roleTypeId: number;
	private selectedRoleId: number; 
	private permissionsData: Array<Permission>;
	private fieldsData: Array<Field>;
	private navTreesData: Array<NavTree>;

	private roleTypeOptions: Array<RoleTypeOption>;
	private roleType : RoleTypeOption;
	private _LockRoleType: boolean = true;
	private onReadonly: boolean = true;
	private deleteRoleClicked:boolean;

	private roleDetailPermissions: Array<FieldPermission>;

	private notifyOptions = {
		position: ["top", "right"],
		timeOut: 3000,
		lastOnBottom: true
	};

	private currentPermissions;
	private currentFields;
	private currentNavLinks;

	constructor(
		private _notificationsService: NotificationsService,
		private rolesService: RolesService
	) {
		const _self = this;
		_self.roleTypeOptions = new Array<RoleTypeOption>();

		this.rolesService.getRoleTypeOptions().subscribe(data => {
			_self.roleTypeOptions = data;
		});
	}

	onRoleRowClicked(roleId: number){
		const _self = this;
		_self.selectedRoleId = roleId;
		_self.roleDetailPermissions = this.rolesService.getRoleDetailPermissions();
		this.rolesService.GetRoleDetails(roleId).subscribe(data => {
			_self.roleName = data.roleName;
			_self.roleTypeId = data.objectTypeId;
			_self._LockRoleType = true;
			_self.roleType = _.find(_self.roleTypeOptions, (o: RoleTypeOption) => o.id == _self.roleTypeId);
			_self.permissionsData = data.permissions;
			_self.currentPermissions = data.permissions;
			_self.fieldsData = data.fields;
			_self.currentFields = data.fields;
			if (data.navigationLinks && data.navigationLinks.length > 0){
				_self.navTreesData = data.navigationLinks;
				_self.currentNavLinks = data.navigationLinks;
			}
		});
	}

	onFormStatusChange(event: string) {
		const _self = this;
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {
      this.onReadonly = true;
    } else if (event == 'save') {
			this.onReadonly = true;
			_self.saveOrUpdateRoleClicked();
    }
	}

	onDeleteClick(){
	    let _self= this;
		swal({
			title: 'Are you sure you want to delete this Role?',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Cancel'
		}).then(function() {
			_self.onDeleteRoleClicked();
		}, function(){
			
		});
	}
	onDeleteRoleClicked(){
		this.deleteRoleClicked=true;
		this.saveOrUpdateRoleClicked();	
	}
	
	onNewRoleBtnClicked(value){
		const _self = this;
		_self._LockRoleType = false;
		_self.selectedRoleId = 0;
		_self.roleName = undefined;
		_self.roleTypeId = undefined;
		_self.onReadonly = false;
		_self.roleDetailPermissions = _self.rolesService.getRoleDetailPermissions();
	}

	onTypeChange(value){
		const _self = this;
		_self.rolesService.GetRoleDataToCreate(this.roleTypeId).subscribe(data => {
			_self.permissionsData = data.permissions;
			_self.currentPermissions = data.permissions;
			_self.fieldsData = data.fields;
			_self.currentFields = data.fields;
			if (data.navigationLinks && data.navigationLinks.length > 0){
				_self.navTreesData = data.navigationLinks;
			}
		});
	}

	saveOrUpdateRoleClicked(){
		const _self = this;
		const permissionData = _.map(_.filter(this.currentPermissions, p => p.selectedForRole), permission => {
			return {PermissionID: permission.permissionId}
		});
		const fieldData = _.map(_.filter(this.currentFields, f => f.selectedForRole), field =>{
			return {FieldID: field.fieldId, CanEdit: field.isEditable? 1: 0}
		});
		const navLinkData = _.flatMap(_.filter(this.currentNavLinks, nl => nl.checked || nl.indeterminate), navLink => {
			let subNavLinks = [];
			if (navLink.children && navLink.children.length > 0){
				subNavLinks =  _.map(_.filter(navLink.children, snl => snl.checked), subNavLink => {
					return { NavID: subNavLink.id }
				});
			}
			return [...subNavLinks, {NavID: navLink.id}]
		});

		const payload ={
			roleId: _self.selectedRoleId,
			roleName: _self.roleName,
			isDeleted: _self.deleteRoleClicked? 1:0,
			objectTypeId: _self.roleTypeId,
			permissionData,
			fieldData,
			navLinkData
		};
		_self.rolesService.InsertUpdateRole(payload).subscribe(data => {
			if (data.roleId){
				this._notificationsService.success('Good Job','Successfully saved the role',{
					pauseOnHover: false,
					clickToClose: false
				});
				_self.rolesService.newRoleCreated(data.roleId);
				_self.selectedRoleId = data.roleId;
			} else {
				swal('Oops...','Something went wrong!',	'error');
			}
		});
	}
}
