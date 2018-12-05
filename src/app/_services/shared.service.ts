import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Supplier } from './../_models/shared/supplier';
import { ContactDetails } from './../_models/contactsAccount/contactDetails';
import { ItemsService } from './items.service';
import { QuoteService } from './quotes.service';
import { Observable } from 'rxjs/Observable';
import { AccountByObjectType } from './../_models/common/accountByObjectType';
import * as _ from 'lodash';
import { Currency } from './../_models/shared/currency';
import { SourceTypes } from './../_models/sourcing/sourceTypes';
import {CarrierService} from './../_services/carrier.service';
import { CompanyType } from './../_models/contactsAccount/accountOptions';

@Injectable()
export class SharedService {

    constructor(private httpService: HttpService, private itemsService: ItemsService, private quoteService: QuoteService,private carrierService:CarrierService ){}

    getSuppliersandVendors(selectedId) {
        let url = 'api/account/getSuppliersandVendors';
        if(selectedId)
            {
                url = url + '?selectedAccountId='+selectedId;
            }
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let suppliers = res;
                let supplierList = new Array<Supplier>();

                for (let i = 0; i < suppliers.length; i++) {
                    let supplier: Supplier;
                    supplier = {
                        id: suppliers[i].accountId,
                        name: suppliers[i].name,
                        status:suppliers[i].statusName
                    };
                    supplierList.push(supplier);
                }
                return supplierList;
            }
        );

    }

    getContactBasicInfo(contactId: number) {
    
    let url = 'api/account/GetContactDetails?contactId=' + contactId;
    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        let contactDetails = new ContactDetails();
        contactDetails.email = res.email;
        contactDetails.officePhone = res.officePhone;
        return contactDetails;
      }
    )
  }

  validatePrintRule(objectTypeId:number,quoteId:number){
    let url = "api/workflow-management/validateRule";
    let body = {
        objectId: quoteId,
        objectTypeId: objectTypeId,
    }
    return this.httpService.Post(url,body).map(data =>{
        let res = data.json();
        return res;
    })
  }

  getCommoditiesAndPackagingTypes(){
   
    return Observable.forkJoin(
            this.itemsService.GetCommodities(),
            this.quoteService.getPackagingTypes()
        );
  }

  getPackagingTypes() {
    return this.quoteService.getPackagingTypes();
  }

  getConditionTypes() {
    return this.quoteService.getConditionTypes();
  }

  getCountryList() {
    let url = 'api/account/GetCountryList';
    return this.httpService.Get(url).map(res => {
        let ret = res.json();
        return ret.countryList;
    });
  }
  getAccountsByObjectType(objectTypeId?:number,selectedAccountId?:number){
    let url="api/common/getAccountsByObjectType?objectTypeId="+(objectTypeId?objectTypeId:'')+"&selectedAccountId="+(selectedAccountId?selectedAccountId:'');
    return this.httpService.Get(url).map(
        data=>{
        let res= data.json();
        var accounts = res.accounts.map(
            accountRep=>{
                let account: AccountByObjectType;
                account={
                    accountId:accountRep.accountId,
                    accountName:accountRep.accountName,
                    accountTypeId:accountRep.accountTypeId,
                    statusName:accountRep.statusName,
                    supplierRating: accountRep.supplierRating
                }
                return account;
            }
        )
        return accounts;
    })        
}

getSourcingTypes(){
    let url = 'api/sourcing/getTypes';
    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        let types = res.types;
        let typeList = new Array<SourceTypes>();

        for(let i = 0; i < types.length; i++){
          let type: SourceTypes;
          type = {
            id: types[i].SourceTypeID,
            name: types[i].TypeName
          };
          typeList.push(type);
        }
        return typeList;
      }
    );
  }



    getIncotermOnAccount(accountId){
        let url = 'api/common/getIncotermOnAccount?accountId=' + accountId;
        return this.httpService.Get(url).map( data => {
            let res = data.json();
            return res;          
        });
    }
    getAllIncoterms(){
        return this.quoteService.getAllIncoterms();
    }

    getAllOrganizations(objectTypeId:number){
        return this.quoteService.getAllOrganizations(objectTypeId);
    }

    getAllShippingMethods(){
        let url ='api/common/getAllShippingMethods';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                const shippingMethods = _.map(res.shippingMethods, (element) => {
                    return _.assign({}, {
                        shippingMethodId: element.shippingMethodId,
                        methodName: element.methodName
                    });
                });
                return shippingMethods;
            }
        );
    }
    getCarriers(){
        return this.carrierService.getCarriers();
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

    getAllRegions(){
        let url = 'api/common/getAllRegions';
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            const regionsList = _.map(res.regions, (r) => {
                return _.assign({}, {
                    ShipfromRegionID: r.shipfromRegionID,
                    RegionName: r.regionName,
                    OrganizationID: r.organizationID,
                    CountryID: r.countryID
                });
            });        
        return regionsList;
        });
    }


    getCompanyTypes(){
        let url = 'api/common/getCompanyTypes';
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let companyTypes = new Array<CompanyType>();
            res.forEach(element => {
                companyTypes.push({
                  companyTypeId: element.id,
                  companyTypeName: element.name
                })
              });
        
        return companyTypes;
        });
    }

    routeQuoteLinesToUsers(payload){
        let url = 'api/quote/routeQuoteLinesToUsers';
        return this.httpService.Post(url, payload).map(data => {
            return data.json();
        });
    }

    getAllProjects(accountId: number, contactId: number){
        let url = 'api/contact/getContactProjects?accountId=' + accountId + '&contactId=' + contactId;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            return res;
        });
    }

    getPaymentTerms() {
        return this.quoteService.getPaymentTerms();
    }

    getAllFreightPaymentMethods(){
        let url = 'api/common/getAllFreightPaymentMethods';
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            return res.freightPaymentMethods;
        });
    }
    getConfigValue(configName){
        let url = 'api/common/getConfigValue?configName='+ configName ;
        
            return this.httpService.Get(url).map(
              data => {
                let res = data.json();
                return res;
              }
            )
      }

    suppliersSpecialtyMatch(commodities, mfrs){
        let url = 'api/accounts/suppliersLineCardMatch';
        let body = {
            commodities: commodities,
            mfrs: mfrs
        };
        return this.httpService.Post(url, body).map(res => {
            return res.json();
        });
    }

    suppliersAccountGroupMatch(accountGroupId: number){
        let url = 'api/account/suppliersAccountGroupMatch?accountGroupId=' + accountGroupId;
        return this.httpService.Get(url).map(res => {
            return res.json();
        });
    }

    suppliersAccountGroupListGet(){
        let url = 'api/account/suppliersAccountGroupListGet';
        return this.httpService.Get(url).map(res => {
            return res.json();
        });
    }

    getDeliveryRules(){
        let url = 'api/common/getDeliveryRules';
        return this.httpService.Get(url).map(res => {
            let data = res.json();
            return data.deliveryRuleList;
        })
    }
   
    getCarrierMethods(carrierId?:number){
        let url ='api/common/getCarrierMethods?carrierId='+carrierId;
        return this.httpService.Get(url).map(res=>{
           let data = res.json();
           return data.carrierMethods;
        })
    }

    getWarehouses(organizationId?:number) {
        let url = 'api/common/getWarehouses?organizationId='+organizationId;
        return this.httpService.Get(url).map(res=>{
            let data = res.json();
            return data.warehouses;
         })
    }
    getWarehouseBins() {
        let url = 'api/common/getWarehouseBins'
        return this.httpService.Get(url).map(res=> {
            let data = res.json();
            return data.warehouseBins
        })
    }
    calculateDateUnit(value){
        return value % 7 == 0 ? value/7 + ' w': value + ' d';
    }
    
    getFormattedDate(date) {
        var year = date.getFullYear().toString().slice(2,4);
        
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        return month + '/' + day + '/' + year;
    }
}
