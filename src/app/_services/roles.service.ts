import { Injectable } from '@angular/core';
import {HttpService} from './httpService';
import {Role} from './../_models/roles/role';
import { RoleDetails, Permission, Field, NavigationLink, NavTree } from './../_models/roles/roleDetails';
import { RoleTypeOption } from './../_models/roles/roleTypeOption';
import {Observable} from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {ServiceResponse} from './../_models/common/serviceResponse';
import { List } from 'linqts';
import * as _ from 'lodash';
import { FieldPermission } from '../_models/permission/FieldPermission';

@Injectable()
export class RolesService{
	private newRoleSubject = new Subject<any>();
	constructor(private httpService: HttpService){}
	
	GetRoleList(searchString: string){
		return this.httpService.Get("api/user/getrolelist?searchString=" + searchString)
			.map(data => {
				let res = data.json();
				let rolesList = new Array<Role>();
				res.data.forEach(element => {
					let role = new Role();
					role.id = element.roleId;
					role.name = element.roleName;
					role.type = element.type;
					role.objectTypeId = element.objectTypeId;
					rolesList.push(role);
				});
				return { results: rolesList, error: null };
		});
	}

	GetRoleDetails(roleId: Number) : Observable<RoleDetails>{
		let url = "api/roles/getdetails?roleId=" + roleId;
		return this.GetRoleData(url);
	}

	GetRoleDataToCreate(objectTypeId: number) : Observable<RoleDetails>{
		let url = "api/roles/getDetailsToCreate?objectTypeId=" + objectTypeId;
		return this.GetRoleData(url);
	}

	GetRoleData(url: string):Observable<RoleDetails>{
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let apiResponseData = res.data;
			let response = new RoleDetails();
			response.objectTypeId = apiResponseData.objectTypeId; 
			response.roleName = apiResponseData.roleName;
			response.roleId = apiResponseData.roleId;

			//Permissions
			let permissionList = new Array<Permission>();
			_.forEach(apiResponseData.permissions, (element) => {
				let permission = new Permission();
				permission.permissionId = element.permissionId;
				permission.permName = element.permName;
				permission.description = element.description;
				permission.selectedForRole = element.selectedForRole;
				permission.roleId = element.roleId;
				permissionList.push(permission);
			});
			response.permissions = permissionList;  
			
			// Fields
			let fieldList = new Array<Field>();
			_.forEach(apiResponseData.fields, (element) => {
				let field = new Field();
				field.fieldId = element.fieldId;
				field.fieldName = element.fieldName;
				field.selectedForRole = element.selectedForRole;
				field.isEditable = element.isEditable;
				field.fieldType = element.fieldType;
				fieldList.push(field);
			});
			response.fields = fieldList; 

			// NavLinks
			let navigationLinks = new Array<NavTree>();
			_.forEach(apiResponseData.navigationLinks, (element) => {
				let navLink = new NavTree();
				navLink.id = element.navId;
				navLink.name = element.navName;
				navLink.roleId = element.roleId;
				if(element.childNodes) {
					navLink.children = new Array<NavTree>();
					_.forEach(element.childNodes, (childLink) => {
						let subLink = new NavTree();
						subLink.id = childLink.navId;
						subLink.name = childLink.navName;
						subLink.checked = childLink.selectedForRole;
						subLink.roleId = childLink.roleId;
						navLink.children.push(subLink);
						navLink.isExpanded = true;     
					});
					navLink.checked = _.every(navLink.children, cd => cd.checked);
					navLink.indeterminate = _.some(navLink.children, cd => cd.checked);
				} else {
					navLink.checked = element.selectedForRole;
				}
				navigationLinks.push(navLink);
			});
			response.navigationLinks = navigationLinks; 
			return response;	
		});
	}
		
	InsertUpdateRole(payload){   
		let url = 'api/roles/insertUpdateDeleteRole';
		return this.httpService.Post(url,payload).map(data => {
			let res = data.json();
			return res;
		});
	}
	
	getRoleTypeOptions(){
		let url = 'api/roles/getRoleTypeOptions';
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let roleTypeOptions = new Array<RoleTypeOption>();
			_.forEach(res.roleTypeOptions, (element) => {
				let option = new RoleTypeOption();
				option.id = element.objectTypeId;
				option.name = element.objectName;
				roleTypeOptions.push(option);
			});
			return roleTypeOptions;
		});
	}

	getRoleDetailPermissions(): Array<FieldPermission>{
		return [
			{
				name: "Role Name",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Role Type",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Permissions",
				canEdit: true,
				fieldId: 0
			},
			{
				name: "Navigation Links",
				canEdit: true,
				fieldId: 0
			}
		];
	}

	newRoleCreated(roleId: number){
		this.newRoleSubject.next({roleId: roleId})
	}

	getRoleCreationStatus(): Observable<any>{
		return this.newRoleSubject.asObservable();
	}

}
