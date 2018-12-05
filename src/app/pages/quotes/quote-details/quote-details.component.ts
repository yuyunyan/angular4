import { QuoteType } from './../../../_models/quotes/quoteType';
import { QuoteHeader } from './../../../_models/quotes/quoteHeader';
import { NgForm } from '@angular/forms';
import { Component, OnInit, Input,Output, EventEmitter, OnChanges, SimpleChange, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { QuoteService } from './../../../_services/quotes.service';
import { ContactsService } from './../../../_services/contacts.service';
import { SharedService } from './../../../_services/shared.service';
import { QuoteOptions, Customers, ContactsList, ShipAddress } from './../../../_models/quotes/quoteOptions';
import { Status } from './../../../_models/shared/status';
import { Location, ContactDetails } from './../../../_models/contactsAccount/contactDetails';
import { QuoteDetails } from './../../../_models/quotes/quoteDetails';
import { Contacts, ListContact } from './../../../_models/contactsAccount/contacts';
import { List } from 'linqts';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { SalesOrdersService } from './../../../_services/sales-orders.service';
import { AccountByObjectType } from './../../../_models/common/accountByObjectType';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { Router, ActivatedRoute, Params} from '@angular/router';
import * as _ from 'lodash';
import { Ng2CompleterModule, RemoteData, CompleterService } from "ng2-completer";
import { environment } from './../../../../environments/environment';
import { Report } from './../../../_models/shared/report';
import { AccountsContactsService } from '../../../_services/accountsContacts.service';

@Component({
  selector: 'az-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuoteDetailsComponent implements OnChanges, OnDestroy {

  @Input() quoteId: number;
  @Input() quoteVersionId: number;
  @Input() quotePermissions: Array<FieldPermission>;
  @Output() totalDocuments = new EventEmitter();
  @Output() quoteHeader = new EventEmitter();
  @ViewChild('quoteForm') quoteFormRef: NgForm;
  public quoteHeaderData: QuoteHeader;  
  private quoteDetails: QuoteDetails;
  private locationsOptionsByAccountId: ShipAddress[];
  private status: Status[];
  private quoteTypes: QuoteType[];
  private address: Location;
  private locations: Location[];
  private shipLocations: Location[];
  private contactsByAccount: Contacts[];
  private allContacts: ListContact[];
  private contact: Contacts;
  private accountId: number;
  private accountIdByDetails: number;
  private objectTypeIdForQuote: number = 19;
  private accountsByObjectType: AccountByObjectType[];
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private onReadonly: boolean = true;
  private selected : boolean = false;
  private selectedNum : number = 0;
  private currencyList: Array<any>;
  private incotermList: Array<any>;
  private organizationList: Array<any>;
  private paymentTermList: Array<any>;
  private shippingMethodList: Array<any>;
  private tempCustomerName: string;
  private accountStringOne: string;
  
  private dataRemote2: RemoteData;
  private accountString: string;
  private accountSelected: any;
  private documentCount: number;
  private reportUrl: string;
  private hasError: boolean = false;

  //private commaThousandSeparator = new CommaThousandSeparator();
  //public quoteKPI = new QuoteKPI();
  
  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  };

  ngDoCheck(){
    //used to toggle data-field-name on on ng2-completer and allow edit (since we cannot add a datafield to that component directly)
    jQuery(".Customer-Input").attr('data-field-name', 'Customer');

  }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: number]: SimpleChange }) {
    let quoteIdProp = changes['quoteId'];
    let objectTypeId = changes['objectTypeIdForQuote'];
    let quoteVersionIdProp = changes['quoteVersionId'];
    let documentCount = changes["count"];
    if (quoteVersionIdProp && quoteVersionIdProp.currentValue) {
      this.objectTypeIdForQuote = quoteVersionIdProp.currentValue;
    }
    if (quoteIdProp && quoteIdProp.currentValue) {
      this.quoteId = quoteIdProp.currentValue;
      this.quoteVersionId = quoteVersionIdProp.currentValue;

      // this.reportUrl.objectId = quoteIdProp.currentValue;
      // this.reportUrl.versionId =  quoteVersionIdProp.currentValue;

      this.getQuoteDetailsData();
      this.getQuotesHeaderData();
    }else if(quoteIdProp && !quoteIdProp.currentValue){      
      this.onReadonly = false;
      this.populateDataForCreateNewQuote();
    }
    else if (objectTypeId && objectTypeId.currentValue)
      this.objectTypeIdForQuote = objectTypeId;
    
    /*
    if (this.quoteId & this.quoteVersionId) {
      this.populateEditingData();
    } else {
      this.populateDataForCreateNewQuote();
      this.getObjectTypeIdForQuote(this.accountIdByDetails);
    }*/

  }

  countChanged(e) {
    if(e) {
      this.totalDocuments.emit(e);
    }
  }

  constructor(completerService: CompleterService,private contactsService : ContactsService, private quoteService: QuoteService, private _notificationsService: NotificationsService, private router: Router,
     private _salesOrdersService: SalesOrdersService,private sharedService:SharedService,private accountContactsService: AccountsContactsService) {
       
    this.quoteDetails = new QuoteDetails();
    this.quoteHeaderData = new QuoteHeader();
    this.accountsByObjectType = new Array<AccountByObjectType>();
    this.status = new Array<Status>();
    this.address = new Location();
    this.contact = new Contacts();
    this.shipLocations = new Array<Location>();
    this.quoteTypes = new Array<QuoteType>();
    let requestOptions = new MyRequestOptions();
    this.dataRemote2 = completerService.remote(
			null,
			"accountNameAndNum",
			"accountNameAndNum"
    );
    this.dataRemote2.requestOptions(requestOptions);
    this.dataRemote2.urlFormater(term => {
			return environment.apiEndPoint + '/api/accounts/getAccountsByNameNum?searchString='+ term + '&accountType=4' 
		})
    this.dataRemote2.dataField("accounts");
      
  }




  onAccountSelected($event){
    if(!this.quoteId){
      if($event != null){
      this.accountSelected = $event.originalObject;
      this.contactsService.getAccountDetails(this.accountSelected.accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        let accountDetails = [];
        accountDetails.push(data);
        this.quoteDetails.currencyId = accountDetails[0].currencyId;
        this.quoteDetails.paymentTermId = accountDetails[0].paymentTermId;
        this.quoteDetails.organizationId = accountDetails[0].organizationId;
      })
    }
  }
    
    if($event != null){
      this.accountSelected = $event.originalObject;
      this.quoteDetails.customerId = this.accountSelected.accountId;
      this.onCustomerChange(this.accountSelected.accountId);
      this.contactsService.getAccountDetails(this.accountSelected.accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        let accountDetails = [];
        accountDetails.push(data);
        this.quoteDetails.currencyId = accountDetails[0].currencyId;
        this.quoteDetails.paymentTermId = accountDetails[0].paymentTermId;
        this.quoteDetails.organizationId = accountDetails[0].organizationId;
      })
    }else{
    }
  }

  getObjectTypeIdForQuote(selectedAccountId) {
    this.quoteService.getQuoteObjectTypeId().takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.objectTypeIdForQuote = data;
      if(selectedAccountId){
        this.objectTypeIdForQuote = 19;
        this.sharedService.getAccountsByObjectType(this.objectTypeIdForQuote, selectedAccountId).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.accountsByObjectType = data;
          this.accountString = data.find(x => x.accountId == this.accountIdByDetails).accountName;
          this.accountStringOne = this.accountString;
        });
     }else{
         this.sharedService.getAccountsByObjectType(this.objectTypeIdForQuote).takeUntil(this.ngUnsubscribe.asObservable())
        .subscribe(data => {
          this.accountsByObjectType = data;
        });
      }
    })
  }

  getShippingMethods(){
    this.sharedService.getAllShippingMethods().takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(data => {
      this.shippingMethodList = data;
    })
  }


  populateDataForCreateNewQuote() {
    this.getObjectTypeIdForQuote(0);
    this.objectTypeIdForQuote = 19;
    this.getShippingMethods();
    this.quoteService.getDetailsForNewQuote(this.objectTypeIdForQuote).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
        data => {          
          this.currencyList = data[0];
          this.incotermList = data[1];
          this.organizationList = data[2];
          this.paymentTermList = data[3];
          this.status = data[4].status;
          this.quoteTypes = data[5];
        }
      )
  }

  getQuoteDetailsData() {
    this.quoteService.getQuoteDetails(this.quoteId, this.quoteVersionId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
      data => {
        this.quoteDetails = data;
        this.accountIdByDetails = this.quoteDetails.customerId;
        this.getQuoteDetailsOptionsByAccountId(this.accountIdByDetails);
      });
  }

  getQuotesHeaderData(){
    this.quoteService.getQuoteHeaderDetails(this.quoteId, this.quoteVersionId).takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
    data => {
      this.quoteHeaderData = data;
      this.quoteHeader.emit(this.quoteHeaderData)
      this.setReportUrl(data);
    });
  }

  setReportUrl(headerData) {  
    this.reportUrl = '/ReportViewer/quote.html?objectId=' +  headerData.quoteId + '&versionId=' + headerData.versionId + '&userId=' + headerData.userId + '&accountId=' + headerData.accountId + '&date=' + headerData.dateCode + '&salesPerson=' + headerData.salesperson + '&salesPersonEmail=' + headerData.salespersonEmail;
  }

  getQuoteDetailsOptionsByAccountId(accountId) {
    this.objectTypeIdForQuote = 19;
    this.quoteService.getQuoteDetailsData(this.objectTypeIdForQuote,this.quoteId, this.quoteVersionId, accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
      data => {
        this.quoteDetails = data[0];
        this.getObjectTypeIdForQuote(accountId);
        this.status = data[1].status;
        
        this.shipLocations = data[2];
        console.log(this.shipLocations);
        this.contactsByAccount = data[3];
        this.currencyList = data[4];
        this.incotermList = data[5];
        this.organizationList = data[6];
        this.paymentTermList = data[7];
        this.quoteTypes = data[8];
        this.address = this.shipLocations.find(x => this.quoteDetails.shipToId == x.locationId);
        this.contact = this.contactsByAccount.find(x => this.quoteDetails.contactId == x.contactId);
        this.getContactsByAccountId(this.quoteDetails.customerId);
        this.getLocationsByAccountId(this.quoteDetails.customerId);
        jQuery(".Customer-Input").attr('data-field-name', 'Customer');
      }
      )
    this.getShippingMethods();
  }

  getLocationFullAddress(location: Location){
    if(location.houseNo === undefined){
    }else{
    return `${location.houseNo} ${location.street} \n ${location.city? location.city + ', ': ''}
     ${location.stateCode} ${location.postalCode? location.postalCode + ', ': ''} ${location.countryCode}`
  }
}
  
  onCustomerChange(value) {
    if(value > 0){
      this.selected = true;
    }
    
    this.accountId = value;
    this.contact = new Contacts();
    this.address = new Location();
    this.getContactsByAccountId(this.accountId);
    this.getLocationsByAccountId(this.accountId);
  }

  

  onInputFocusLost(){
    setTimeout(() => {
    if(!this.selected){
        this.accountString = this.accountStringOne;
        }else{
          this.selected = false;
        }
    }, 500);
  }
  
  CloseCNoteModal(){
    jQuery('#customerExist').hide();
    this.accountString = "";
  }

  onInputKeydown(event) {
  }

  getContactsByAccountId(accountId) {
    this.accountContactsService.getContactsByAccountId(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
      data => {
        this.contactsByAccount = data;
      }
      )
  }

  getLocationsByAccountId(accountId) {
    this.quoteService.getNonBillingAddress(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(
      data => {
        this.locations = data;
        let a = this.locations.filter(x => x.typeId === 2);
        let b = this.locations.filter(x => x.typeId === 3);
        let final = a.concat(b);
        console.log(final);
         this.shipLocations = final;        
      }
      )
  }

  onContactsChange(value) {
    this.contact = this.contactsByAccount.find(x => +value == x.contactId);
  }

  onLocationChange(value) {
    this.address = this.shipLocations.find(x => +value == x.locationId);
  }

  saveQuoteDetails() {
    const incoterm = _.find(this.incotermList, it => it.id == this.quoteDetails.incotermId);
    const paymentTerm = _.find(this.paymentTermList, pt => pt.paymentTermId == this.quoteDetails.paymentTermId);
    const currency = _.find(this.currencyList, c => c.currencyId == this.quoteDetails.currencyId);
    const organization = _.find(this.organizationList, o => o.id == this.quoteDetails.organizationId);
    const selectedQuoteType = _.find(this.quoteTypes, q => q.id == this.quoteDetails.quoteTypeId);
    var selectedContactId = jQuery('[name="contactDropDown"]').val(); //two way binding of old value prevents new value from being analyzed
    if (!paymentTerm || !currency || !organization || !this.quoteDetails.customerId||!this.quoteDetails.contactId
      ||!this.quoteDetails.statusId || !selectedQuoteType || (!(this.accountString.length > 0)) || (!(selectedContactId > 0))){
      this.hasError = true;
      this._notificationsService.error('Warning', "Please enter all required fields", true);
      //Add custom error highlight to ng-completer element (if value not selected)
      if (!(this.accountString))
        jQuery('input[data-field-name="Customer"]').css('border', '1px inset rgba(191, 23, 37, 0.8)');
      else
        jQuery('input[data-field-name="Customer"]').css('border', '2px inset rgb(206, 212, 218)');
      
      //Add custom error highlight to select list (if value not selected)
      if (!(selectedContactId > 0))
        jQuery('select[name="contactDropDown"]').css('border', '1px solid rgba(191, 23, 37, 0.8)');
      else
        jQuery('select[name="contactDropDown"]').css('border', '1px solid rgb(206, 212, 218)');

      return;
    }

    let payload;
    payload = {
      QuoteId: this.quoteId, 
      VersionId: this.quoteVersionId, 
      ShipLocationId:  (typeof this.quoteDetails.shipToId === "undefined") ? null : this.quoteDetails.shipToId,
      AccountId: this.quoteDetails.customerId,
      StatusId: this.quoteDetails.statusId, 
      ValidForDays:  (typeof this.quoteDetails.validDays === "undefined") ? null : this.quoteDetails.validDays, 
      ContactId: this.quoteDetails.contactId,
      IncotermId: (typeof incoterm === "undefined") ? null : incoterm.id,
      PaymentTermId:  (typeof paymentTerm === "undefined") ? null : paymentTerm.paymentTermId,
      CurrencyId: currency.currencyId,
      OrganizationId:  (typeof organization === "undefined") ? null : organization.id,
      ShippingMethodId:  (typeof this.quoteDetails.shippingMethodId === "undefined") ? null : this.quoteDetails.shippingMethodId,
      QuoteTypeId:  (typeof this.quoteDetails.quoteTypeId === "undefined") ? null : selectedQuoteType.id,
      IncotermLocation: this.quoteDetails.incotermLocation
    };
    
    this.onReadonly = true;
    this.hasError = false;
    this.quoteService.setQuoteDetails(payload)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        let res = data.json();
        if(!this.quoteId && res.QuoteId){
          this.router.navigate(['pages/quotes/quote-details', { quoteId: res.QuoteId, quoteVersionId: res.versionId }]);
        }
        if (res) {
          this._notificationsService.success(
            'Good Job',
            'Successfully saved the quote details',
            {
              pauseOnHover: false,
              clickToClose: false
            }           
          )
        }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFormStatusChange(event: string) {
    if (event == 'edit') {
      this.onReadonly = false;
    } else if (event == 'cancel') {
      this.handleCancel()
      this.onReadonly = true;
    } else if (event == 'save') {
      this.saveQuoteDetails();
    }
  }

  handleCancel(){
    if (this.quoteId && this.quoteVersionId){
      this.getQuoteDetailsData();
    } else{
      this.router.navigate(['pages/quotes']);
    }
  }
  
  onOwnershipClick() {
    jQuery('#ownershipModal').modal('toggle');
  }

}

