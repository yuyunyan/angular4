import { Http, Response } from '@angular/http';
import { Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { List } from 'linqts';
import { UserRole } from './../_models/roles/userRole';
import { UserDetail } from './../_models/userdetail';
import { RoleDetails } from './../_models/roles/roleDetails';
import { ObjectTypeSecurity } from './../_models/roles/objectTypeSecurity';
import { UserNavigationRole } from './../_models/roles/userNavigationRole';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Injectable()
export class UsersService{

	private userRoleTypeSubject = new Subject<number>();
	private userFilterTypeSubject = new Subject<any>();

	constructor(private httpService:HttpService){
	}

	getUsers(showActiveUser,searchString){
		let activeOnly = showActiveUser? showActiveUser:false;
		let url = 'api/user/userlist?isenabled=' + activeOnly + '&startrow=0'+ '&endrow=50'+'&searchString='+searchString;
		return this.httpService.Get(url);
	}

	getAllUsers(){
		let url= 'api/user/userlist?isenabled=true&startrow=0&endrow=50'+'&searchString=';
		return this.httpService.Get(url).map(data => {
				
			let res = data.json();
			var users = new Array<UserDetail>();
			res.forEach(element => {
				let user = new UserDetail();
				user.UserID = element.UserID,
				user.FirstName = element.FirstName;
				user.LastName = element.LastName;
				user.EmailAddress = element.EmailAddress;
				user.LastLogin = element.dateLastLogin;
				user.OrganizationID = element.OrganizationID;
				
				users.push(user);
			});
			return users;
		});
	}

	getBuyers(sortByFirstName:boolean = false){
		let url='api/user/buyerlist?sortByFirstName=' + sortByFirstName;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			var users = new Array<UserDetail>();
			res.forEach(element => {
				let user = new UserDetail();
				user.UserID = element.UserID,
				user.FirstName = element.FirstName;
				user.LastName = element.LastName;
				user.EmailAddress = element.EmailAddress;
				user.LastLogin = element.dateLastLogin;
				user.OrganizationID = element.OrganizationID;
				users.push(user);
			});

			return users;
		});
	}

	getTimeZones(){
		let url='api/common/Timezones';
		return this.httpService.Get(url);
	}

	setUserStatus(userId: number, status:boolean){
		let url='api/user/updateAccountSatus';
		return this.httpService.Post(url, {userId:userId, isEnabled: status});
	}

	validatePassword(EmailAddress: string, currentPassword:string){
		let url='api/user/validate';
		let payload = {
			emailaddress:EmailAddress,
			password:currentPassword
		}
		return this.httpService.Post(url, payload);
	}
	
	getUser(userId: number){
		let url='api/user/getuser/?userid=' + userId;
		return this.httpService.Get(url);
	}

	updateUser(userId,username,emailaddress,password,firstname,lastname,phoneNumber,organizationId,timezoneName, isEnabled){
		let url='api/user/update';
		const payload = {
			userid:userId,
			username:username,
			emailaddress:emailaddress,
			password:password,
			firstname:firstname,
			lastname:lastname,
			phoneNumber:phoneNumber, 
			organizationId:organizationId,
			timezoneName:timezoneName,
			isEnabled: isEnabled
		};
		return this.httpService.Post(url, payload);
	}

	getRolesByUser(userId:number){
		let url='api/roles/getuserroles?userId='+userId
		return this.httpService.Get(url).map(
			data =>{
			let res = data.json();
			var userRoles = new Array<UserRole>();
			res.roles.forEach(element => {
				let user = new UserRole();
				user.userRoleId = element.userRoleId;
				user.objectTypeName = element.objectTypeName;
				user.roleId= element.roleId;
				user.roleName= element.roleName;
				user.filterObject = element.filterObject;
				user.filterTypeId = element.filterTypeId;
				user.filterObjectId = element.filterObjectId;
				user.filterObjectTypeId = element.filterObjectTypeId;
				user.objectTypeId = element.objectTypeId;
				user.typeDescription = element.typeDescription;
				user.typeSecurityId = element.typeSecurityId;
				userRoles.push(user);
			});
			return { results:userRoles, error : null };
			
		},error =>{
			console.log("call service failed");
		});

	}

	saveUserRoles(payload){
		let url='api/roles/saveUserRole';
		return this.httpService.Post(url, payload).map(data => {
			let res = data.json();
			let user = new UserRole();
			user.userRoleId = res.userRoleId;
			user.objectTypeName = res.objectTypeName;
			user.roleId= res.roleId;
			user.roleName= res.roleName;
			user.filterObject = res.filterObject;
			user.filterTypeId = res.filterTypeId;
			user.filterObjectId = res.filterObjectId;
			user.filterObjectTypeId = res.filterObjectTypeId;
			user.objectTypeId = res.objectTypeId;
			user.typeDescription = res.typeDescription;
			user.typeSecurityId = res.typeSecurityId;
			return {isSuccess: res.isSuccess, userRole: user};
		});
	}

	getAllRoles(){
		let url = 'api/roles/getAllRoles';
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let roleOptions = new Array<RoleDetails>();
			res.roles.forEach(element => {
				let roleOption = new RoleDetails();
				roleOption.roleId = element.roleId;
				roleOption.roleName = element.roleName;
				roleOption.objectTypeId = element.objectTypeId;
				roleOptions.push(roleOption);
			});
			return roleOptions;
		});
	}

	getObjectTypeSecurities(){
		let url = 'api/roles/getObjectTypeSecurities';
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			var objectTypeSecurities = new Array<ObjectTypeSecurity>();
			res.objectTypeSecurities.forEach(element => {
				let otSecurity = new ObjectTypeSecurity();
				otSecurity.objectTypeId = element.objectTypeId;
				otSecurity.typeDescription = element.typeDescription;
				otSecurity.typeSecurityId = element.typeSecurityId;
				otSecurity.filterTypeId = element.filterTypeId;
				otSecurity.filterObjectTypeId = element.filterObjectTypeId;
				objectTypeSecurities.push(otSecurity);
			});
			return objectTypeSecurities;
		});
	}

	getTypeOptions(){
		let url = 'api/roles/getTypeOptions';
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			var typeOptions = new Array<any>();
			res.types.forEach(element => {
				let typeOption = {
					objectTypeId: element.objectTypeId,
					objectName: element.objectName
				};
				typeOptions.push(typeOption);
			});
			return typeOptions;
		});
	}

	getFilterObjects(){
		let url = 'api/roles/getFilterObjectList';
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			let filterObjects = new Array<any>();
			res.filterObjects.forEach(element => {
				let filterObject = {
					objectId: element.objectId,
					objectTypeId: element.objectTypeId,
					objectName: element.objectName
				};
				filterObjects.push(filterObject);
			});
			return filterObjects;
		});
	}

	getUserRoleData(userId:number){
		return Observable.forkJoin(
			this.getRolesByUser(userId),
			this.getObjectTypeSecurities(),
			this.getAllRoles(),
			this.getTypeOptions(),
			this.getFilterObjects()
		);
	}

	typeSelected(objectTypeId: number){
		this.userRoleTypeSubject.next(objectTypeId)
	}

	getTypeObjectTypeId(): Observable<number>{
		return this.userRoleTypeSubject.asObservable();
	}

	filterSelected(filterType: any){
		this.userFilterTypeSubject.next(filterType)
	}

	getFilterObjectTypeId(): Observable<any>{
		return this.userFilterTypeSubject.asObservable();
	}

	getNavigationRolesForUser(userId: number){
		let url = 'api/roles/getNavigationRoles?userId=' + userId;
		return this.httpService.Get(url).map(data => {
			let res = data.json();
			const navigationRoles = _.map(res.navigationRoles, (element) => {
				let navRole = new UserNavigationRole();
				navRole.roleId = element.roleId;
				navRole.roleName = element.roleName;
				navRole.userRoleId = element.userRoleId;
				navRole.isDeleted = element.isDeleted;
				navRole.checked = navRole.userRoleId? !navRole.isDeleted: false;
				return navRole;
			});
			return navigationRoles;
		});
	}

	setNavigationRoleForUser(payload){
		let url = 'api/roles/setNavigationRole';
		return this.httpService.Post(url, payload).map(data => {
			let res = data.json();
			const navRole = res.navigationRole;
			let navigationRole: UserNavigationRole;
			navigationRole = {
				roleId: navRole.roleId,
				roleName: navRole.roleName,
				userRoleId: navRole.userRoleId,
				isDeleted: navRole.isDeleted,
				checked: navRole.userRoleId? !navRole.isDeleted: false
			};
			return navigationRole;
		});
	}


}
