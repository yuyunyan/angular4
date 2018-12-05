import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { QuoteHeader } from './../_models/quotes/quoteHeader';
import { QuoteDetails } from './../_models/quotes/quoteDetails';
import { QuoteOptions, Customers, ContactsList, ShipAddress } from './../_models/quotes/quoteOptions';
import { QuotePart} from './../_models/quotes/quotePart';
import { QuoteRouteToObject } from './../_models/quotes/quoteRouteToObject';
import { Status } from './../_models/shared/status';
import { Commodity} from './../_models/shared/commodity';
import { PackagingType } from './../_models/shared/packagingType';
import { ConditionType } from './../_models/shared/conditionType';
import { Quote } from './../_models/quotes/quote';
import { QuoteExtraItem } from './../_models/quotes/quoteExtraItem';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { List } from 'linqts';
import { Location } from './../_models/contactsAccount/contactDetails';
import { ContactsService } from './../_services/contacts.service';
import { ItemsService } from './../_services/items.service';
import { UsersService } from './../_services/users.service';
import { AccountByObjectType } from './../_models/common/accountByObjectType';
import * as _ from 'lodash';
import { QuoteType } from '../_models/quotes/quoteType';
import { DateFormatter } from '../_utilities/dateFormatter/dateFormatter';

@Injectable()
export class QuoteService {
    private dateFormatter = new DateFormatter();
    private partCommentIncreSubject = new Subject<any>();
    private extraCommentIncreSubject = new Subject<any>();

    constructor(private httpService: HttpService, private contactsService: ContactsService, private itemsService: ItemsService,
    private usersService: UsersService) {
 
    }
    GetQuoteList(SearchString: string, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean,  filterCol?: string , filterText?: string, includeCanceled?:boolean, includeCompleted?:boolean) {
        let sortColumnName: string;
        let filterColumnName : string ;

        switch(SortCol){
            case 'ContactFullName':
                sortColumnName = 'ContactFirstName';
                break;
            case 'AccountName':
                sortColumnName = 'AccountName';
                break;
            case 'StatusName':
                sortColumnName = 'StatusName';
                break;
            case 'SentDate':
                sortColumnName = 'SentDate';
                break;
            case 'Owners':
                sortColumnName = 'Owners';
                break;
            case 'CountryName':
                sortColumnName = 'CountryName';
                break;
            default:
                sortColumnName = '';
        };

        switch(filterCol){
            case 'ContactFullName':
                filterColumnName = 'ContactFirstName'; 
                break;
            case 'AccountName':
                filterColumnName = 'AccountName'; 
                break;
            case 'StatusName':
                filterColumnName = 'StatusName'; 
                break;
            case 'SentDate':
                filterColumnName = 'SentDate'; 
                break;
            case 'Owners':
                filterColumnName = 'Owners';
                break;
            case 'CountryName':
                filterColumnName = 'CountryName'; 
                break;
            default:
                filterColumnName = null;
      
        };

        let data = {
            SearchString: SearchString,
            RowOffset: RowOffset,
            RowLimit: RowLimit,
            DescSort: DescSort,
            SortCol : sortColumnName,
            FilterBy: filterColumnName,
            FilterText : filterText,
            IncludeCompleted : includeCompleted,
            IncludeCanceled:includeCanceled
            }
        let url = 'api/quote/getQuotesList';
        return this.httpService.Post(url , data).map(

            data => {
                let res = data.json();
                var quotes = new List<Quote>();
                res.quotes.forEach(element => {
                    let quote = new Quote();
                    quote.QuoteID = element.QuoteId;
                    quote.AccountName = element.AccountName;
                    quote.AccountID = element.AccountId;
                    quote.ContactID = element.ContactId;
                    quote.ContactFirstName = element.ContactFirstName;
                    quote.ContactLastName = element.ContactLastName;
                    quote.ContactFullName = element.ContactFullName;
                    quote.StatusID = element.StatusId;
                    quote.StatusName = element.StatusName;
                    quote.OrganizationID = element.OrganizationId;
                    quote.SentDate = element.SentDate ? element.SentDate : null;
                    quote.Owners = element.Owners;
                    quote.CountryName = element.CountryName;
                    quote.VersionID = element.VersionId;
                    quotes.Add(quote);
                })
                return { results: quotes, totalRowCount: res.totalRowCount, error: null };
            }, error => {
                console.log("Quote list service call failed");
            })

    }

    getQuoteDetailsData(objectTypeId: number,quoteId: number, versionId: number, accountId: number) {
        return Observable.forkJoin(
            this.getQuoteDetails(quoteId, versionId),
            this.getQuoteDetailsOptions(accountId),
            this.getNonBillingAddress(accountId),
            this.contactsService.getAccountContacts(accountId),
            this.getAllCurrencies(),
            this.getAllIncoterms(),
            this.getAllOrganizations(objectTypeId),
            this.getPaymentTerms(),
            this.getQuoteTypesList()
        );
    }

    getDetailsForNewQuote(objectTypeId:number){
        return Observable.forkJoin(
            this.getAllCurrencies(),
            this.getAllIncoterms(),
            this.getAllOrganizations(objectTypeId),
            this.getPaymentTerms(),
            this.getQuoteOptionsForCreatNew(),
            this.getQuoteTypesList()
        );
    }

    getQuoteOptionsForCreatNew() {
        let url = 'api/quote/getAccountsStatusList';
        let customers: Customers[];
        let status: Status[];
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                let quoteOptions = new QuoteOptions();
                customers = new Array<Customers>();
                status = new Array<Status>();

                res.customers.forEach(element => {
                    customers.push({
                        id: element.accountId,
                        name: element.accountName
                    })
                });
                res.status.forEach(element => {
                    status.push({
                        id: element.id,
                        name: element.name,
                        isDefault:false
                    })
                });
                quoteOptions.customers = customers;
                quoteOptions.status = status;

                return quoteOptions;
            }
        )
    }
    getQuoteDetails(quoteId: number, versionId: number) {
        let quoteDetialsUrl = 'api/quote/getQuoteDetails?quoteId=' + quoteId + '&versionId=' + versionId;
        return this.httpService.Get(quoteDetialsUrl).map(
            data => {
                let res = data.json();
                let quoteDetails = new QuoteDetails();
                quoteDetails = {
                    customerId: res.customerId,
                    contactId: res.contactId,
                    phone: res.officePhone,
                    email: res.email,
                    shipToId: res.shipLocationId,
                    validDays: res.validDays,
                    statusId: res.statusId,
                    organizationId: res.organizationId,
                    currencyId: res.currencyId,
                    incotermId: res.incotermId,
                    paymentTermId: res.paymentTermId,
                    shippingMethodId: res.shippingMethodId,
                    quoteTypeId : res.quoteTypeId,
                    incotermLocation: res.incotermLocation
                };
                return quoteDetails;
            }
        )
    }

    getQuoteDetailsOptions(accountId) {
        let quoteOptionsUrl = 'api/quote/getQuoteOptions?accountId=' + accountId;

        let customers: Customers[];
        let status: Status[];
        return this.httpService.Get(quoteOptionsUrl).map(
            data => {
                let res = data.json();
                let quoteOptions = new QuoteOptions();
                customers = new Array<Customers>();
                status = new Array<Status>();
                res.customers.forEach(element => {
                    customers.push({
                        id: element.accountId,
                        name: element.accountName
                    })
                });
                res.status.forEach(element => {
                    status.push({
                        id: element.id,
                        name: element.name,
                        isDefault:false
                    })
                });
                quoteOptions.customers = customers;
                quoteOptions.status = status;
                return quoteOptions;
            }
        )
    }

    getContactsByAccountId(accountId: number) {
        return this.contactsService.getAccountContacts(accountId);
    }

    getLocationsByAccountId(accountId: number) {
        let quoteOptionsUrl = 'api/quote/getQuoteOptions?accountId=' + accountId;
        let shipAddress: ShipAddress[];
        return this.httpService.Get(quoteOptionsUrl).map(
            data => {
                let res = data.json();
                shipAddress = new Array<ShipAddress>();
                res.shipAddress.forEach(element => {
                    shipAddress.push({
                        id: element.id,
                        name: element.name
                    })
                });
                return shipAddress;
            }
        )
    }

    getLocationByAccountId(accountId: number) {
        let quoteOptionsUrl = 'api/quote/getQuoteOptions?accountId=' + accountId;
        let shipAddress: ShipAddress[];
        return this.httpService.Get(quoteOptionsUrl).map(
            data => {
                let res = data.json();
                shipAddress = new Array<ShipAddress>();
                res.shipAddress.forEach(element => {
                    shipAddress.push({
                        id: element.id,
                        name: element.name
                    })
                });
                return shipAddress;
            }
        )
    }

    getNonBillingAddress(accountId: number) {
        let addressUrl = 'api/account/getAccountlLocations?accountId=' + accountId;
        return this.httpService.Get(addressUrl).map(
            data => {
                let res = data.json();
                let locations = new Array<Location>();
                
                res.locations.forEach(element => {
                    locations.push({
                        locationId: element.locationId,
                        name: element.name,
                        houseNo: element.houseNo,
                        street: element.street,
                        city: element.city,
                        formattedState: element.formattedState,
                        countryCode: element.countryCode,
                        stateCode: element.stateCode,
                        postalCode: element.postalCode,
                        typeId:element.typeId,
                        locationTypeName:element.locationTypeName
                    })
                });
                return locations;
            }
        )
    }

    setQuoteDetails(payload) {
        let Url = 'api/quote/setQuoteDetails';
        return this.httpService.Post(Url, payload);
    }

    getQuoteHeaderDetails(quoteId: number, quoteVersionId: number) {
        return this.httpService.Get('api/quote/getQuoteHeader?quoteId='+quoteId+'&versionId='+quoteVersionId).map(
            data => {
                let res = data.json();
                let quoteHeader: QuoteHeader;
                quoteHeader = {
                    quoteTotal: res.QuotePrice,
                    quoteCost: res.QuoteCost,
                    grossProfit: res.QuoteProfit,
                    margin: res.QuoteGPM,
                    accountId: res.AccountID,
                    salesperson: res.Salesperson,
                    salespersonEmail: res.SalespersonEmail,
                    sentDate: res.SentDate,
                    userId: res.UserID,
                    quoteId: quoteId,
                    created: res.Created,
                    versionId: quoteVersionId
                };
                return quoteHeader;
            }
        );
    }

    getQuoteData(quoteId: number, quoteVersionId: number, filterText: string, filterBy: string) {
        return Observable.forkJoin(
            this.getQuoteParts(quoteId, quoteVersionId, filterText, filterBy),
            this.getCommodities(),
            this.getPackagingTypes(),
            this.getStatusList(),
            this.usersService.getAllUsers()
        );
    }

    getCommodities() {
        return this.httpService.Get('api/quote/getCommodities').map(
            data => {
                let res = data.json();
                let commodities = res.commodities;
                let commodityList = new Array<Commodity>();

                for (let i = 0; i < commodities.length; i++) {
                    let com: Commodity;
                    com = {
                        id: commodities[i].id,
                        name: commodities[i].name
                    };
                    commodityList.push(com);
                }

                return commodityList;
            }
        );
    }

    getPackagingTypes() {
        return this.httpService.Get('api/quote/getPackagingTypes').map(
            data => {
                let res = data.json();
                let packaging = res.packagingTypes;
                let packagingTypes = new Array<PackagingType>();

                for (let i = 0; i < packaging.length; i++) {
                    let com: PackagingType;
                    com = {
                        id: packaging[i].id,
                        name: packaging[i].name
                    };
                    packagingTypes.push(com);
                }
                return packagingTypes;
            }
        );
    }

    getConditionTypes() {
        return this.httpService.Get('api/quote/getConditionTypes').map(
            data => {
                let res = data.json();
                let condition = res.conditionTypes;
                let conditionTypes = new Array<ConditionType>();

                for (let i = 0; i < condition.length; i++) {
                    let com: ConditionType;
                    com = {
                        id: condition[i].id,
                        name: condition[i].name
                    };
                    conditionTypes.push(com);
                }
                return conditionTypes;
            }
        );
    }
    getQuoteParts(quoteId: number, quoteVersionId: number, filterText: string = '', filterBy: string = '') {
        let url = 'api/quote/getPartList?quoteId=' + quoteId + '&versionId=' + quoteVersionId +
            '&filterText=' + encodeURIComponent(filterText) + '&filterBy=' + filterBy;
        return this.httpService.Get(url).map(
            data => {
                // console.log('getQuoteParts...');
                let res = data.json();
                // console.log(res);
                let partList = res.PartsList;
                let quoteParts = new Array<QuotePart>();

                for (let i = 0; i < partList.length; i++) {
                    let quotePart = this.mapQuotePartToDomain(partList[i]);
                    quoteParts.push(quotePart);
                }
                return quoteParts;

            }
        );
    }

    mapQuotePartToDomain(resObject) {

        let quotePart = this.createQuotePart(resObject, false);

        if (resObject.alternates) {
            let alternates = new Array<QuotePart>();
            for (let a = 0; a < resObject.alternates.length; a++) {
                alternates.push(this.createQuotePart(resObject.alternates[a], true));
            }
            quotePart.alternates = alternates;
        }

        return quotePart;
    }

    setQuoteParts(quotePart: QuotePart, parentQuoteLineId: number, quoteId: number, quoteVersionId: number) {
        let url = 'api/quote/setPartsDetails';

        let body = {
            quoteLineId: quotePart.quoteLineId,
            lineNo: quotePart.lineNo,
            customerLineNo: quotePart.customerLineNo,
            partNumber: quotePart.partNumber,
            manufacturer: quotePart.manufacturer,
            commodityId: quotePart.commodityId,
            customerPartNo: quotePart.customerPN,
            quantity: quotePart.quantity,
            price: quotePart.price,
            cost: quotePart.cost,
            dateCode: quotePart.dateCode,
            packagingId: quotePart.packagingId,
            leadTimeDays: quotePart.leadTimeDays,
            altFor: parentQuoteLineId, 
            quoteId: quoteId,
            quoteVersionId: quoteVersionId,
            itemId: quotePart.ItemId,
            statusId: quotePart.statusId,
            isIhs: quotePart.isIhs
        }
        return this.httpService.Post(url, body).map(
            data =>
            { return this.mapQuotePartToDomain(data.json()); },
            error => { return error.json(); }
        );
    }

    setQuoteLinePrint(quoteLineId: number, isPrinted: number) {
       
            let url = '/api/quote/setQuoteLinePrint?quoteLineId=' + quoteLineId + '&isPrinted' + isPrinted;
            let body = {
                quoteLineId: quoteLineId,
                isPrinted: isPrinted
            }

            return this.httpService.Post(url, body).map(
                data => {
                    return data.json();
                },
                error => {
                    return error.json();
                }
            )
    }

    deleteQuoteParts(quoteLineIds: number[]) {

        let url = 'api/quote/deleteParts';
        let body = [];
        quoteLineIds.forEach(x => { body.push({ quoteLineId: x }) });

        return this.httpService.Post(url, body).map(
            data =>
            { return true; }
        );
    }

    createQuotePart(resObject, isAlternate) {
        let quotePart: QuotePart;
        let routedToList = new Array<QuoteRouteToObject>();

        _.forEach(resObject.routedTo, routedToBuyer => {
            let routedTo:QuoteRouteToObject  = {
                statusName: routedToBuyer.statusName,
                routeStatusId: routedToBuyer.routeStatusId,
                buyerInitials: routedToBuyer.buyerInitials,
                buyerName: routedToBuyer.buyerName,
                icon: routedToBuyer.icon,
                iconColor: routedToBuyer.iconColor,
                quoteLineId: routedToBuyer.quoteLineId,
            };
            routedToList.push(routedTo);
        })
        
        quotePart = {
            quoteLineId: resObject.quoteLineId,
            lineNo: resObject.lineNo,
            customerLineNo: resObject.customerLineNo,
            partNumber: resObject.partNumber,
            partNumberStrip: resObject.partNumberStrip,
            manufacturer: resObject.manufacturer,
            commodityId: resObject.commodityId,
            customerPN: resObject.customerPartNo,
            quantity: resObject.quantity,
            price: resObject.price,
            cost: resObject.cost,
            gpm: resObject.gpm,
            packagingId: resObject.packagingId,
            alternates: null,
            isAlternate: isAlternate,
            dateCode: resObject.dateCode,
            ItemId: resObject.itemId,
            statusId:resObject.statusId,
            sourceMatchStatus: resObject.sourceMatchStatus,
            sourceMatchCount :resObject.sourceMatchCount,
            sourceMatchQty :resObject.sourceMatchQty,
            sourceType: resObject.sourceType,
            leadTimeDays: resObject.leadTimeDays,
            comments: resObject.comments,
            routedTo: routedToList,
            isIhs:false,
            IsPrinted: resObject.isPrinted
        };

        return quotePart;
    }

    getQuoteExtraData(quoteId: number, quoteVersionId: number, rowOffset: number, rowLImit: number) {
        return Observable.forkJoin(
            this.getQuoteExtraItems(quoteId, quoteVersionId, rowOffset, rowLImit),
            this.itemsService.GetItemExtras()
        );
    }

    getQuoteExtraItems(quoteId: number, quoteVersionId: number, rowOffset: number, rowLimit: number) {

        return this.httpService.Get('api/quote/getQuoteExtra?quoteId=' + quoteId + '&quoteVersionId=' + quoteVersionId + '&rowOffset=' + rowOffset + '&rowLimit=' + rowLimit).map(
            data => {
                let res = data.json();
                let quoteExtras = res.extraListResponse;

                let quoteExtraList = new Array<QuoteExtraItem>();

                quoteExtras.forEach(element => {
                    quoteExtraList.push({
                        quoteExtraId: element.QuoteExtraId,
                        lineNum: element.LineNum,
                        refLineNum: element.RefLineNum,
                        extraName: element.ExtraName,
                        itemExtraId: element.ItemExtraId,
                        note: element.Note,
                        qty: element.Qty,
                        price: element.Price,
                        cost: element.Cost,
                        gpm: element.Gpm,
                        printOnQuote: element.PrintOnQuote === 0 ? false : true,
                        isDeleted: element.isDeleted,
                        comments: element.Comments
                    });
                });
                
                return quoteExtraList;
            }
        );
    }

    setQuoteExtraItems(quoteExtra: QuoteExtraItem, quoteId: number, quoteVersionId: number) {
        let url = 'api/quote/setQuoteExtra';

        let body = {
            QuoteExtraId: quoteExtra.quoteExtraId,
            QuoteId: quoteId,
            QuoteVersionId: quoteVersionId,
            LineNum: quoteExtra.lineNum,
            RefLineNum: quoteExtra.refLineNum,
            ItemExtraId: quoteExtra.itemExtraId,
            ExtraName: quoteExtra.extraName,
            Note: quoteExtra.note,
            Qty: quoteExtra.qty,
            Price: quoteExtra.price,
            Cost: quoteExtra.cost,
            Gpm: quoteExtra.gpm,
            PrintOnQuote: quoteExtra.printOnQuote ? 1 : 0,
            IsDeleted: quoteExtra.isDeleted
        };

        return this.httpService.Post(url, body).map(
            data => {
                let res = data.json();
                let quoteExtras = res.extraListResponse || [];
                let quoteExtraId = res.quoteExtraId;

                let quoteExtraList = new Array<QuoteExtraItem>();

                console.log('setQuoteExtraItems: Get response!')
                quoteExtras.forEach(element => {
                    quoteExtraList.push({
                        quoteExtraId: element.QuoteExtraId,
                        lineNum: element.LineNum,
                        refLineNum: element.RefLineNum,
                        extraName: element.ExtraName,
                        itemExtraId: element.ItemExtraId,
                        note: element.Note,
                        qty: element.Qty,
                        price: element.Price,
                        cost: element.Cost,
                        gpm: element.Gpm,
                        printOnQuote: element.PrintOnQuote,
                        isDeleted: element.isDeleted
                    })
                });
                return quoteExtraList === [] ? quoteExtraList : quoteExtraId;
            }
        );
    }

    convertQuoteToSalesOrder(quoteId: number, data) {
        let url = 'api/quote/QuoteToSalesOrder';

        let LinesToCopy = [];

        data.linesToCopy.forEach(part => {
            if (part.itemId) {
                LinesToCopy.push({
                    QuoteLineId: part.quoteLineId
                });
            }
        });

        let ExtrasToCopy = [];

        data.extrasToCopy.forEach(extra => {
            ExtrasToCopy.push({
                QuoteExtraId: extra.quoteExtraId
            })
        })

        let body = {
            QuoteId: quoteId,
            CustomerPO: data.customerPO,
            LinesToCopy: LinesToCopy,
            ExtrasToCopy: ExtrasToCopy
        };
      
        return this.httpService.Post(url, body)
            .map(data => {
                console.log('quote to sales order', data.json());
                return  data.json();
            }, error => {
                return error.json();
            })
    }

    getStatusList(){
       let url = 'api/quote/getQuoteDetailStatuses';
       return this.httpService.Get(url).map(
           data=>{
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
    getQuoteTypesList(){
        let url = 'api/quote/getQuoteTypesList';
        return this.httpService.Get(url).map(
            data=>{
                let res = data.json();
                let quoteTypes = new Array<QuoteType>();
 
                res.QuoteType.forEach(element => {
                    quoteTypes.push({
                        id:element.id,
                        name:element.name,
                    })
                });
                return quoteTypes;
            }
        )
     }
 

    getQuotePartObjectTypeId(){
        let url = 'api/quote/getQuoteLineObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getQuoteExtraObjectTypeId(){
        let url = 'api/quote/getQuoteExtraObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getQuoteObjectTypeId(){
        let url = 'api/objectTypes/getQuoteObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }
    getQuoteCommentTypeId(){
        let url = 'api/quote/getQuoteCommentTypeIds';
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

    getAllIncoterms(){
        let url = 'api/common/getAllIncoterms';
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            const incoterms = _.map(res.incoterms, (element) => {
                return _.assign({}, {
                    id: element.id,
                    incotermName: element.incotermName,
                    externalId: element.externalId
                });
            });
            return incoterms;
        });
    }

    getAllOrganizations(objectTypeId:number){
        let url = 'api/common/getAllOrganizations?objectTypeId=' + objectTypeId;
        return this.httpService.Get(url).map(data => {
            let res = data.json();
            const organizations = _.map(res.organizations, (element) => {
                return _.assign({}, {
                    id: element.id,
                    name: element.name,
                    externalId: element.externalId
                })
            });
            return organizations;
        });
    }

    getPaymentTerms() {
        let url = 'api/purchase-order/getPaymentTermsList?paymentTermId=0';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                const paymentTerms = _.map(res.paymentTerms, (element) => {
                    return _.assign({}, {
                        paymentTermId: element.PaymentTermID,
                        name: element.TermName,
                        description: element.TermDesc,
                        NetDueDays: element.NetDueDays,
                        DiscountDays: element.DiscountDays,
                        DiscountPercent: element.DiscountPercent
                    });
                });
                return paymentTerms;
            }
        );
    }

    emailQuote(quoteId: number, quoteVersionId: number, accountId: number, date: string, salesPerson: string, salesPersonEmail: string, emailTo: string, subject: string, ccList, bccList, body: string) {
        //remove extra spaces
        ccList = ccList ? ccList.replace(', ',',').replace(' ,',',') : '';
        bccList = bccList ? bccList.replace(', ',',').replace(' ,',',')  : '';

        //Rmeove trailing commas
        ccList = ccList ? ccList.replace(/(^\s*,)|(,\s*$)/g, '') : "";
        bccList = bccList ? bccList.replace(/(^\s*,)|(,\s*$)/g, '') : "";

        let url = 'api/quote/sendQuoteEmail?quoteId=' + quoteId + '&quoteVersionId=' + quoteVersionId + '&accountId=' + accountId + '&date=' + date + '&salesPerson=' + salesPerson + '&salesPersonEmail=' + salesPersonEmail + '&emailTo=' + emailTo + '&subject=' + subject + '&ccList=' + ccList + '&bccList=' + bccList + '&body=' + body;
        return this.httpService.Get(url).map(
            data => {
                return data
            }
        );
    }

    getQuoteLineByAccountId(accountId:number,contactId:number){
        const _self=this;
        let url='api/quote/getQuoteLineByAccountId?accountId='+accountId + '&contactId=' + contactId;
        return this.httpService.Get(url).map(
            data=>{
                let res = data.json();
                const quoteLine = _.map(res.quoteLineList,(element)=>{
                    return{
                        contact:element.contactFullName,
                        quoteId:element.quoteId,
                        lineNum:element.lineNum,
                        versionId:element.versionId,
                        status:element.statusName,
                        quoteDate:_self.dateFormatter.formatDate(element.quoteDate),
                        partNumber:element.partNumber,
                        itemId: element.itemId,
                        manufacturer:element.manufacturer,
                        qty:element.qty,
                        price:element.price,
                        cost:element.cost,
                        gpm:element.gpm,
                        dateCode:element.datecode,
                        packaging:element.packaging,
                        owners:element.owners      
                    };
                });
                return quoteLine;
            }
        )
    }

} 
