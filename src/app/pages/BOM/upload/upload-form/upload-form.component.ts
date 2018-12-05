import { Component, ViewEncapsulation, ViewChild, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { BOMsService } from './../../../../_services/boms.service';
import { UploadService } from './../../../../_services/upload-service';
import { SharedService } from './../../../../_services/shared.service';
import { Contacts } from './../../../../_models/contactsAccount/contacts';
import { Customers } from './../../../../_models/quotes/quoteOptions';
import { ItemList } from './../../../../_models/bom/itemList';
import { UserDetail } from './../../../../_models/userDetail';
import { XLSDataMapObject } from './../../../../_models/upload/xlsDataMap';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { BUSY_CONFIG_DEFAULTS , IBusyConfig} from 'angular2-busy';
import { QuoteService} from './../../../../_services/quotes.service';
import { AccountByObjectType } from './../../../../_models/common/accountByObjectType';
import { Currency } from './../../../../_models/shared/currency';
import { RemoteData, CompleterService } from "ng2-completer";
import { SourceTypes } from './../../../../_models/sourcing/sourceTypes';
import { environment } from './../../../../../environments/environment';
import { QuoteType } from '../../../../_models/quotes/quoteType';

@Component({
    selector: 'az-bom-upload-form',
    templateUrl: './upload-form.component.html',
    styleUrls: ['./upload-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UploadFormComponent implements OnDestroy{
	@ViewChild('input')
	private inputElement: ElementRef;
	@ViewChild('bomForm')
	private bomFormRef;
	@Output() onCloseModal = new EventEmitter<any>();
	@Output() onSaveBOMSuccess = new EventEmitter<number>();
	private accountsByQuoteObjectType: Array<AccountByObjectType>  = new Array<AccountByObjectType>();
	private accountsByPOObjectType: Array<AccountByObjectType>  = new Array<AccountByObjectType>();
	private objectTypeIdForBomUpload: number;
	private objectTypeIdForExcessUpload: number;
	private AccountSelected: boolean;
	private contactsByAccount: Array<Contacts> = new Array<Contacts>();
	private salesPersons: Array<UserDetail> = new Array<UserDetail>();

	private accountId: number;
	private firstSelection: boolean;
	private account: AccountByObjectType = new AccountByObjectType();
	private contact: Contacts = new Contacts();
	private salesRepId: number;
	private comment: string = ""; 
	private isQuoteTypeVisible : boolean = true;
	private bom = {saveLayout: false, listName: '', currencyId: 'USD', listTypeId: 1, sourcingTypeId: 10, publishToSources: false, runMatch: true , quoteTypeId:null};
	private fileName: string;
	private userUpload;
	private dataMap: Array<number>;
	private quoteTypes: QuoteType[];
	private accountMaps: Array<XLSDataMapObject>;
	private currencies:  Array<Currency>;
	private sourcingTypes: Array<SourceTypes>;
	private onUploadBOMSubscription: Subscription;
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	private busyConfig: IBusyConfig = Object.assign({}, BUSY_CONFIG_DEFAULTS, {
		template: `
			<div style="background: url('https://cdn.dribbble.com/users/419257/screenshots/1724076/scanningwoohoo.gif') no-repeat center 20px; background-size: 72px;">
				<div style="margin-top: 110px; text-align: center; font-size: 18px; font-weight: 700;">
					{{message}}
				</div>
			</div>
		`,
		message: "Uploading File...",
		minDuration: 1500
	});

	private dataRemote: RemoteData;
	private currentlySelectedObjectType: number;

	constructor(private completerService: CompleterService, private bomsService: BOMsService, private uploadService: UploadService,private quoteService:QuoteService,private sharedService:SharedService){
		// this.currencies = new Array<Currency>();
		this.quoteService.getQuoteObjectTypeId().subscribe(data=>{
			this.objectTypeIdForBomUpload = data;			
			this.currentlySelectedObjectType = this.objectTypeIdForBomUpload;
			this.sharedService.getAccountsByObjectType(this.objectTypeIdForBomUpload).subscribe(data=>{
				this.accountsByQuoteObjectType = data;
			});			
		});

		this.bomsService.GetPOObjectTypeID().subscribe(data=>{
			this.objectTypeIdForExcessUpload = data;
			this.sharedService.getAccountsByObjectType(this.objectTypeIdForExcessUpload).subscribe(data=>{
				this.accountsByPOObjectType = data;
			});				
		});

		this.bomsService.getSalesRepsList().takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.salesPersons = data;
			});

		this.bomsService.getDataMapIdList().subscribe(dataMap => {
			this.dataMap = dataMap;
		});

		this.sharedService.getAllCurrencies().subscribe(data => {
			this.currencies = data;
		});

		this.sharedService.getSourcingTypes().subscribe(data => {
			this.sourcingTypes = data;
		});

		this.quoteService.getQuoteTypesList().subscribe(data => {
			this.quoteTypes = new Array<QuoteType>();
			this.quoteTypes = data;
		})
		this.dataRemote = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
		);
		this.dataRemote.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&objectTypeId=' + this.currentlySelectedObjectType 
		});
		this.dataRemote.dataField("accounts");
	}

	fileUploaded(files: FileList){
		const _self = this;
		if (files.length > 0) {
			let file = files['0'];
			_self.setFileName(file);
			const typeValid = _self.validateUploadFileType(file);
			_self.userUpload = typeValid? file: undefined;

			//Disable List selection
			jQuery(jQuery('select[name="listType"]')[0]).attr('disabled','');
		}
	}
	
	setFileName(file){
		const _self = this;
		const fileExtesionRegex = /.*\.(xlsx|csv|xls)$/;
		var result = fileExtesionRegex.exec(file.type);
		const fileExtension = result? result['1']: null;
		if (file.name.length < 25) {
			_self.fileName = file.name;
		} else {
			let tempFileName = file.name;
			const fileName = tempFileName.substring(0, 17) + '...' + (fileExtension? fileExtension: '');
			_self.fileName = fileName;
		}
	}

	validateUploadFileType(file){
		const fileTypeRegex = /.*\.(sheet|ms-excel)$/;
		return fileTypeRegex.test(file.type)
	}

	removeFile(){
		this.fileName = undefined;
		this.inputElement.nativeElement.value = '';
		this.userUpload = undefined;
	}

	// =========================== Methods for Form =========================
	onCustomerChange(value){
		this.accountId = value;
		//this.account = this.customers.find(x => +value == x.id);
		this.account = this.accountsByQuoteObjectType.find(x=> +value == x.accountId);
		this.contact = new Contacts();
		this.getContactsByAccountId(this.accountId);
		this.uploadService.getAccountXLSMaps(this.accountId).subscribe(
			accountDataMap => {
				this.accountMaps = accountDataMap.length > 0 ? accountDataMap : undefined;
		});
	}

	onListTypeChange(value) {
		if(value == 1){
			this.currentlySelectedObjectType = this.objectTypeIdForBomUpload;
			this.isQuoteTypeVisible = true;
		}
		else if(value == 2){
			this.currentlySelectedObjectType = this.objectTypeIdForExcessUpload;
			this.isQuoteTypeVisible = false;
		}
		jQuery('.customer-supplier').toggle();
		jQuery('.source-list').toggle();
	}

	onPublishChange(value) {
		jQuery('.source-list-sel').toggle();
	}
	getContactsByAccountId(accountId) {
    this.bomsService.getContactsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
      data => {
        this.contactsByAccount = data;
      }
    )
  }

	onContactsChange(value){
		this.contact = this.contactsByAccount.find(x => +value == x.contactId)
	}

	onSalesPersonChange(value){
		this.salesRepId = value;
	}

	onSaveBOMClicked(event: Event){
		event.preventDefault();
		let payload = new ItemList();
		if (!this.dataMap || !this.userUpload){
			return;
		}
		payload.accountId = +this.accountId;
		payload.contactId = this.contact.contactId;
		payload.salesUserId = +this.salesRepId;
		payload.listName = this.bom.listName;
		payload.listTypeId = this.bom.listTypeId;
		payload.saveLayout = this.bom.saveLayout;
		payload.currencyId = this.bom.currencyId;
		payload.sourcingTypeId = this.bom.sourcingTypeId;
		payload.publishToSources = this.bom.publishToSources;
		payload.runMatch = this.bom.runMatch;
		payload.comment = this.comment.trim();
		payload.quoteTypeId = this.bom.quoteTypeId;
		payload.xlsType = 'ItemListLines';
		this.onUploadBOMSubscription = this.bomsService.testUpload([this.userUpload], this.dataMap, payload).delay(2000).subscribe((itemListId) => {
			if (itemListId) {
				this.onSaveBOMSuccess.emit(itemListId);
				this.onCloseModal.emit();
				this.resetForm();
			}
		});
		this.busyConfig.busy = this.onUploadBOMSubscription;
	}

	onCancelBOMUploadClicked(event: Event){
		event.preventDefault();
		this.onCloseModal.emit();
	}

	resetForm(){
		this.bom = {saveLayout: false, listName: '', currencyId: 'USD', listTypeId: 1, sourcingTypeId: 10, publishToSources: false, runMatch: false, quoteTypeId:null};
		this.removeFile();
		this.accountId = undefined;
		this.account = new AccountByObjectType();
		this.contact = new Contacts();
		this.quoteTypes = new Array<QuoteType>();
		this.salesRepId = undefined;``
		this.dataMap = undefined;
		this.bomFormRef.reset();
		this.comment = "";	
		jQuery(jQuery('select[name="listType"]')[0]).removeAttr('disabled');

		//Reload component - if this doesnt work, manual togglign of the data validators will be necessary
	}
	IsValidSubmit() {
		return (!this.dataMap || !this.userUpload) || this.bomFormRef.invalid || !this.isAccountSelected()
	}
	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	isAccountSelected(){
		if(this.accountId === undefined)
			return false;

		return true;
	}

	onInputKeydown($event){
		this.accountId = undefined;
	}
	
	onAccountSelected($event){
		if($event != null){
			this.onCustomerChange($event.originalObject.accountId);
		}
	}

	onInputFocusLost(){
		this.isAccountSelected()
	}
}
