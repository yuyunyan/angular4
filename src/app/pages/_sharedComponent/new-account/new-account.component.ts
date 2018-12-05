import { Component, OnInit, Output, EventEmitter,Input } from '@angular/core';
import { AccountType, CompanyType, StatusList } from './../../../_models/contactsAccount/accountOptions';
import { Locations } from './../../../_models/contactsAccount/locations';
import {contact } from './../../../_models/contactsAccount/newAccount';
import { ContactsService } from './../../../_services/contacts.service';
import { LocationService } from './../../../_services/locations.service';
import { SharedService } from './../../../_services/shared.service';
import { List } from 'linqts';
import { Subject } from 'rxjs/Subject';
import { Countries } from './../../../_models/region/countries';
import { States } from './../../../_models/region/states';
import { NewAccount } from './../../../_models/contactsAccount/newAccount';
import { LocationType } from './../../../_models/contactsAccount/locationType';
import { AccountDetails } from './../../../_models/contactsAccount/accountDetails';
import { BUSY_CONFIG_DEFAULTS , IBusyConfig } from 'angular2-busy';
import { PreferredContactMethods } from './../../../_models/contactsAccount/contactDetails';
import * as _ from 'lodash';
import { EmailUtil } from '../../../_utilities/email/emailUtil';

@Component({
  selector: 'az-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  
  private accountTypesBoundData: AccountType[];
  private companyTypes: CompanyType[];
  private accountTypes: List<AccountType>;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private newCustomer : NewAccount;
  private shiptoLocation : Locations;
  private organizations: Array<any>;
  private locationTypes: Array<LocationType>; 
  private countryList: Array<Countries>;
  private stateList: Array<States>;
  private stateListOne: Array<States>;

  private statusList: StatusList[];
  private errorMessage: string;
  private preferredContactMethods: PreferredContactMethods[];
  private newAccount = {accountTypeIds: []};
  private shipToChecked : boolean = true;
  @Input() accountPage;
  @Output() savedAccountDetails = new EventEmitter<AccountDetails>();
  @Output() cancelClick = new EventEmitter();
  public emailRegExp = EmailUtil.EMAIL_REG_EXP;

  private busyConfig: IBusyConfig = Object.assign({}, BUSY_CONFIG_DEFAULTS, {
		template: `
			<div style="background: url('https://cdnjs.cloudflare.com/ajax/libs/timelinejs/2.25/css/loading.gif') no-repeat center 20px; background-size: 72px;">
				<div style="margin-top: 110px; text-align: center; font-size: 18px; font-weight: 700;">
					{{message}}
				</div>
			</div>
		`,
		message: "Saving...",
		minDuration: 1500
	});

  constructor(private contactsService: ContactsService, private locationService: LocationService, private sharedService: SharedService) {

    this.newCustomer = new NewAccount();
    this.shiptoLocation = new Locations();
    this.shiptoLocation.LocationTypeID = 2;
    this.newCustomer.location = new Locations();
    this.newCustomer.location.LocationTypeID = 1;
    this.newCustomer.contact = new contact();
    this.newCustomer.statusId = 5;

    this.preferredContactMethods = [
			{id: 1, name: "Office Phone"},
			{id: 2, name: "Mobile Phone"},
			{id: 3, name: "Fax"},
			{id: 4, name: "Email"}
		];

    this.setupAccountDetailsOptions();
    this.setupOrganizations();
    this.setupLocationTypes();
    this.setupCountries();
   }

  ngOnInit() {
    console.log("accoutpage is",this.accountPage);
  }

  onCheckboxStateChange($event){
    this.shipToChecked = $event.target.checked;
    if(this.shipToChecked){
         this.shiptoLocation.LocationTypeID = 2;
    }
  }

  setupCountries(){
    this.locationService.getCountryList().takeUntil(this.ngUnsubscribe.asObservable())
    .subscribe(
        data => {
            this.countryList = data.results.ToArray();
        }
    )
  }

  setupAccountDetailsOptions(){
    this.contactsService.getAccountDetailOptions().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(data => {
			this.companyTypes = data.companyTypes;
			this.accountTypes = data.accountTypes;
      this.accountTypesBoundData = this.accountTypes.ToArray();
      this.statusList = data.statuses;
    });
  }

  setupOrganizations(){
    
    this.organizations = [
			{id: 13, name: "Sourceability North America, LLC"},
			{id: 1, name: "Sourceability HK Ltd."},
			{id: 7, name: "Sourceability SG PTE. Ltd."},
    ];
  }

  setupLocationTypes(){
    this.locationService.getLocationTypes().takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        this.locationTypes = data.results;
      }

    );
  }


  ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
  }
  
  countryChanged(countryId)
  {
    this.locationService.getStateList(countryId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data =>{
        this.stateList = data.results.ToArray();
      })
  }

  countryChangedOne(countryId)
  {
    this.locationService.getStateList(countryId).takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data =>{
        this.stateListOne = data.results.ToArray();
      })
  }

  onSaveNewCustomer($event){
    this.newCustomer.accountTypeIds = this.mappingAccountType();
    if(this.newCustomer.accountTypeIds.length ===0){
      this.errorMessage = "Please select at least one account Type";
      return;
    } else if (!this.newCustomer.location.LocationName || !this.newCustomer.location.LocationTypeID || !this.newCustomer.location.CountryID
     || !this.newCustomer.location.City || !this.newCustomer.location.HouseNumber || !this.newCustomer.location.Street){
      this.errorMessage = "Location name, city, house number, street, type and country are required.";
      return;
    } else if (!this.newCustomer.contact.firstName || !this.newCustomer.contact.lastName) {
      //&& !(this.newCustomer.contact.firstName && this.newCustomer.contact.lastName)){
      this.errorMessage = "Contact Firstname and lastname are required.";
      return;
    } else if(this.newCustomer.contact.email && !EmailUtil.isValid(this.newCustomer.contact.email)){
      this.errorMessage = "Please enter a valid email address.";
      return;
    }else{
      this.errorMessage= "";
    }
    let statusExternalId = this.statusList.find(x => x.optionId == this.newCustomer.statusId).externalId;
    let locationType = this.locationTypes.find(x => x.id == this.newCustomer.location.LocationTypeID);
    let countryCodeForSap = this.countryList.find(x => x.CountryID == this.newCustomer.location.CountryID).CodeForSap;
    let state = _.find(this.stateList, (x) => x.StateID == this.newCustomer.location.StateID);
    let stateCode = state? state.StateCode: null;
    if(this.shipToChecked){
      let createNewAccountSubscription = this.contactsService.createNewAccount(this.shipToChecked, this.newCustomer, +statusExternalId, locationType, countryCodeForSap, stateCode)
      .takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
        data => {
          this.savedAccountDetails.emit(data);
        }
      )
      this.busyConfig.busy = createNewAccountSubscription;
    }else{
    let createNewAccountSubscription = this.contactsService.createNewAccount(this.shipToChecked, this.newCustomer, +statusExternalId, locationType, countryCodeForSap, stateCode)
    .takeUntil(this.ngUnsubscribe.asObservable()).subscribe(
      data => {
        if(data.accountId > 0 ){
          this.shiptoLocation.AccountID = data.accountId;
          this.shiptoLocation.LocationTypeID = 2;
          this.locationService.SaveLocationShipTo(this.shiptoLocation);
        }
        this.savedAccountDetails.emit(data);
      }
    )

    this.busyConfig.busy = createNewAccountSubscription;
  }
  this.shipToChecked = true;
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
}
