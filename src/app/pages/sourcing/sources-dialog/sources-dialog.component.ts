import { Component, OnInit, OnChanges, SimpleChange, ViewChild, ElementRef,
  Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { SourcingAddSource } from './../../../_models/sourcing/sourcingAddSource';
import { QuoteService } from './../../../_services/quotes.service';
import { SourcingService } from './../../../_services/sourcing.service';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { Commodity} from './../../../_models/shared/commodity';
import { PackagingType } from './../../../_models/shared/packagingType';
import { Supplier } from './../../../_models/shared/supplier';
import { SourceTypes } from './../../../_models/sourcing/sourceTypes';
import { Currency } from './../../../_models/shared/currency';
import { Item } from './../../../_models/Items/item';
import { NotificationsService } from 'angular2-notifications';
import { RemoteData, CompleterService } from "ng2-completer";
import { NgForm } from '@angular/forms';
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { Subject } from 'rxjs/Subject';
import { environment } from './../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Component({
  selector: 'az-sources-dialog',
  templateUrl: './sources-dialog.component.html',
  styleUrls: ['./sources-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SourcesDialogComponent implements OnInit, OnChanges {
  @Input() partObject;
  @Output() sourceAdded= new EventEmitter();
  private tabKey = 9;
  private enterKey = 13;
  private tempPartNumber: string = '';
  private model:SourcingAddSource;
  private contacts: Contacts[];
  private types: SourceTypes[];
  private commodities: Commodity[];
  private packagingTypes: PackagingType[];
  private currencies: Currency[];
  private timeType : any;
  @ViewChild('sourceCloseBtn') closeBtn: ElementRef;
  private dataRemote: RemoteData;
  private dataRemoteItems: RemoteData;
  private dataRemoteMfrs: RemoteData;
  @ViewChild('newSourceForm') newSourceFormRef: NgForm;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private newMPNInvalid: boolean;
  private newMfrInvalid: boolean;
  private newSupplierInvalid: boolean;
  private isKnownItemChosen: boolean;
  private isIhsItem: boolean;
  private isKnownMfrChosen: boolean;

  constructor(
    private completerService: CompleterService,
    private quoteService: QuoteService, 
    private sourcingService: SourcingService, 
    private notificationService: NotificationsService) { 
    let requestOptions = new MyRequestOptions();
    this.dataRemote = completerService.remote(
      null,
      "accountNameAndNum",
      "accountNameAndNum"
    );
    this.dataRemote.urlFormater(term => {
      return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?SearchString=' + encodeURIComponent(term) +
        '&AccountType=1&RowOffset=0&RowLimit=10&DescSort=false&SortBy='; 
    });
    this.dataRemote.requestOptions(requestOptions);
    this.dataRemote.dataField("accounts");

    this.dataRemoteItems = completerService.remote(
      environment.apiEndPoint + "/api/items/getSuggestions?searchString=",
      null,
      "data"
    );
    this.dataRemoteItems.requestOptions(requestOptions);
    this.dataRemoteItems.dataField("suggestions");

		this.dataRemoteMfrs = completerService.remote(
			null,
			"mfrName",
			"mfrName"
    );
    this.dataRemoteMfrs.requestOptions(requestOptions);
		this.dataRemoteMfrs.urlFormater(term => {
      return environment.apiEndPoint + '/api/items/getManufacturersList?SearchText=' + encodeURIComponent(term); 
		});
		this.dataRemoteMfrs.dataField("manufacturers");
  }

  onAccountSelected($event){
    if($event != null){
      this.model.supplierId = $event.originalObject.accountId;
      this.model.supplierName = $event.originalObject.accountName;
      this.onSupplierChange(this.model.supplierId);
      this.checkSupplierValidation();
    }
  }

  onPartNumberSelected($event){
    const _self = this;
    if($event != null){
      this.newMPNInvalid = false;
      this.model.partNumber = $event.originalObject.name;
      this.model.itemId = $event.originalObject.id;
      this.model.mfr = $event.originalObject.mfr;
      this.isIhsItem = $event.originalObject.isIHS;
      const com = _.find(this.commodities, commodity => commodity.name == $event.originalObject.com);
      if (com){
        this.model.commodityId = com.id;
      }
      this.isKnownItemChosen = true;
      this.newMPNInvalid = false;
      this.createObservable().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(x => {_self.tempPartNumber = _self.model.partNumber});
    }
  }

  createObservable(): Observable<boolean>{
    return Observable.of(true).delay(1);
  }

  onMfrSelected($event){
    if($event != null){
      this.newMfrInvalid = false;
      this.model.mfr = $event.originalObject.mfrName;
      this.isKnownMfrChosen = true;
    }
  }

  onPartNumberTyping(event){
    if(event.keyCode == 13){
      return;
    }else{
      this.isKnownItemChosen = false;
      this.checkPartNumberValidation();
    }
  }

  checkPartNumberValidation(){
    this.newMPNInvalid = !this.tempPartNumber;
  }

  onSupplierTyping(event){
    if(event.keyCode == this.tabKey || event.keyCode == this.enterKey){
      return;
    }else{
      this.model.supplierId = null;
    }
  }


  onMfrTyping(){
    this.isKnownMfrChosen = false;
    this.checkMfrValidation();  
  }

  checkMfrValidation(){
    this.newMfrInvalid = !this.model.mfr;
  }

  checkSupplierValidation(){
    this.newSupplierInvalid = !this.model.supplierId;
  }

  ngOnInit() {
    this.initModel();
    this.populateDropdownData();
  }

  ngOnChanges(changes: { [propKey: number]: SimpleChange }) {
    const changesPartObject = changes['partObject'];
    if (typeof this.model !== "undefined") {
      if(changesPartObject && changesPartObject.currentValue){
        this.resetForm();
        const partObject = changes['partObject'].currentValue;
        if(partObject.itemId){
          this.isKnownItemChosen = true;
        }else{
          this.isKnownItemChosen = false;
        }
      }

    }
  }

  openNewSourceModal(){
    this.populateModel();
  }

  populateModel(){
    const partObject = this.partObject;
    this.model.partNumber = partObject.partNumber;
    this.tempPartNumber = partObject.partNumber;
    this.model.mfr =  partObject.mfr;
    this.model.commodityId =  partObject.commodityId;
    this.model.itemId = partObject.itemId;
    jQuery("#dlgAddSource").modal('toggle');
  }

  resetForm(){
    this.initModel();
    this.newSourceFormRef.resetForm();
    this.newMfrInvalid = false;
    this.newMPNInvalid = false;
    this.newSupplierInvalid = false;
    this.model.leadTime = 0;
    this.model.partNumber = null;
    this.tempPartNumber = null;
    this.timeType = 0;
  }

  initModel(){
    this.model = new SourcingAddSource();
    this.model.supplierId = null;
    this.model.supplierName = '';
    this.model.contactId = null;
    this.model.typeId = null;
    this.model.itemId = null;
    this.model.mpn = "";
    this.model.mfr = "";
    this.model.commodityId = null;
    this.model.qty = null;
    this.model.moq = null;
    this.model.spq = null;
    this.model.dateCode = "";
    this.model.cost = null;
    this.model.currency = null;
    this.model.validDays = null;
    this.model.packagingId = null;
    this.model.notes = "";
    this.model.leadTime = 0;
  }

  populateDropdownData(){
    this.sourcingService.getAddSourceData()
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.types = data[1];
        this.commodities = data[2];
        this.packagingTypes = data[3];
        this.currencies = data[4];
    });
  }

  getContactsByAccountId(accountId) {
    this.quoteService.getContactsByAccountId(accountId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.contacts = data;
    });
  }

  onSupplierChange(value){
    this.getContactsByAccountId(value);
  }

  onInputFocusLost(){
    this.checkSupplierValidation();
  }

  onSave(){
    const _self = this;
    this.checkPartNumberValidation();
    this.checkSupplierValidation();
    this.checkMfrValidation();
    if (this.newSourceFormRef.invalid || this.newMPNInvalid || this.newSupplierInvalid || this.newMfrInvalid){
      return;
    }
    if (!this.isKnownItemChosen){
      this.model.itemId = null;
      this.model.partNumber = this.tempPartNumber;
    }
    if(this.timeType == 1){ //convert weeks to days
      this.model.leadTime = this.model.leadTime * 7 ;
    }
    this.model.isIhsItem = this.isIhsItem;
    this.sourcingService.setSource(this.model)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.notificationService.success(
          'Good Job',
          'Successfully saved the source',
          {
            pauseOnHover: false,
            clickToClose: false
          }
        );
        this.sourceAdded.emit(this.model.partNumber);
        let res = data.json();
        this.resetForm();
        this.createObservable().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(x => {
          _self.populateModel();
        });
    });
    this.closeBtn.nativeElement.click();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
