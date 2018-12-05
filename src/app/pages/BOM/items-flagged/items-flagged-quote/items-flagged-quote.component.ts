import { Component, ViewEncapsulation, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { BOMsService } from './../../../../_services/boms.service';
import { ContactsService } from './../../../../_services/contacts.service';
import { ItemsFlaggedService } from './../../../../_services/items-flagged.service';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Customers } from './../../../../_models/quotes/quoteOptions';
import { AccountDetails } from './../../../../_models/contactsAccount/accountDetails';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Router} from '@angular/router';
import { List } from 'linqts';
import { AccountType, CompanyType } from './../../../../_models/contactsAccount/accountOptions';
import { PreferredContactMethods } from './../../../../_models/contactsAccount/contactDetails';
import * as _ from 'lodash';
import { QuoteService} from './../../../../_services/quotes.service';
import { RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../../environments/environment';

@Component({
	selector: 'az-items-flagged-quote',
	templateUrl: './items-flagged-quote.component.html',
	styleUrls: ['./items-flagged-quote.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ItemsFlaggedQuoteComponent implements OnDestroy {
	@Input() itemsFlagged;
	@Output() onCloseModal = new EventEmitter<any>();

	@ViewChild('existingCustomerForm')
	private existingCustomerFormRef;
	@ViewChild('newCustomerForm')
	private newCustomerFormRef;
	
	private isExistingCustomer: boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private quote = {contactId: undefined};
	private newCustomer = {accountTypeIds: []};
	private organizationId: number;
	private newContact = {};
	private comment: string = "";
	private _itemsFlagged;

	// Create By Existing Customer properties
	private accountId: number;
	private account: Customers;
	private contact: Contacts;
	private customers: Array<Customers> = new Array<Customers>();
	private contactsByAccount: Array<Contacts> = new Array<Contacts>();

	// Create By new customer
	private accountTypes: List<AccountType>;
	private accountTypesBoundData: AccountType[];
	private companyTypes: CompanyType[];
	private organizations: Array<any>;
	private preferredContactMethods: PreferredContactMethods[];
	private dataRemote: RemoteData;
	private quoteObjectType: number;

	constructor(private bomsService: BOMsService,
		private contactsService: ContactsService,
		private itemsFlaggedService: ItemsFlaggedService,
		private quoteService: QuoteService,
		private router: Router,
		private completerService: CompleterService) {
		this.quoteService.getQuoteObjectTypeId().subscribe(data=>{
			this.quoteObjectType = data;		
		});
		this.isExistingCustomer = true;
		this.bomsService.getUploadCustomerList().takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.customers = data;
		});

		this.organizations = [
			{id: 13, name: "Sourceability North America, LLC"},
			{id: 1, name: "Sourceability HK Ltd."},
			{id: 7, name: "Sourceability SG PTE. Ltd."},
		];

		this.contactsService.getAccountDetailOptions().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(data =>{
			this.companyTypes = data.companyTypes;
			this.accountTypes = data.accountTypes;
			this.accountTypesBoundData = this.accountTypes.ToArray();
		});

		this.preferredContactMethods = [
			{id: 1, name: "Office Phone"},
			{id: 2, name: "Mobile Phone"},
			{id: 3, name: "Fax"},
			{id: 4, name: "Email"}
		];

		this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.quoteObjectType
		});
		this.dataRemote.dataField("accounts");
	}

	onAccountSelected($event){
		if($event != null){
			this.onCustomerChange($event.originalObject.accountId);
		}
	}

	isAccountSelected(){
		if(this.accountId === undefined)
			return false;

		return true;
	}

	onCustomerChange(value){
		this.accountId = value;
		this.account = this.customers.find(x => +value == x.id);
		this.contact = new Contacts();
		this.quote.contactId = undefined;
		this.getContactsByAccountId(this.accountId);
	}

	getContactsByAccountId(accountId){
    this.bomsService.getContactsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
    	.subscribe(
      	data => {
        	this.contactsByAccount = data;
    });
  }

	onContactsChange(value){
		this.contact = this.contactsByAccount.find(x => +value == x.contactId)
	}
	

	onSaveQuoteClicked(){
		const _self = this;
		let postItemsFlagged = _self._itemsFlagged ? _self._itemsFlagged: _self.itemsFlagged;
		postItemsFlagged = postItemsFlagged ? postItemsFlagged : [];
		if (_self.isExistingCustomer) {
			_self.itemsFlaggedService.newQuoteExistingCustomerSet(_self.accountId, _self.contact.contactId, _self.comment, postItemsFlagged)
				.takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(res => {
						if (res['isSuccess']) {
						_self.resetExistingCustomer();
						_self.onCloseModal.emit();
						this.router.navigate(['pages/quotes/quote-details', { quoteId: res["QuoteId"], quoteVersionId: res["versionId"] }]);
					}
			});
		} else {
			_self.newCustomer.accountTypeIds = _self.mappingAccountType(); 
			_self.itemsFlaggedService.newQuoteNewCustomerSet(_self.newCustomer, _self.organizationId, _self.newContact, _self.comment, postItemsFlagged)
				.takeUntil(_self.ngUnsubscribe.asObservable()).subscribe(res => {
					if (res['isSuccess']) {
						_self.resetNewCustomer();
						_self.onCloseModal.emit();
						this.router.navigate(['pages/quotes/quote-details', { quoteId: res["QuoteId"], quoteVersionId: res["versionId"] }]);
					}
			});
		}
	}

	mappingAccountType(){
		let typesTosave = new Array<number>();
    this.accountTypesBoundData.forEach(element => {
      if (element.checked) {
        typesTosave.push(element.accountTypeId);
      }
		});
		return typesTosave;
	}

	onGridValuesUpdated(data){
		this._itemsFlagged = data;
	}

	resetNewCustomer(){
		this.newCustomerFormRef.reset();
		this.accountTypesBoundData = _.map(this.accountTypesBoundData, (accountType) => {
			return _.assign({}, accountType, {checked: false});
		});
		this.isExistingCustomer = true;
	}

	resetExistingCustomer(){
		this.contact = new Contacts();
		this.accountId = undefined;
		this.comment = undefined;
		this.customers = new Array<Customers>();
		this.existingCustomerFormRef.reset();
	}

	 
	AccountSave($savedAccount){
		this.resetNewCustomer();
		
	  }
	
	  cancelClicked(){
		this.resetNewCustomer();
	  }

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
