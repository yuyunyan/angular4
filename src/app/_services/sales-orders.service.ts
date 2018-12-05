import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { List } from 'linqts';
import { SalesOrderExtra } from './../_models/sales-orders/salesOrderExtra';
import { QuoteService }  from './quotes.service';
import { ItemsService }  from './items.service';
import { SalesOrderPart }  from './../_models/sales-orders/salesOrderPart';
import { SalesOrderDetails} from './../_models/sales-orders/salesOrderDetails';
import {SalesOrderAllocations} from './../_models/sales-orders/salesorderallocations';
import { SalesOrder } from './../_models/sales-orders/salesOrder';
import { Customers } from './../_models/quotes/quoteOptions';
import { Status } from './../_models/shared/status';
import { Countries} from './../_models/Region/countries';
import { LocationsByAccount} from './../_models/common/locationsByAccountId';
import { Contacts } from './../_models/contactsAccount/contacts';
import {CarrierService} from './../_services/carrier.service';
import { SharedService } from './../_services/shared.service';
import { DateFormatter } from '../_utilities/dateFormatter/dateFormatter';

import * as _ from 'lodash';


@Injectable()
export class SalesOrdersService {
    private dateFormatter = new DateFormatter();
    private partCommentIncreSubject = new Subject<any>();
    private extraCommentIncreSubject = new Subject<any>();

    constructor(
        private httpService: HttpService,
        private itemsService: ItemsService,
        private quoteService: QuoteService,
        private sharedService: SharedService,
        private carrierService:CarrierService) {

    }
    GetSalesOrderList(SearchString: string, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean) {
       
        let sortColumnName: string;

            switch(SortCol){
                    case 'ContactFull':
                        sortColumnName = 'ContactFirstName';
                        break;
                    case 'SalesOrderID':
                    sortColumnName = 'SalesOrderID';
                        break;
                    case 'Customer':
                        sortColumnName = 'AccountName';
                        break;
                    case 'OrderStatus':
                        sortColumnName = 'StatusName';
                        break;
                    case 'OrderDate':
                        sortColumnName = 'OrderDate';
                        break;
                    case 'SalesOrderID':
                        sortColumnName = 'OrderNum';
                        break;
                    case 'Owner':
                        sortColumnName = 'Owner';
                        break;
                    case 'CustomerCountry':
                        sortColumnName = 'CustomerCountry';
                        break;
                    default:
                        sortColumnName = '';
                };
        let data = {
            SearchString: SearchString,
            RowOffset: RowOffset,
            RowLimit: RowLimit,
            DescSort: DescSort,
            sortCol : sortColumnName,
            }
        let url = 'api/sales-order/getSalesOrderList';
        return this.httpService.Post(url , data).map(

            data => {
                let res = data.json();
                var salesOrders = new List<SalesOrder>();
                res.salesOrders.forEach(element => {
                    let con = new SalesOrder();
                    con.SalesOrderID = element.salesOrderId;
                    con.VersionID = element.versionId;
                    con.Customer = element.accountName;
                    con.ContactFirstName =  element.contactFirstName;
                    con.ContactLastName =  element.contactLastName
                    con.ContactFull = element.contactFirstName + ' ' + element.contactLastName;
                    con.OrderStatus = element.statusName;
                    con.OrderDate = element.orderDate;
                    con.CustomerCountry = element.countryName;
                    con.Owner = element.owners;
                    con.AccountID = element.accountId;
                    con.ContactID = element.contactId;
                    con.ExternalID = element.externalId
                    salesOrders.Add(con);
                })

                return { results: salesOrders, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Sales-Order list service call failed");
            })
}
    getSalesOrderExtra(soId: number, soVersionId: number, rowOffset: number, rowLimit: number){
        let url = 'api/sales-order/getSalesOrderExtra?soId='+soId+'&soVersionId='+soVersionId+'&rowOffset='+rowOffset+'&rowLimit='+rowLimit;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();

                let soExtras = res.extraListResponse;
                let soExtraList = new Array<SalesOrderExtra>();
                
                soExtras.forEach(element => {
                    soExtraList.push({
                        soExtraId: element.SOExtraId,
                        lineNum: element.LineNum,
                        refLineNum: element.RefLineNum,
                        extraName: element.ExtraName,
                        itemExtraId: element.ItemExtraId,
                        note: element.Note,
                        qty: element.Qty,
                        price: element.Price,
                        cost: element.Cost,
                        gpm: element.Gpm,
                        printOnSO: element.PrintOnSO === 0? false: true,
                        comments: element.Comments
                    });
                });

                return soExtraList;
            });
    };

    getSalesOrderExtraData(soId: number, soVersionId: number, rowOffset: number, rowLimit: number){
        return Observable.forkJoin(
            this.getSalesOrderExtra(soId, soVersionId, rowOffset, rowLimit),
            this.itemsService.GetItemExtras()
        );
    };

    setSalesOrderExtra(soExtra: SalesOrderExtra, soId: number, soVersionId: number) {
        let url = 'api/sales-order/setSalesOrderExtra';

        let body = {
            SOExtraId: soExtra.soExtraId,
            SalesOrderId: soId,
            SOVersionId: soVersionId,
            LineNum: soExtra.lineNum,
            RefLineNum: soExtra.refLineNum,
            ItemExtraId: soExtra.itemExtraId,
            ExtraName: soExtra.extraName,
            Note: soExtra.note,
            Qty: soExtra.qty,
            Price: soExtra.price,
            Cost: soExtra.cost,
            Gpm: soExtra.gpm,
            PrintOnSO: soExtra.printOnSO ? 1 : 0,
            IsDeleted: soExtra.isDeleted
        };

        return this.httpService.Post(url, body).map(
            data => {
                let res = data.json();
                let soExtras = res.ExtraListResponse || [];
                let soExtraId = res.soExtraId;

                let soExtraList = new Array<SalesOrderExtra>();

                console.log('setSalesOrderExtra: Get response!')
                soExtras.forEach(element => {
                    soExtraList.push({
                        soExtraId: element.SOExtraId,
                        lineNum: element.LineNum,
                        refLineNum: element.RefLineNum,
                        extraName: element.ExtraName,
                        itemExtraId: element.ItemExtraId,
                        note: element.Note,
                        qty: element.Qty,
                        price: element.Price,
                        cost: element.Cost,
                        gpm: element.Gpm,
                        printOnSO: element.PrintOnSO,
                        isDeleted: element.isDeleted
                    })
                });
                return soExtraList === [] ? soExtraList : soExtraId;
            }
        );
    }

    getSalesOrderData(soId: number, soVersionId: number)
    {
        return Observable.forkJoin(
            this.getSalesOrderParts(soId, soVersionId),
            this.quoteService.getPackagingTypes(),
            this.quoteService.getCommodities(),
            this.sharedService.getDeliveryRules(),
            this.quoteService.getConditionTypes()
        );
    }

    getSalesOrderParts(soId: number, soVersionId: number) {
        return this.httpService.Get('api/sales-order/getSalesOrderLines?soId=' + soId + '&soVersionId=' + soVersionId).map(
            data => {
                let res = data.json();
                let partList = res.soLines;
                let soParts = partList.map(this.mapToDomain);
                return soParts;
            }
        );
    }

    GetSaleOrderLineAllocations(soLineId: number){
        let url = 'api/sales-order/lines/'+soLineId+'/allocations';       
            return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let soAllocations = new Array<SalesOrderAllocations>();
                res.forEach(element => {
                    soAllocations.push({
                        FromStock: element.FromStock,
                        LineNum: element.LineNum,
                        LineRev: element.LineRev,
                        POLineID: element.POLineID,
                        PreAllocated: element.PreAllocated,
                        PurchaseOrderID: element.PurchaseOrderID,
                        Received: element.Received,
                        WarehouseID: element.WarehouseID,
                        WarehouseName: element.WarehouseName,
                        TransferID:element.TransferID,
                        TransferStatus:element.TransferStatus,
                        TransferType:element.TransferType,
                        TransferDate:this.dateFormatter.formatDate(element.TransferDate),
                    })              
                });
                return soAllocations;
            }
        )       
    }

    GetSaleOrderLineShipments(soLineId: number){
        const _self = this;
        let url = 'api/sales-order/lines/'+soLineId+'/shipments';       
        return this.httpService.Get(url).map(
        data => {
            let res = data.json();
            let soShipments = res.map(element => {
                return {
                    ShipmentDate:_self.dateFormatter.formatDate(element.ShipmentDate),
                    QuantityShipped: element.QuantityShipped,
                    DeliveryId: element.DeliveryId,
                    Carrier: element.Carrier,
                    TrackingNumber: element.TrackingNumber,
                }
            });
            return soShipments;
        }
    )    
    }

    mapToDomain(resObject) {

        let soPart: SalesOrderPart;
        soPart = {
            soLineId: resObject.soLineId,
            lineNo: resObject.lineNo,
            customerLineNo: resObject.customerLineNo,
            manufacturer: resObject.manufacturer,
            commodityName: resObject.commodityName,
            customerPN: resObject.customerPN,
            quantity: resObject.quantity,
            reserved: resObject.reserved,
            price: resObject.price,
            cost: resObject.cost,
            packagingId: resObject.packagingId,
            packagingConditionId: resObject.packagingConditionId,
            shipDate: resObject.shipDate,
            dateCode: resObject.dateCode,
            itemId: resObject.itemId,
            dueDate: resObject.dueDate,
            deliveryRuleId: resObject.deliveryRuleId,
            deliveryStatus: resObject.deliveryStatus,
            invoiceStatus:resObject.invoiceStatus,
            comments: resObject.comments,
            partNumber: resObject.partNumber,
            commodityId:resObject.commodityId,
            statusName: resObject.statusName
        };
        return soPart;
    }
    
    deleteSalesOrderExtra(soExtraIds: number[]){
        let url = 'api/sales-order/deleteSalesOrderExtras';
        let body = [];
        soExtraIds.forEach(x => { body.push({ SOExtraId: x }) });

        return this.httpService.Post(url, body).map(
            data => {
                 return true; 
            }
        );
    }

    getSalesOrderDetailsData(objectTypeId:number,soId:number,soVersionId:number,selectedAccount:number){
      return Observable.forkJoin(
        this.getSalesOrderDetails(soId,soVersionId),
        this.getAccounts(selectedAccount),
        this.getStatus(),
        this.getCountries(),
        this.sharedService.getAllIncoterms(),
        this.sharedService.getAllCurrencies(),
        this.carrierService.getCarriers(),
        this.sharedService.getPaymentTerms(),
        this.sharedService.getAllFreightPaymentMethods(),
        this.sharedService.getDeliveryRules(),
        this.sharedService.getCarrierMethods(),
        this.sharedService.getAllOrganizations(objectTypeId),
        this.sharedService.getAllRegions()
      )
    }

    getAccountProjects(accountId: number){
        return this.sharedService.getAllProjects(accountId, 0);
    }
    getCarrierMethods(carrierId:number){
        return this.sharedService.getCarrierMethods(carrierId);
    }
  
    getSalesOrderDetails(soId,soVersionId){
        let url = 'api/sales-order/getSalesOrderDetails?soId=' + soId + '&versionId=' + soVersionId;
        return this.httpService.Get(url).map(
            data=>{
                let res = data.json();
                let soDetails = new SalesOrderDetails();
                const orderDate = new Date(res.orderDate);
                var dd = orderDate.getDate();
                var mm = orderDate.getMonth()+1;
                var yyyy = orderDate.getFullYear();

                soDetails ={
                    soId:res.salesOrderId,
                    soVersionId:res.versionId,
                    statusId:res.statusId,
                    statusName:res.statusName,
                    accountId:res.accountId,
                    accountName:res.accountName,
                    contactId:res.contactId,
                    contactName:res.contactName,
                    freightPaymentId: res.freightPaymentId == 0? null: res.freightPaymentId ,
                    freightAccount: res.freightAccount,
                    projectId: res.projectId == 0? null: res.projectId,
                    incotermId: res.incotermId == 0? null: res.incotermId,
                    shippingMethodId: res.shippingMethodId == 0? null: res.shippingMethodId,
                    shipFromRegionId: res.shipFromRegionId == 0? null: res.shipFromRegionId,
                    paymentTermId: res.paymentTermId == 0? null: res.paymentTermId,
                    currencyId: res.currencyId,
                    orderDate: `${yyyy}-${mm < 10? '0' + mm: mm}-${dd < 10? '0' + dd: dd}`,
                    phone:res.phone,
                    email:res.email,
                    shipLocationId:res.shipLocationId,
                    shipLocationName:res.shipLocationName,
                    customerPo:res.customerPo,
                    countryId:res.countryId,
                    countryName:res.countryName,
                    soCost: res.soCost,
                    soPrice: res.soPrice,
                    soProfit: res.soProfit,
                    soGpm: res.soGpm,
                    shippingNotes : res.shippingNotes,
                    qcNotes : res.qcNotes,
                    deliveryRuleId: res.deliveryRuleId,
                    carrierId: res.carrierId,
                    carrierName: res.carrierName,
                    methodName: res.methodName,
                    carrierMethodId: res.carrierMethodId,
                    organizationId: res.organizationId,
                    userId: res.userId,
                    externalId: res.externalId,
                    organization: {
                        organizationName: res.organization.organizationName,
                        address1: res.organization.address1,
                        address2: res.organization.address2,
                        address4: res.organization.address4,
                        houseNumber: res.organization.houseNumber,
                        street: res.organization.street,
                        city: res.organization.city,
                        stateCode: res.organization.stateCode,
                        stateName: res.organization.stateName,
                        countryName: res.organization.countryName,
                        postalCode: res.organization.postalCode,
                        officePhone: res.organization.officePhone,
                        mobilePhone: res.organization.mobilePhone,
                        fax: res.organization.fax,
                        email: res.organization.email,
                        bank: {
                            bankName: res.organization.bank.bankName,
                            branchName: res.organization.bank.branchName,
                            usdAccount: res.organization.bank.usdAccount,
                            eurAccount: res.organization.bank.eurAccount,
                            swiftAccount: res.organization.bank.swiftAccount,
                            routingNumber: res.organization.bank.routingNumber
                        }
                    }
                
                }
                return soDetails;
            }
        ) 
    }

    setSalesOrderPart(soPart: SalesOrderPart, soLineId: number, soId: number, soVersionId: number, isIshItem:boolean){
        
        const regex = /[^0-9]/g;
        let url = 'api/sales-order/setSalesOrderLine';
        let body = {
            soLineId: soLineId,
            quoteLineId: soPart.soLineId,
            lineNo: soPart.lineNo,
            customerLineNo: soPart.customerLineNo,
            manufacturer: soPart.manufacturer,
            customerPN: soPart.customerPN,
            quantity: parseInt(String(soPart.quantity).replace(regex, '')),
           // reserved: soPart.reserved,
            price: soPart.price,
            cost: soPart.cost,
            dateCode: soPart.dateCode,
            packagingId: soPart.packagingId,
            packagingConditionId: soPart.packagingConditionId,
            deliveryRuleId: soPart.deliveryRuleId,
            shipDate: soPart.shipDate,
            dueDate:soPart.dueDate,
            itemId: soPart.itemId,
            soId: soId,
            soVersionId: soVersionId,
            isIhsItem:isIshItem
        }

        return this.httpService.Post(url, body).map(
            data =>
            { return this.mapToDomain(data.json()); },
            error => { return error.json(); }
        );
    }
    getAccounts(selectedAccount){
        let url ='api/common/getAccounts?selectedAccount='+selectedAccount;
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let accounts = new Array<Customers>();
                res.accounts.forEach(element => {
                    accounts.push({
                        id:element.id,
                        name:element.name
                    }
                    )
                });
               return accounts; 
            }
        )
    }

    getStatus(){
       let url ='api/sales-order/getStatusBySalesOrder';
       return this.httpService.Get(url).map(
           data=>{
               let res = data.json();
               let status = new Array<Status>();

               res.statusList.forEach(element => {
                   status.push({
                       id:element.id,
                       name:element.name,
                       isDefault:false
                   })
               });
               return status
           }
       )
    }

    getCountries(){
        let url ='api/common/GetCountryList';
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let countries = new Array<Countries>();

                res.countryList.forEach(element => {
                    countries.push({
                        CountryID:element.countryId,
                        CountryName:element.name,
                        CountryCode:element.code,
                        CodeForSap: null
                    })
                });
                return countries;
            }
        )
    }

    getBillingLocation(accountId){
        let url = 'api/account/getAccountBillingAddress?accountId=' + accountId;
        return this.httpService.Get(url).map(data=>{
            let res= data.json();
            let location = new LocationsByAccount();
            location.locationId = res.locationId;
            location.accountId = res.accountId;
            location.name = res.name;
            location.typeId = res.typeId;
            location.locationTypeName = res.locationTypeName;
            location.houseNo = res.houseNo;
            location.street = res.street;
            location.addressLine1 = res.addressLine1;
            location.addressLine2 = res.addressLine2;
            location.addressLine4 = res.addressLine4;
            location.city = res.city;
            location.stateName = res.stateName;
            location.formattedState = res.formattedState;
            location.note = res.Note;
            location.stateId = res.stateId;
            location.postalCode = res.postalCode;
            return location;
        });
    }

    getLocationsByAccountId(accountId){
        let url='api/common/GetLocationsByAccountId?accountId='+ accountId;
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let locations = new Array<LocationsByAccount>();

                res.locations.forEach(element => {
                    locations.push({
                        locationId:element.locationId,
                        accountId:element.accountId,
                        name:element.name,
                        typeId:element.typeId,
                        locationTypeName:element.locationTypeName,
                        houseNo:element.houseNo,
                        street:element.street,
                        addressLine1:element.addressLine1,
                        addressLine2:element.addressLine2,
                        addressLine4:element.addressLine4,
                        city:element.city,
                        stateName:element.stateName,
                        formattedState:element.formattedState,
                        note:element.Note,
                        stateId:element.stateId,
                        postalCode:element.postalCode
                    })
                });
                return locations;            
            }
        )
    }

     getContactsByAccountId(accountId: number, isActive:boolean = null) {
            let url = 'api/common/GetContactsByAccountId?accountId='+accountId + (isActive != null ? '&isActive=' + isActive : '');
            
            return this.httpService.Get(url).map(data => {
              let res = data.json();
              let contacts = new Array<Contacts>();
              res.contacts.forEach(element => {
                contacts.push({
                  firstName: element.firstName,
                  lastName: element.lastName,
                  email: element.email,
                  phone: element.phone,
                  owner: element.owner,
                  title: element.title,
                  accountId: element.accountId,
                  contactId: element.contactId
                })
              });
             return contacts;
           }
        )
     }

    deleteQuoteParts(soLineIds: number[]) {

        let url = 'api/sales-order/deleteSalesOrderLines';
        let body = [];
        soLineIds.forEach(x => { body.push({ soLineId: x }) });

        return this.httpService.Post(url, body).map(
            data =>
            { return true; },
            error => { return error.json(); }
        );
    }

    setSalesOrderDetails(soId: number, soVersionId: number,soDetails:SalesOrderDetails){
        let url='api/sales-order/setSalesOrderDetails';
        let body={
            SalesOrderId:soId,
            VersionID:soVersionId,
            AccountID:soDetails.accountId,
            ContactID:soDetails.contactId,
            StatusID:soDetails.statusId,
            ShipLocationID:soDetails.shipLocationId,
            CustomerPo:soDetails.customerPo,
            UltDestinationID:soDetails.countryId,
            PaymentTermID: soDetails.paymentTermId,
            OrderDate: soDetails.orderDate,
            FreightAccount: soDetails.freightAccount,
            FreightPaymentID: soDetails.freightPaymentId,
            IncotermID: soDetails.incotermId,
            ProjectID: soDetails.projectId,
            CurrencyID: soDetails.currencyId,
            DeliveryRuleID: soDetails.deliveryRuleId,
            ShippingMethodID: soDetails.shippingMethodId,
            ShipFromRegionId: soDetails.shipFromRegionId,
            ShippingNotes : soDetails.shippingNotes,
            QCNotes : soDetails.qcNotes,
            OrganizationID:soDetails.organizationId,
            CarrierID:soDetails.carrierId,
            CarrierMethodID:soDetails.carrierMethodId
        }
        return this.httpService.Post(url,body).map(
            data=>
                {return true;},
                error =>{return error.json();}
            
        )

    }

    getSalesOrderObjectTypeId(){
        let url = 'api/sales-order/getSalesOrderObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getSOLinesObjectTypeId(){
        let url = 'api/sales-order/getSOLineObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getSOExtraObjectTypeId(){
        let url = 'api/sales-order/getSOExtraObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getSalesOrderCommentTypeId(){
        let url = 'api/sales-order/getSalesOrderCommentTypeIds';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                const commentTypeMap = _.map(res.commentTypeIds, (element) => {
                    return _.assign({}, {
                        id: element.commentTypeId,
                        name: element.typeName
                    });
                });
                return commentTypeMap;
            }
        )
    }

    partCommentIncrement(){
        this.partCommentIncreSubject.next({ increment: true })
    }

    getPartCommentStatus(): Observable<any>{
        return this.partCommentIncreSubject.asObservable();
    }

    extraCommentIncrement(){
        this.extraCommentIncreSubject.next({ increment: true })
    }

    getExtraCommentStatus(): Observable<any>{
        return this.extraCommentIncreSubject.asObservable();
    }

    syncSalesOrder(soId:number, soVersionId:number){
        let url = 'api/sales-order/sync?soId='+soId+'&soVersionId='+soVersionId;
        return this.httpService.Post(url,{}).map(
            data => {
            
                let res = data.json();
                return {transactionId:res.transactionId, errorMessage:res.errorMessage};
            },
            error => { return error.json(); }
        )
    }

    getAccountNumber(accountId:number,carrierId:number){
      let url = 'api/carrier/getAccountNumber?accountId='+accountId+'&carrierId='+carrierId;
      return this.httpService.Get(url).map(data=>{
          let res= data.json();
          return res;
      })
    }

    getSalesOrderLineByAccountId(accountId:number, contactId: number){
        const _self = this;
      let url='api/sales-order/getSalesOrderLineByAccountId?accountId='+accountId+'&contactId='+contactId;
      return this.httpService.Get(url).map(
          data=>{
              let res = data.json();
              const salesOrderLine = _.map(res.soLineList,(element)=>{
                  return {
                      contact:element.fullName,
                      salesOrderID:element.salesOrderID,
                      lineNum:element.lineNum,
                      soExternalId: element.soExternalId,
                      versionId: element.versionId,
                      statusId:element.statusId,
                      statusName:element.statusName,
                      partNumber:element.partNumber,
                      manufacturer:element.manufacturer,
                      qty:element.qty,
                      price:element.price,
                      cost:element.cost,
                      gpm:element.gpm,
                      dateCode:element.datecode,
                      packaging:element.packaging,
                      owners:element.owners,
                      orderDate:_self.dateFormatter.formatDate(element.orderDate),
                      shipDate:_self.dateFormatter.formatDate(element.shipDate),
                      status:element.statusName
                  };
              });
              return salesOrderLine;
          }
      )
    }

}
