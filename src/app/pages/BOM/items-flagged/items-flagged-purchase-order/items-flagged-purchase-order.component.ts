import { Component, ViewEncapsulation, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { ContactsService } from './../../../../_services/contacts.service';
import { LocationService }  from './../../../../_services/locations.service';
import { SharedService }  from './../../../../_services/shared.service';
import { ItemsFlaggedService } from './../../../../_services/items-flagged.service';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Supplier } from './../../../../_models/shared/supplier';
import { Locations } from './../../../../_models/contactsAccount/locations';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Router} from '@angular/router';
import * as _ from 'lodash';
import { BOMsService } from './../../../../_services/boms.service';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';

@Component({
	selector: 'az-items-flagged-purchase-order',
	templateUrl: './items-flagged-purchase-order.component.html',
	styleUrls: ['./items-flagged-purchase-order.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ItemsFlaggedPurchaseOrderComponent {
	@Input() itemsFlagged;
	@Output() onCloseModal = new EventEmitter<any>();
	@ViewChild('purchaseOrderItemsFlaggedForm')
	private poFormRef;

	private poDetails = {contactEmail: '', contactPhone: '', accountId: undefined, contactId: undefined
		, toLocationID: undefined, organizationId: undefined};
	private _itemsFlagged;
	private suppliersList: Supplier[];
	private accountContacts: Contacts[];
	private nonBillingLocations: Locations[];
	private organizations: Array<any>;
	private comment: string = '';
	private billingAddress;
	private shipToAddress;
	private objectTypeIdForAccountSearch:number;	
	private dataRemote: RemoteData;
	
	private ngUnsubscribe: Subject<void> = new Subject<void>();	

	constructor(
		private purchaseOrdersService: PurchaseOrdersService,
		private contactsService: ContactsService,
		private locationsService: LocationService,
		private itemsFlaggedService: ItemsFlaggedService,
		private sharedService: SharedService,
		private bomsService: BOMsService,
		private router: Router,
		private completerService: CompleterService) {

		this.bomsService.GetPOObjectTypeID().subscribe(data=>{
			this.objectTypeIdForAccountSearch = data;
		});	

		this.suppliersList = new Array<Supplier>();
		this.accountContacts = new Array<Contacts>();
		this.nonBillingLocations = new Array<Locations>();

		this.sharedService.getSuppliersandVendors(0)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.suppliersList = data;
		});

		this.organizations = [
			{id: 13, name: "Sourceability North America, LLC"},
			{id: 1, name: "Sourceability HK Ltd."},
			{id: 7, name: "Sourceability SG PTE. Ltd."},
		];

		this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.objectTypeIdForAccountSearch
		});
		this.dataRemote.dataField("accounts");
	}

	onAccountSelected($event){
		if($event != null){
			this.poDetails.accountId = $event.originalObject.accountId;
			this.onAccountVendorChange($event.originalObject.accountId);
		}
	}

	isAccountSelected(){
		if(this.poDetails.accountId === undefined)
			return false;

		return true;
	}

	onAccountVendorChange(value: number){
		let accountId = value;
		this.poDetails.contactId = undefined;
		this.poDetails.toLocationID = undefined;
		this.billingAddress = undefined;
		this.shipToAddress = undefined;
		this.getContactList(accountId);
		this.getNonBillingLocations(accountId);
		this.populateBillToAddress(accountId);
	}

	getContactList(accountId: number){
		this.contactsService.getAccountContacts(accountId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.accountContacts = data;
		});
	}

	onContactChange(value: number){
		this.getContactDetail(value);
	}

	getContactDetail(contactId: number){
		this.sharedService.getContactBasicInfo(contactId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.poDetails.contactEmail = data? data.email: '';
				this.poDetails.contactPhone = data? data.officePhone: '';
		});
	}
	
  getNonBillingLocations(accountId: number) {
		this.locationsService.getAccountNonBillingLocations(this.poDetails.accountId)
			.takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.nonBillingLocations = data;
    });
	}

	populateBillToAddress(accountId: number){
		this.locationsService.getAccountBillingAddress(accountId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe((billingAddress) => {
				this.billingAddress = billingAddress;
			});
	}

	onShipFromChange(value){
		this.shipToAddress = _.find(this.nonBillingLocations, location => location.LocationID = value);
	}

	onGridValuesUpdated(data){
		this._itemsFlagged = data;
	}
	
	onSavePOClicked(){
		const _self = this;
		let poDetails = {
			AccountId: _self.poDetails.accountId,
			ContactId: _self.poDetails.contactId,
			ToLocationId: _self.poDetails.toLocationID,
			OrganizationId: _self.poDetails.organizationId
		};
		let postItemsFlagged = _self._itemsFlagged ? _self._itemsFlagged: _self.itemsFlagged;
		postItemsFlagged = postItemsFlagged ? postItemsFlagged : [];
		postItemsFlagged = _.filter(postItemsFlagged, item => item.itemId > 0);
		_self.itemsFlaggedService.newPurchaseOrderSet(poDetails, _self.comment, postItemsFlagged)
			.takeUntil(_self.ngUnsubscribe.asObservable())
			.subscribe(res => {
				console.log(res);
				if (res['isSuccess']) {
					_self.resetForm();
					_self.onCloseModal.emit();
					this.router.navigate(['pages/purchase-orders/purchase-order-details', { purchaseOrderId: res["purchaseOrderId"], versionId: res["versionId"] }]);
				}
			});
	}

	resetForm(){
		this.poFormRef.reset();
		this.nonBillingLocations = new Array<Locations>();
		this.accountContacts = new Array<Contacts>();
		this.billingAddress = undefined;
		this.shipToAddress = undefined;
		this.poDetails.contactEmail = '';
		this.poDetails.contactPhone = '';
	}

}
