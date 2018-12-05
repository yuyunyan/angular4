import { Component, ViewEncapsulation, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Supplier } from './../../../../_models/shared/supplier';
import { PurchaseOrdersService } from './../../../../_services/purchase-orders.service';
import { ContactsService } from './../../../../_services/contacts.service';
import { ItemsFlaggedService } from './../../../../_services/items-flagged.service';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { SharedService }  from './../../../../_services/shared.service';
import { RfqsService} from './../../../../_services/rfqs.service';
import { Router} from '@angular/router';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';

@Component({
	selector: 'az-items-flagged-rfq',
	templateUrl: './items-flagged-rfq.component.html',
	styleUrls: ['./items-flagged-rfq.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ItemsFlaggedRFQComponent {
	@Input() itemsFlagged;
	@Output() onCloseModal = new EventEmitter<any>();
	@ViewChild('rfqItemsFlaggedForm')
	private rfqFormRef;


	private _itemsFlagged;
	private suppliersList: Supplier[];
	private accountContacts: Contacts[];
	private organizations: Array<any>;
	private rfq = {accountId:undefined, contactId: undefined,
		organizationId: undefined}
	private comment: string;
	private rfqObjectType: number;
	private dataRemote: RemoteData;

	private ngUnsubscribe: Subject<void> = new Subject<void>();	

	constructor(private purchaseOrdersService: PurchaseOrdersService,
		private contactsService: ContactsService,
		private itemsFlaggedService: ItemsFlaggedService,
		private sharedService: SharedService,private router: Router,
		private rfqService: RfqsService,
		private completerService: CompleterService) {

		this.rfqService.getVendorRfqObjectTypeId().subscribe(data=>{
			this.rfqObjectType = data;		
		});
		this.suppliersList = new Array<Supplier>();
		this.accountContacts = new Array<Contacts>();
		this.comment = '';

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
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.rfqObjectType
		});
		this.dataRemote.dataField("accounts");
	}

	onAccountSelected($event){
		if($event != null){
			this.rfq.accountId = $event.originalObject.accountId;
			this.onAccountVendorChange($event.originalObject.accountId);
		}
	}

	isAccountSelected(){
		if(this.rfq.accountId === undefined)
			return false;

		return true;
	}

	onAccountVendorChange(value: number){
		let accountId = value;
		this.rfq.contactId = undefined;
		this.getContactList(accountId);
	}

	getContactList(accountId: number){
		this.contactsService.getAccountContacts(accountId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.accountContacts = data;
		});
	}

	onGridValuesUpdated(data){
		this._itemsFlagged = data;
	}

	onSaveRFQClicked(){
		const _self = this;
		let rfqDetails = {
			supplierId: _self.rfq.accountId,
			contactId: _self.rfq.contactId,
			organizationId: _self.rfq.organizationId
		};
		let postItemsFlagged = _self._itemsFlagged ? _self._itemsFlagged: _self.itemsFlagged;
		postItemsFlagged = postItemsFlagged ? postItemsFlagged : [];
		_self.itemsFlaggedService.newRfqSet(rfqDetails, _self.comment, postItemsFlagged)
		.takeUntil(_self.ngUnsubscribe.asObservable())
		.subscribe(res => {
			console.log(res);
			if (res['isSuccess']) {
				_self.resetForm();
				_self.onCloseModal.emit();
				this.router.navigate(['pages/rfqs/rfq-details', { rfqId: res["vendorRfqId"]}]);
			}
		});
	}

	resetForm(){
		this.rfqFormRef.reset();
		this.rfq.contactId = undefined;
		this.accountContacts = new Array<Contacts>();
		this.comment = '';
	}
}
