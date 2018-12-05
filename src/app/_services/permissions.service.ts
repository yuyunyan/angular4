import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { FieldPermission } from './../_models/permission/FieldPermission';
import * as _ from 'lodash';

@Injectable()
export class PermissionService{
	constructor(
		private httpService: HttpService,
		private router: Router){
	}

	getUserObjectSecurities(objectId: number, objectTypeId: number){
		let url = `api/navigations/getUserObjectSecurities?objectId=${objectId}&objectTypeId=${objectTypeId}`;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			return res.userObjectSecurities || [];
		});
	}

	getFieldPermissions(objectId: number, objectTypeId: number){
		return this.getUserObjectSecurities(objectId, objectTypeId)
			.map(userObjectSecurities => {
				let fieldPermissionList = new Array<FieldPermission>();
				let objectPermissionList = new Array<string>();
				objectPermissionList = _.map(userObjectSecurities, uos => uos.name);
				_.forEach(userObjectSecurities, uos => {
					if (uos.fieldId){
						let fieldPermission = new FieldPermission();
						fieldPermission.name = uos.name;
						fieldPermission.fieldId = uos.fieldId;
						fieldPermission.canEdit = uos.canEdit;
						fieldPermissionList.push(fieldPermission);
					}
				});
				return {fieldPermissionList, objectPermissionList};
			});
	}

	checkRolePagePermissions(objectId: number, objectTypeId: number) {
		let url = `api/navigations/getUserObjectSecurities?objectId=${objectId}&objectTypeId=${objectTypeId}`;
		var _self = this;
		return this.httpService.Get(url).map(data => {
			let res = data.json() || [];
			if(res.userObjectSecurities.length == 0) {
				return false;
			}
			else
				return true;
		});
	}
	
	checkObjectLevelPermissions(objectId: number, objectTypeId: number) {
		let url = `api/navigations/getUserObjectLevelSecurities?objectId=${objectId}&objectTypeId=${objectTypeId}`;
		var _self = this;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			if(res) {
				return true;
			}
			else
				return false;
		});
	}
}
