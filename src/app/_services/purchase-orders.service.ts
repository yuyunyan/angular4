import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { PurchaseOrder } from './../_models/purchase-orders/purchaseOrder';
import { PurchaseOrderExtra } from './../_models/purchase-orders/purchaseOrderExtra';
import { ItemsService } from './items.service';
import { Supplier } from './../_models/shared/supplier';
import { PaymentTerm } from './../_models/shared/paymentTerm';
import { Currency } from './../_models/shared/currency';
import { QuoteService }  from './quotes.service';
import { PurchaseOrderPart }  from './../_models/purchase-orders/purchaseOrderPart';
import { ContactDetails } from './../_models/contactsAccount/contactDetails';
import { Status } from './../_models/shared/status';
import { DateFormatter } from '../_utilities/dateFormatter/dateFormatter';
import * as _ from 'lodash';


@Injectable()
export class PurchaseOrdersService {
    private dateFormatter = new DateFormatter();
    private partCommentIncreSubject = new Subject<any>();
    private extraCommentIncreSubject = new Subject<any>();
    
    constructor(private httpService: HttpService, private itemsService: ItemsService, private quoteService: QuoteService) {}

    SavePurchaseOrder(poDetails: PurchaseOrder) {
      let url = 'api/purchase-order/setPurchaseOrderDetails';
        let body = {
            PurchaseOrderId: poDetails.purchaseOrderId,
            VersionId: poDetails.versionId,
            AccountId: poDetails.accountId,
            ContactId: poDetails.contactId,
            FromLocationId: poDetails.shipFromLocationId,
            ToWarehouseID: poDetails.toWarehouseId,
            IncotermId: poDetails.incotermId,
            CurrencyId: poDetails.currencyId,
            ShippingMethodId: poDetails.shippingMethodId,
            conditionId: poDetails.conditionId,
            OrderDate: poDetails.orderDate,
            StatusId: poDetails.statusId,
            PaymentTermId: poDetails.paymentTermId,
            OrganizationId: poDetails.organizationId,
            PONotes : poDetails.poNotes
        }
        return this.httpService.Post(url, body).map(data => {
            return data.json();
        });
    }

    GetAccountDetails(accountId: number) {

        let basicDetailsUrl = 'api/account/getBasicDetails?accountId=' + accountId;
        return this.httpService.Get(basicDetailsUrl).map(
            data => {
                let res = data.json();
                return res;
            })

    }
    GetPaymentTerms() {
        let url = 'api/purchase-order/getPaymentTermsList?paymentTermId=0';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let paymentTerms = res.paymentTerms;
                let paymentTermList = new Array<PaymentTerm>();

                for (let i = 0; i < paymentTerms.length; i++) {
                    let paymentTerm: PaymentTerm;
                    paymentTerm = {
                        PaymentTermID: paymentTerms[i].PaymentTermID,
                        Name: paymentTerms[i].TermName,
                        Description: paymentTerms[i].TermDesc,
                        NetDueDays: paymentTerms[i].NetDueDays,
                        DiscountDays: paymentTerms[i].DiscountDays,
                        DiscountPercent: paymentTerms[i].DiscountPercent
                    };
                    paymentTermList.push(paymentTerm);
                }
                return paymentTermList;
            }
        );

    }

    getPurchaseOrderDetails(poId,poVersionId){
        let url = 'api/purchase-order/getPurchaseOrderDetails?purchaseOrderId=' + poId + '&versionId=' + poVersionId;
        return this.httpService.Get(url).map(data=>{
            let res = data.json();
            let poDetails = new PurchaseOrder();
            poDetails = {
                purchaseOrderId: res.purchaseOrderId,
                versionId: res.versionId,
                orderDate : res.orderDate,
                owner : res.owners,
                contactFirstName: res.contactFirstName,
                contactLastName: res.contactLastName,
                contactFull : res.contactFirstName + ' ' + res.contactLastName,
                vendor : res.accountName,
                contactPhone: res.contactPhone,
                contactEmail: res.contactEmail,
                conditionId: res.conditionId,
                shipFromLocationId: res.shipFromLocationId,
                shippingMethodId: res.shippingMethodId,
                toWarehouseId: res.toWarehouseId,
                currencyId: res.currencyId,
                paymentTermId: res.paymentTermId,
                contactId: res.contactId,
                accountId: res.accountId,
                statusId: res.statusId,
                incotermId: res.incotermId,
                organizationId: res.organizationId,
                cost: res.cost,
                poNotes : res.poNotes,
                userId: res.userId,
                externalId: res.externalId,
                hasPendingTransaction: res.hasPendingTransaction,
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
            return poDetails;
        });
    }

    getStatusList(){
        let url = 'api/purchase-order/getStatusByPurchaseOrder';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let statuses = new Array<Status>();
 
                res.statusList.forEach(element => {
                    statuses.push({
                        id:element.id,
                        name:element.name,
                        isDefault:element.isDefault
                    })
                });
                return statuses;
            }
        )
    }


    getPurchaseOrderList(searchString: string, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean) {
        let sortColumnName: string;

        switch(sortCol){
            case 'contactFull':
                sortColumnName = 'ContactFirstName';
                break;
            case 'purchaseOrderId':
            sortColumnName = 'purchaseOrderId';
                break;
            case 'vendorName':
                sortColumnName = 'AccountName';
                break;
            case 'orderStatus':
                sortColumnName = 'StatusName';
                break;
            case 'orderDate':
                sortColumnName = 'OrderDate';
                break;
            default:
                sortColumnName = sortCol;
        };

        let data = {
            SearchString: searchString,
            RowOffset: rowOffset,
            RowLimit: rowLimit,
            DescSort: descSort,
            SortCol : sortColumnName,
            }
        let url = 'api/purchase-order/getPurchaseOrderList';
        return this.httpService.Post(url, data).map(data => {
            let res = data.json();
            let purchaseOrders = new Array<PurchaseOrder>();
            res.purchaseOrders.forEach(element => {
                let con = new PurchaseOrder();
                con.purchaseOrderId = element.purchaseOrderId;
                con.versionId = element.versionId;
                con.vendor = element.accountName;
                con.accountId = element.accountId;
                con.contactFirstName =  element.contactFirstName;
                con.contactLastName =  element.contactLastName
                con.contactFull = element.contactFirstName + ' ' + element.contactLastName;
                con.orderStatus = element.statusName;
                con.contactId = element.contactId;
                con.orderDate = element.orderDate;
                con.owner = element.owners;
                con.externalId = element.externalId;
                purchaseOrders.push(con);
            })

            return { results: purchaseOrders, totalRowCount: res.totalRowCount, error: null };
        })
    }

    getPurchaseOrderExtraList(poId: number, poVersionId: number, rowOffset: number, rowLimit: number){
        let url = 'api/purchase-order/getPurchaseOrderExtras?PurchaseOrderId=' + poId + '&POVersionId=' + poVersionId + '&RowOffset=' + rowOffset + '&RowLimit=' + rowLimit;

        return this.httpService.Get(url).map(data => {
            let res = data.json();
            let poExtras = new Array<PurchaseOrderExtra>();
            res.ExtraListResponse.forEach((element) => {
                let poExtra = new PurchaseOrderExtra();
                poExtra.poExtraId = element.POExtraId;
                poExtra.lineNum = element.LineNum;
                poExtra.refLineNum = element.RefLineNum;
                poExtra.itemExtraId = element.ItemExtraId;
                poExtra.extraName = element.ExtraName;
                poExtra.cost = element.Cost;
                poExtra.qty = element.Qty;
                poExtra.extraDescription = element.ExtraDescription;
                poExtra.note = element.Note;
                poExtra.printOnPO = element.PrintOnPO === 1;
                poExtra.isDeleted = element.IsDeleted;
                poExtra.comments = element.Comments

                poExtras.push(poExtra);
            });
            return poExtras
        })
    }

    getPurchaseOrderExtraData(poId: number, poVersionId: number, rowOffset: number, rowLimit: number){
        return Observable.forkJoin(
            this.getPurchaseOrderExtraList(poId, poVersionId, rowOffset, rowLimit),
            this.itemsService.GetItemExtras()
        )
    }

    setPurchaseOrderExtra(poExtra: PurchaseOrderExtra, poId: number, poVersionId: number) {
        let url = 'api/purchase-order/setPurchaseOrderExtra';

        let body = {
            POExtraId: poExtra.poExtraId,
            PurchaseOrderId: poId,
            POVersionId: poVersionId,
            RefLineNum: poExtra.refLineNum,
            ItemExtraId: poExtra.itemExtraId,
            ExtraName: poExtra.extraName,
            Note: poExtra.note,
            Qty: poExtra.qty,
            Cost: poExtra.cost,
            PrintOnPO: poExtra.printOnPO ? 1 : 0,
            IsDeleted: poExtra.isDeleted
        };

        return this.httpService.Post(url, body).map(
            data => {
                let res = data.json();
                let poExtras = res.ExtraListResponse || [];
                let poExtraId = res.poExtraId;

                let poExtraList = new Array<PurchaseOrderExtra>();

                poExtras.forEach(element => {
                    poExtraList.push({
                        poExtraId: element.POExtraId,
                        lineNum: element.LineNum,
                        refLineNum: element.RefLineNum,
                        extraName: element.ExtraName,
                        itemExtraId: element.ItemExtraId,
                        note: element.Note,
                        qty: element.Qty,
                        cost: element.Cost,
                        printOnPO: element.PrintOnPO,
                        isDeleted: element.isDeleted
                    })
                });
                return poExtraList === [] ? poExtraList : res;
            }
        );
    }

    deletePurchaseOrderParts(poLineIds: number[]) {
        console.log(poLineIds);
        let url = 'api/purchase-order/deletePurchaseOrderLines';
        let body = [];
        poLineIds.forEach(x => { body.push({ poLineId: x }) });

        return this.httpService.Post(url, body).map(
            data =>
            { return true; },
            error => { return error.json(); }
        );
    }

    deletePurchaseOrderExtra(poExtraIds: number[]){
			let url = 'api/purchase-order/deletePurchaseOrderExtras';
			let body = [];
			poExtraIds.forEach(x => { body.push({ POExtraId: x }) });

			return this.httpService.Post(url, body).map(
				data => {
					return true; 
				},
				error => {
					return error.json();
				}
			);
    }

    getPurchaseOrderData(poId:number, poVersionId:number)
    {
        return Observable.forkJoin(
            this.getPurchaseOrderParts(poId, poVersionId),
            this.quoteService.getPackagingTypes(),
            this.quoteService.getCommodities(),
            this.quoteService.getConditionTypes()
        );
    }

    getPurchaseOrderParts(poId: number, poVersionId: number) {
        return this.httpService.Get('api/purchase-order/getPurchaseOrderLines?poId=' + poId + '&poVersionId=' + poVersionId).map(
            data => {
                let res = data.json();
                let partList = res.poLines;
                let poParts = partList.map(this.mapToDomain);
                return poParts;
            }
        );
    }

    getPurchaseOrderSyncStatus(poId: number, poVersionId: number){
        let url = 'api/purchase-order/validateSync?purchaseOrderId=' + poId + '&versionId=' + poVersionId;
        return this.httpService.Get(url).map( data => {
            let res = data.json();
            return res;          
        });
    }

    setPurchaseOrderPart(poPart: PurchaseOrderPart, poLineId: number, poId: number, poVersionId: number, isIhs: boolean){
        
        let url = 'api/purchase-order/setPurchaseOrderLine';

        let body = {
            poLineId: poLineId,
            lineNo: poPart.lineNo,
            vendorLineNo: poPart.vendorLine,
            statusId: poPart.statusId,
            qty: poPart.quantity,
            cost: poPart.cost,
            dateCode: poPart.dateCode,
            packagingId: poPart.packagingId,
            packageConditionId: poPart.conditionId,
            dueDate:poPart.dueDate,
            promisedDate: poPart.promisedDate,
            itemId: poPart.itemId,
            poId: poId,
            poVersionId: poVersionId,
            isSpecBuy : poPart.isSpecBuy,
            specBuyForUserId : poPart.specBuyForUserId,
            specBuyForAccountId : poPart.specBuyForAccountId,
            specBuyReason : poPart.specBuyReason,
            isIhsItem: isIhs
        }

        return this.httpService.Post(url, body).map(
            data =>
            { return this.mapToDomain(data.json()); },
            error => { return error.json(); }
        );
    }

    mapToDomain(resObject) {

        let poPart: PurchaseOrderPart;
        poPart = {
            poLineId: resObject.poLineId,
            statusId: resObject.statusId,
            lineNo: resObject.lineNo,
            vendorLine: resObject.vendorLine,
            manufacturer: resObject.manufacturer,
            commodityName: resObject.commodityName,
            quantity: resObject.quantity,
            cost: resObject.cost,
            packagingId: resObject.packagingId,
            conditionId: resObject.conditionId,
            dateCode: resObject.dateCode,
            itemId: resObject.itemId,
            dueDate: resObject.dueDate,
            promisedDate: resObject.promisedDate,
            comments: resObject.comments,
            isSpecBuy : resObject.isSpecBuy,
            specBuyForUserId : resObject.specBuyForUserId,
            specBuyForAccountId : resObject.specBuyForAccountId,
            specBuyReason : resObject.specBuyReason,
            partNumber: resObject.partNumber,
            allocatedQty : resObject.allocatedQty,
            allocatedSalesOrderId: resObject.allocatedSoId,
            allocatedSalesOrderVersionId: resObject.allocatedSoVersionId,
            externalId: resObject.externalId
        };
        return poPart;
    }

    getPurchaseOrderObjectTypeId(){
        let url = 'api/purchase-order/getPurchaseOrderObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getPOLinesObjectTypeId(){
        let url = 'api/purchase-order/getPOLineObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getPOExtraObjectTypeId(){
        let url = 'api/purchase-order/getPOExtraObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getPurchaseOrderCommentTypeId(){
        let url = 'api/purchase-order/getPurchaseOrderCommentTypeIds';
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

    getPoObjectTypeId(){
        let url="api/objectTypes/getPoObjectTypeId";
        return this.httpService.Get(url).map(
            data=>{
                let res=data.json();
                return res.objectTypeId;
            }
        )
    }

    getManufacturer(itemId){
        let url = "api/purchase-order/getMfr?itemId=" + itemId;
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.mfr;
            }
        ) 
    }

    syncPurchaseOrder(poId:number, poVersionId:number){
        let url = 'api/purchase-order/sync?poId='+poId+'&poVersionId='+poVersionId;
        return this.httpService.Post(url,{}).map(
            data => {
                let res = data.json();

                return {transactionId:res.transactionId, errorMessage:res.errorMessage};
            },
            error => { return error.json(); }
        )
    }

    getPurchaseOrderLineByAccountId(accountId:number,contactId:number){
        const _self = this;
        let url='api/purchase-order/getPurchaseOrderLineByAccountId?accountId=' +accountId +'&contactId='+contactId;
        return this.httpService.Get(url).map(data=>{
            let res= data.json();
            const poLine= _.map(res.PurchaseOrderLineList,(element)=>{
                return {
                    contactName:element.fullName,
                    lineNum:element.lineNum,
                    lineRev:element.lineRev,
                    poExternalId:element.poExternalId,
                    purchaseOrderId:element.purchaseOrderID,
                    versionId:element.versionId,
                    itemId: element.itemId,
                    buyer:element.buyer,
                    partNumber:element.partNumber,
                    manufacturer:element.manufacturer,
                    location:element.location,
                    orderDate:_self.dateFormatter.formatDate(element.orderDate),
                    qty:element.qty,
                    cost:element.cost,
                    dataCode:element.datecode,
                    packaging:element.packaging,
                    status:element.statusName
                };
            });
            return poLine;
        })
    }
   
}
