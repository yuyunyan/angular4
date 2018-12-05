import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { List } from 'linqts';
import { Response } from '@angular/http'
import { AccountDetails } from './../_models/contactsAccount/accountDetails';
import { ContactDetails, ContactDetailsOptions, Owner, Status, Location, PreferredContactMethods, ContactJobFunction } from './../_models/contactsAccount/contactDetails';
import { StatusList, AccountType, CompanyType, AccountOptions } from './../_models/contactsAccount/accountOptions';
import { Contacts, ListContact } from './../_models/contactsAccount/contacts';
import { NewAccount } from './../_models/contactsAccount/newAccount';
import {LocationType }from './../_models/contactsAccount/locationType';
import * as _ from 'lodash'; 

@Injectable()
export class ContactsService {
  constructor(private httpService: HttpService) {

  }
  //Calling two apis at the same time and return one dataset at the same time;
  getaccountBasicDetailsData(accountId: number) {
    return Observable.forkJoin(
      this.getAccountDetails(accountId),
      this.getAccountDetailOptions(),
      this.getAllCurrencies(),
      this.getAccountHierarchies(),
      this.getAccountTypesData(accountId)
    );
  }

  getAccountDetails(accountId: number) {
    let basicDetailsUrl = 'api/account/getBasicDetails?accountId=' + accountId;
    return this.httpService.Get(basicDetailsUrl).map(
      (res: Response) => {
        let response = res.json();
        return this.createAccountFromResponse(response);      
      }
    )
  }

  createAccountFromResponse(response){
    let accountDetails = new AccountDetails();
    accountDetails.name = response.name;
    accountDetails.number = response.number;
    accountDetails.statusId = response.statusId;
    accountDetails.accountTypeIds = response.accountTypeIds;
    accountDetails.companyTypeId = response.companyTypeId;
    accountDetails.accountId = response.accountId;
    accountDetails.externalId = response.externalId;
    accountDetails.statusExternalId = response.statusExternalId;
    accountDetails.currencyId = response.currencyId;
    accountDetails.organizationId = response.organizationId;
    accountDetails.accountHierarchyId = response.accountHierarchyId;
    accountDetails.creditLimit = response.creditLimit;
    accountDetails.openBalance = response.openBalance;
    accountDetails.SAPGroupID = response.SAPGroupID;
    accountDetails.SAPHierarchyID = response.SAPHierarchyID;
    accountDetails.paymentTermId = response.paymentTermId;
    accountDetails.shipFromRegionId = response.shipFromRegionId;

    const fullYear = new Date(response.yearEstablished).getFullYear();
    let yearEstablished;
    if (fullYear == 1969){
      yearEstablished = '';
    } else {
      yearEstablished = fullYear + '';
    }
    accountDetails.email = response.email;
    accountDetails.website = response.website;
    accountDetails.yearEstablished = yearEstablished;
    accountDetails.numOfEmployees = response.numOfEmployees;
    accountDetails.productFocus = response.productFocus;
    accountDetails.vendorNum = response.vendorNum;
    accountDetails.carryStock = response.carryStock;
    accountDetails.minimumPO = response.minimumPO;
    accountDetails.supplierRating = response.supplierRating;
    accountDetails.shippingInstructions = response.shippingInstructions;
    accountDetails.qcNotes = response.qcNotes;
    accountDetails.poNotes = response.poNotes;
    accountDetails.approvedVendor = response.approvedVendor;
    accountDetails.incotermID = response.incotermID;
    accountDetails.DBNum = response.dbNum;
    return accountDetails;

  }

  getAccountDetailOptions() {
    let basicDetailOptions = 'api/account/getBasicDetailsOptions';
    let statusList: StatusList[];
    let accountTypes: List<AccountType>;
    let companyTypes: CompanyType[];

    return this.httpService.Get(basicDetailOptions).map(
      (res: Response) => {
        let response = res.json();
        let accountOptions = new AccountOptions();
        statusList = new Array<StatusList>();
        companyTypes = new Array<CompanyType>();
        accountTypes = new List<AccountType>();

        response.statusList.forEach(element => {
          statusList.push({
            optionId: element.id,
            optionName: element.name,
            externalId: element.externalId
          })
        });
        response.companyTypes.forEach(element => {
          companyTypes.push({
            companyTypeId: element.id,
            companyTypeName: element.name
          })
        });
        response.accountTypes.forEach(element => {
          accountTypes.Add({
            accountTypeId: element.id,
            accountTypeName: element.name,
            checked: false,
            statusName: null,
            paymentTermName: null
          })
        })

        accountOptions.statuses = statusList;
        accountOptions.accountTypes = accountTypes;
        accountOptions.companyTypes = companyTypes;

        return accountOptions;
      }
    )

  }

  updateAccountBasicDetailData(payload) {
    let url = 'api/account/setBasicDetails';
    return this.httpService.Post(url, payload);
  }

  createNewAccount(shipToChecked: Boolean ,newCustomer: NewAccount, statusExternalId: number, locationType: LocationType, countryCodeSap:string, stateCode: string): Observable<AccountDetails> {
    let url = 'api/account/setNewAccount';
    let body = {
      name: newCustomer.name,
      website: newCustomer.website,
      accountTypeIds: newCustomer.accountTypeIds,
      companyTypeId: newCustomer.companyTypeId,
      organizationId: newCustomer.organizationId,
      statusExternalId:statusExternalId,
      statusId:newCustomer.statusId,
      location: {
        name: newCustomer.location.LocationName,
        addressLine1: newCustomer.location.AddressLine1,
        addressLine2: newCustomer.location.AddressLine2,
        houseNo: newCustomer.location.HouseNumber,
        street: newCustomer.location.Street,
        addressLine4: newCustomer.location.AddressLine4,
        city: newCustomer.location.City,
        stateId: newCustomer.location.StateID,
        postalCode: newCustomer.location.PostalCode,
        countryId: newCustomer.location.CountryID,
        typeId: newCustomer.location.LocationTypeID,
        district: newCustomer.location.District,
        locationTypeExternalId: locationType.externalId,
        Note: newCustomer.location.Note,
        locationTypeName: locationType.name,
        countryCode2: countryCodeSap,
        stateCode: stateCode,
        shipToChecked : shipToChecked,
      },
      contact:{
        FirstName:newCustomer.contact.firstName,
        LastName:newCustomer.contact.lastName,
        Title:newCustomer.contact.title,
        Fax:newCustomer.contact.fax,
        Email: newCustomer.contact.email,
        MobilePhone: newCustomer.contact.mobilePhone,
        OfficePhone: newCustomer.contact.officePhone,
        PreferredContactMethodId:newCustomer.contact.preferredContactMethodId,
        Note: newCustomer.contact.note,
      }
    }
    return this.httpService.Post(url, body).map(
      data => {
        var response = data.json();
        return this.createAccountFromResponse(response);
      }
    );
  }

  getAccountContacts(accountId: number) {
    console.log("getAccountContacts");
    let url = 'api/accounts/contacts';
    let body = {
      accountId: accountId
    }
    return this.httpService.Post(url, body).map((response: Response) => {
      let res = response.json();
      let contacts = new Array<Contacts>();
      res.contacts.forEach(element => {
        contacts.push({
          firstName: element.firstName,
          lastName: element.lastName,
          email: element.email,
          phone: element.phone,
          owner: element.owners,
          title: element.title,
          accountId: element.accountId,
          contactId: element.contactId,
          isActive: element.isActive
        })
      });

      return contacts;
    })
  }

  getContactList(SearchString: string, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean, accountTypeId: number,FilterCol?: string , FilterText?: string, isActive?: boolean ) {
    console.log("getContactList");
    let sortColumnName: string;
    let filterColumnName : string ;
            switch(SortCol){
                case 'accountName':
                    sortColumnName = 'AccountName';
                    break;
                case 'firstName':
                    sortColumnName = 'FirstName';
                    break;
                case 'lastName':
                    sortColumnName = 'LastName';
                    break;
                case 'accountStatus':
                    sortColumnName = 'AccountStatus';
                    break;
                case 'accountTypes':
                    sortColumnName = 'AccountTypes';
                    break;
                case 'email':
                    sortColumnName = 'Email';
                    break;
                case 'owners':
                    sortColumnName = 'Owners';
                    break;
                case 'phone':
                    sortColumnName = 'Phone';
                    break;
                default:
                    sortColumnName = '';
            };

            switch(FilterCol){
              case 'accountName':
                  filterColumnName = 'AccountName';
                  break;
              case 'firstName':
                  filterColumnName = 'FirstName';
                  break;
              case 'lastName':
                  filterColumnName = 'LastName';
                  break;
              case 'accountStatus':
                  filterColumnName = 'AccountStatus';
                  break;
              case 'accountTypes':
                  filterColumnName = 'AccountTypes';
                  break;
              case 'email':
                  filterColumnName = 'Email';
                  break;
              case 'owners':
                  filterColumnName = 'Owners';
                  break;
              case 'phone':
                  filterColumnName = 'Phone';
                  break;
              default:
                  filterColumnName = null;
          };
    let descBit = 0;
    if (DescSort == true)
      descBit = 1;
    let url = 'api/accounts/contacts';
      let data = {
      FreeTextSearch: SearchString,
      RowOffset: RowOffset,
      RowLimit: RowLimit,
      DescSort: descBit,
      SortBy : sortColumnName,
      FilterBy: filterColumnName,
      FilterText : FilterText,
      AccountTypeId : accountTypeId,
      AccountIsActive : isActive
      }

    return this.httpService.Post(url, data).map((response: Response) => {

      let res = response.json();
      let contacts = new Array<ListContact>();
      res.contacts.forEach(element => {

        let accountTypes = new List<AccountType>();
        let rowAccountTypes = element.accountTypes;
        if(element.accountTypes && element.accountTypes.length > 0){
          rowAccountTypes.forEach(type => {
            let accountType = new AccountType();
            accountType.accountTypeId = type.id;
            accountType.accountTypeName = type.name;
            accountTypes.Add(accountType);
          });
        }
       
        let owners = new Array<string>();
        if(element.owners && element.owners.length > 0){
          element.owners.forEach(owner => {
            owners.push(owner.name);
          });
        }

        contacts.push({
          firstName: element.firstName,
          lastName: element.lastName,
          email: element.email,
          phone: element.phone,
          owners: owners,
          accountName: element.accountName,
          accountId: element.accountId,
          accountStatus: element.accountStatus,
          accountTypes: accountTypes,
          contactId:element.contactId
        })
      });
      return { results: contacts, totalRowCount: res.totalRowCount, error: null};
    })
  }

  setContactDetails(payload) {
    let url = 'api/account/SetContactDetails';
    return this.httpService.Post(url, payload);
  }

 setContactOwners(contactId: number, owners: Owner[]) {
    
    let url = 'api/account/setContactOwnership';
    let ownerList =[];
    owners.forEach(element => { ownerList.push({UserId:element.id, percentage:+element.percentage})});
    
    let body = {
      ContactId: contactId,
      OwnerList: ownerList
    }
    return this.httpService.Post(url, body);
  }

  getAccountContactDetailsData(contactId: number, accountId: number) {

    return Observable.forkJoin(
      this.getContactDetails(contactId),
      this.getContactBasicDetailOptions(accountId)
    )
  }

  getContactDetails(contactId: number) {
    let basicContactUrl = 'api/account/GetContactDetails?contactId=' + contactId;
    return this.httpService.Get(basicContactUrl).map(
      (res: Response) => {

        let response = res.json();
        let owners = new Array<Owner>();

        response.owners.forEach(element => {
          var owner = new Owner();
          owner.id = element.id;
          owner.name = element.name;
          owner.percentage = element.percentage
          owners.push(owner);
        });

        let contactDetails = new ContactDetails();
        let owner = new Array<Owner>();
        contactDetails.email = response.email;
        contactDetails.fax = response.fax;
        contactDetails.firstName = response.firstName;
        contactDetails.lastName = response.lastName;
        // contactDetails.locationId = response.locationId;
        contactDetails.mobilePhone = response.mobilePhone;
        contactDetails.officePhone = response.officePhone;
        contactDetails.preferredContactId = response.preferredContactMethodId;
        contactDetails.locationId = response.locationId;
        contactDetails.isActive = response.isActive == 1;
        contactDetails.title = response.title;
        contactDetails.externalId = response.externalId;
        contactDetails.owners = owners;
        contactDetails.note = response.note;
        contactDetails.department = response.department;
        contactDetails.jobFunctionId = response.jobFunctionID;
        contactDetails.birthDate = response.birthDate;
        contactDetails.gender = response.gender;
        contactDetails.salutation = response.salutation;
        contactDetails.maritalStatus = response.maritalStatus;
        contactDetails.kidsNames = response.kidsNames;
        contactDetails.reportsTo = response.reportsTo;
        contactDetails.accountTypeIds = _.map(response.accountTypeIds, id => id);
        contactDetails.accountName = response.accountName;
        return contactDetails;
      }
    )
  }

  getContactBasicDetailOptions(accountId) {

    let basicContactOptionUrl = 'api/account/GetContactDetailOptions?accountId=' + accountId;
    return this.httpService.Get(basicContactOptionUrl).map(
      (res: Response) => {
        let response = res.json();
        // console.log("service 368",response);
        let contactDetails: ContactDetails;
        let contactDetailsOptions = new ContactDetailsOptions();
        let statuses = new Array<Status>();
        let locaitons = new Array<Location>();
        let preferredContactMethods = new Array<PreferredContactMethods>();
        let jobFunctions = new Array<ContactJobFunction>();

        response.statuses.forEach(element => {
          statuses.push({
            id: element.Id,
            name: element.Name
          })
        });
        
        response.locations.forEach(element => {
          locaitons.push({
            locationId: element.locationId,
            houseNo: element.houseNo,
            street: element.street,
            city: element.city,
            name: element.name,
            typeId: element.typeId,
            locationTypeName: element.locationTypeName,
            stateCode: element.stateCode || '',
            postalCode: element.postalCode || '',
            countryCode: element.countryCode
          })
        });
        
        response.preferredContactMethods.forEach(element => {
          preferredContactMethods.push({
            id: element.Id,
            name: element.Name
          })
        });

        _.forEach(response.contactJobFunctions, element => {
          jobFunctions.push({
            jobFunctionId: element.jobFunctionId,
            jobFunctionName: element.jobFunctionName
          });
        });
        
        contactDetailsOptions.locations = locaitons;
        contactDetailsOptions.statuses = statuses;
        contactDetailsOptions.preferredContactMethods = preferredContactMethods;
        contactDetailsOptions.jobFunctions = jobFunctions;
        return contactDetailsOptions;
      }
    )
  }

  getContactProjects(accountId: number, contactId: number){
    let url = 'api/contact/getContactProjects?accountId=' + accountId + '&contactId=' + contactId;
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      return res;
    });
  }

  setContactProjects(payload){
    let url = 'api/contact/setContactProjects';
    return this.httpService.Post(url, payload).map(data => {
      let res = data.json();
      return res;
    });
  }

  getContactFocuses(accountId: number, contactId: number){
    let url = 'api/contact/getContactFocuses?accountId=' + accountId + '&contactId=' + contactId;
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      return res;
    });
  }

  setContactFocuses(payload){
    let url = 'api/contact/setContactFocuses';
    return this.httpService.Post(url, payload).map(data => {
      let res = data.json();
      return res;
    });
  }

  setupOrganizations(){
    const organizations = [
			{id: 13, name: "Sourceability North America, LLC"},
			{id: 1, name: "Sourceability HK Ltd."},
			{id: 7, name: "Sourceability SG PTE. Ltd."},
    ];
    return organizations;
  }

  getAllCurrencies(){
    let url = 'api/purchase-order/getCurrenciesList';
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      const currencyList = _.map(res.currencies, (c) => {
        return _.assign({}, {
          currencyId: c.CurrencyID,
          name: c.Name,
          externalId: c.ExternalID
        });
      });
      return currencyList;
    });
  }

  getAccountHierarchies(){
    let url = 'api/account/getAccountHierarchies';
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      const accountHierarchies = _.map(res.accountHierarchies, ah => {
        let accountHierarchy = {
          accountHierarchyId: ah.accountHierarchyId,
          parentId: ah.parentId,
          regionId: ah.regionId,
          hierarchyName: ah.hierarchyName
        };
        return accountHierarchy;
      });
      return accountHierarchies;
    });
  }

  getAccountTypesData(accountId:number){
    let url = 'api/account/getTypesData?accountId=' + accountId;
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      const typesData = _.map(res.types, td => {
        let typeData = {
          accountTypeId: td.accountTypeId,
          accountStatusId: td.accountStatusId,
          statusName: td.statusName,
          paymentTermId: td.paymentTermId,
          paymentTermName: td.paymentTermName,
          epdsId:td.epdsId
        };
        return typeData;
      });
      return typesData;
    });
  }

  syncAccount(accountId: number){

    let url = 'api/account/sync?accountId='+accountId;
        return this.httpService.Post(url,{}).map(
            data => {
                let res = data.json();
                return {transactionId:res.transactionId, errorMessage:res.errorMessage};
            },
            error => { return error.json(); }
        )
  }

  getContactCommentTypeId(){
    let url = 'api/account/getContactCommentTypeIds';
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      const commentTypeMap = _.map(res.commentTypeIds, (element) => {
          return _.assign({}, {
              id: element.commentTypeId,
              name: element.typeName
          });
      });
      return commentTypeMap;
    });
  }

}



