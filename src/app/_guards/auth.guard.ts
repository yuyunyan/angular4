import { Router, NavigationStart, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from './../_services/permissions.service';
import {ObjectTypeEnum} from './../_models/shared/objectTypeEnum';



@Injectable()
export class AuthGuard implements CanActivate {
	private userPermission = 'userPermission';
	private objectId;
	constructor(
		private router: Router,
		private ngxPermissionsService: NgxPermissionsService,
		private permissionService: PermissionService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
		let url = window.location.href;
		let inAppUrl;
		if (localStorage.getItem('currentUser')) {
			// logged in so return true
			if (localStorage.getItem(this.userPermission)) {
				this.router.events.subscribe((event) => {
					if (event instanceof NavigationStart) {
						inAppUrl = event.url.toString();
						return this.checkRolePageAccess(inAppUrl);
		
					}
				})
				const permissionList = JSON.parse(localStorage.getItem(this.userPermission));
				this.ngxPermissionsService.loadPermissions(permissionList);
				this.checkNavPageAccess(url);
				return this.checkRolePageAccess(url);

			}
			else {
				this.router.navigate(['/login']);
				return Observable.of(false);
			}


		}
		// not logged in so redirect to login page with the return url
		else {
			this.router.navigate(['/login'], { queryParams: {returnUrl: state.url} })
			return Observable.of(false);
		}
	}




	checkNavPageAccess(url) {
		const permissions = this.ngxPermissionsService.getPermissions();
		if ((url.includes('sales-orders') && !permissions['sales-orders']) || (url.includes('purchase-orders') && !permissions['purchase-orders'])
			|| (url.includes('quotes') && !permissions['quotes']) || (url.includes('accounts') && !permissions['accounts/customers'])) {
			this.router.navigate(['pages/unauthorized']);
		}
	}


	checkRolePageAccess(url) {
		if (url.includes('sales-orders/sales-order-details') || url.includes('purchase-orders/purchase-order-details')
			|| url.includes('accounts/account-details') || url.includes('accounts/contact-details')
			|| url.includes('quotes/quote-details') || url.includes('bom/search') || url.includes('rfqs/rfq-detail')
			|| url.includes('accounts/contact-details') || url.includes('quality-control/inspections-details') || url.includes('items/items/item-details')) {
			let objectTypeId;
			let regex;
			if (url.includes('sales-orders')) {
				regex = /soId=([^;]*)/;

				objectTypeId = ObjectTypeEnum.salesOrderObjectTypeId;
			} else if (url.includes('purchase-orders')) {
				regex = /purchaseOrderId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.purchaseOrderTypeId;
			} else if (url.includes('accounts/contact-details')) {
				regex = /contactId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.contactTypeId;
			} else if(url.includes('accounts/account-details')){
				regex = /accountId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.accountObjectTypeId;
			}
			 else if (url.includes('quotes')) {
				regex = /quoteId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.quoteObjectTypeId;
			} else if (url.includes('bom/search')) {
				regex = /bomListId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.bomObjectTypeId;
			} else if (url.includes('rfqs')) {
				regex = /rfqId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.vendorRfqTypeId;
			}else if(url.includes('inspections-details')){
				regex=  /inspectionId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.inspectionTypeId
			}else if(url.includes('items/items/item-details')){
				regex = /itemId=([^;]*)/;
				objectTypeId = ObjectTypeEnum.itemTypeId;

			}
			var matches = url.match(regex);
			if(matches){
				this.objectId = matches[1];
				return this.permissionService.checkObjectLevelPermissions(this.objectId,objectTypeId).map(
					data=> {
						if (data) {
							return true;
						}else{
							this.router.navigate(['pages/unauthorized']);
							return false;
						}
					}
				)
			}else{
				return Observable.of(true);
			}
		} else {
			return Observable.of(true);
		}


	}



}
