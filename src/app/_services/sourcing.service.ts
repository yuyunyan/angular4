import { Injectable } from '@angular/core';
import { HttpService } from './httpService';
import { SourcingQuoteLines } from './../_models/sourcing/sourcingQuoteLines';
import { SourcingStatuses } from './../_models/sourcing/sourcingStatuses';
import { List } from 'linqts';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SourceTypes } from './../_models/sourcing/sourceTypes';
import { Supplier } from './../_models/shared/supplier';
import { Currency } from './../_models/shared/currency';
import { QuoteService } from './quotes.service';
import { ItemsService } from './items.service';
import { SourcingAddSource } from './../_models/sourcing/sourcingAddSource';
import { PartSource } from './../_models/sourcing/partSource';
import { PoSoUtilities } from './../_utilities/po-so-utilities/po-so-utilities';
import { DateFormatter } from '../_utilities/dateFormatter/dateFormatter';
import * as _ from 'lodash';


@Injectable()
export class SourcingService {
  private dateFormatter = new DateFormatter();

  private partCommentIncreSubject = new Subject<any>();
  private sourceCommentIncreSubject = new Subject<any>();

  constructor(private sopoUtilities: PoSoUtilities,private httpService: HttpService, private itemService: ItemsService, private quoteService: QuoteService) { 

  }

  getSourcingQuoteLines(StatusId: number, RowOffset: number, RowLimit: number, SortCol: string, DescSort: boolean, FilterCol?: string , FilterText?: string){
    let sortColumnName : string ;
    let filterColumnName : string ;
 
    switch(SortCol){
      case 'quoteId':
          sortColumnName = 'quoteId';
          break;
      case 'quoteTypeName':
          sortColumnName = 'Type';
          break;
      case 'accountName':
          sortColumnName = 'AccountName';
          break;
      case 'partNumber':
          sortColumnName = 'PartNumber';
          break;
      case 'manufacturer':
          sortColumnName = 'Manufacturer';
          break;
      case 'commodityName':
          sortColumnName = 'CommodityName';
          break;
      case 'owners':
          sortColumnName = 'Owners';
          break;
      default:
          sortColumnName = '';
  
  };


    switch(FilterCol){
      case 'quoteId':
          filterColumnName = 'quoteId';
          break;
      case 'quoteTypeName':
          filterColumnName = 'Type';
          break;
      case 'accountName':
          filterColumnName = 'AccountName';
          break;
      case 'partNumber':
          filterColumnName = 'PartNumber';
          break;
      case 'manufacturer':
          filterColumnName = 'Manufacturer';
          break;
      case 'commodityName':
          filterColumnName = 'CommodityName';
          break;
      case 'owners':
          filterColumnName = 'Owners';
          break;
      default:
          filterColumnName = '';

  };
  
    let url = 'api/sourcing/getSourcingQuoteLinesList?status=' + StatusId + '&rowOffset=' + RowOffset + '&rowLimit=' + RowLimit +
     '&sortCol=' + sortColumnName + '&descSort=' + DescSort +'&FilterBy=' +filterColumnName + '&FilterText=' + FilterText;
      return this.httpService.Get(url).map(
        data => {
           let res = data.json();
             var sourcingQuoteLines = new List<SourcingQuoteLines>();
          res.quoteLines.forEach(element => {
            let sourcingQuote = new SourcingQuoteLines();
            sourcingQuote.quoteLineId = element.QuoteLineID;
            sourcingQuote.quoteId = element.QuoteID;
            sourcingQuote.quoteVersionId = element.QuoteVersionID;
            sourcingQuote.accountId = element.AccountID;
            sourcingQuote.accountName = element.AccountName;
            sourcingQuote.lineNo = element.LineNum;
            sourcingQuote.partNumber = element.PartNumber;
            sourcingQuote.partNumberStrip = element.PartNumberStrip;
            sourcingQuote.manufacturer = element.Manufacturer;
            sourcingQuote.commodityId = element.CommodityID;
            sourcingQuote.commodityName = element.CommodityName;
            sourcingQuote.statusId = element.StatusId;
            sourcingQuote.statusName = element.StatusName;
            sourcingQuote.qty = element.Qty;
            sourcingQuote.packagingId = element.PackagingID;
            sourcingQuote.packagingName = element.PackagingName;
            sourcingQuote.dateCode = element.DateCode;
            sourcingQuote.commentCount = element.CommentCount;
            sourcingQuote.sourcesCount = element.SourcesCount;
            sourcingQuote.rfqCount = element.RFQCount;
            sourcingQuote.comments = element.Comments;
            sourcingQuote.price = element.Price;
            sourcingQuote.cost = element.Cost;
            sourcingQuote.itemId = element.ItemID;
            sourcingQuote.dueDate = element.DueDate;
            sourcingQuote.shipDate = element.ShipDate;
            sourcingQuote.customerLine = element.CustomerLine;
            sourcingQuote.customerPartNumber = element.CustomerPartNumber;
            sourcingQuote.itemListLineId = element.ItemListLineID;
            sourcingQuote.quoteTypeName = element.QuoteTypeName,
            sourcingQuote.owners = element.Owners
            sourcingQuoteLines.Add(sourcingQuote); 
          });
            return { results: sourcingQuoteLines, totalRows: res.totalRows, errorMessage: null };
        }, error => {
          console.log("Sourcing Quote Lines List call failed");
      });
  }

  getStatuses(){
    let url = 'api/sourcing/getStatuses';
      return this.httpService.Get(url).map(

        data => {
          let res = data.json();
          let statuses = new Array<SourcingStatuses>();
          res.statuses.forEach(element => {
            let status = new SourcingStatuses();
            status.statusId = element.StatusID;
            status.statusName = element.StatusName;
            status.isDefault = element.IsDefault;
            statuses.push(status);
          })

          return { results: statuses, errorMessage: null};
        },error => {
                console.log("Sourcing Statuses call failed");
        })      
  }

  getAddSourceData(){
    return Observable.forkJoin(
      this.getSuppliers(),
      this.getTypes(),
      this.quoteService.getCommodities(),
      this.quoteService.getPackagingTypes(),
      this.getCurrencies(),
      this.itemService.GetAllItems()
    );
  }

  getTypes(){
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

  getSuppliers(){
    let url = 'api/account/getSuppliers';
    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        let suppliers = res;
        let supplierList = new Array<Supplier>();

        for(let i = 0; i < suppliers.length; i++){
          let supplier: Supplier;
          supplier = {
            id: suppliers[i].accountId,
            name: suppliers[i].name,
            status:null
          };
          supplierList.push(supplier);
        }
        return supplierList;
      }
    );
  }

  getCurrencies(){
    let url = 'api/common/getAllCurrencies';
    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        let currencies = res.currencies;
        let currencyList = new Array<Currency>();

        for(let i = 0; i < currencies.length; i++){
          let currency: Currency;
          currency = {
            id: currencies[i].id,
            name: currencies[i].name
          };
          currencyList.push(currency);
        }
        return currencyList;
      }
    )
  }

  setSource(newSource: SourcingAddSource){
    let url = 'api/sourcing/setSource';
    
    let body = {
      SourceTypeId: newSource.typeId,
      PartNumber: newSource.partNumber,
      AccountId: newSource.supplierId,
      ContactId: newSource.contactId,
      Manufacturer: newSource.mfr,
      CommodityId: newSource.commodityId,
      Qty: newSource.qty,
      Cost: newSource.cost,
      DateCode: newSource.dateCode,
      PackagingId: newSource.packagingId,
      MOQ: newSource.moq,
      SPQ: newSource.spq,
      ItemId: newSource.itemId,
      LeadTimeDays: newSource.leadTime,
      ValidForHours: newSource.validDays * 24,
      CurrencyId: newSource.currency,
      isIhsItem : newSource.isIhsItem
    }
    return this.httpService.Post(url, body);
  }

  getSourceList(itemId: number, partNumber: string, objectId: number, objectTypeId: number, showAll: boolean, quoteLineId: number, showInventory:boolean) {
    const _self = this;
    if(typeof itemId==="undefined")
        itemId = 0;
    let url = 'api/sourcing/getSourceList?itemId=' + itemId + '&partNumber=' + (partNumber? encodeURIComponent(partNumber): '')
      + '&objectId=' + objectId + '&objectTypeId=' + objectTypeId +'&showAll=' + showAll+'&showInventory='+showInventory;

    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        let sources = new Array<PartSource>();
        sources = _.map(res.sourceResponse, resObject => _self.mapSourceToDomain(resObject));
        return sources;
      }
    );
  }

  mapSourceToDomain(resObject){
    let source = new PartSource();
    source.typeName = resObject.typeName;
    source.partNumber = resObject.partNumber;
    source.manufacturer = resObject.manufacturer;
    source.commodityName = resObject.commodityName;
    source.supplier = resObject.supplier;
    source.qty =  resObject.qty;
    source.cost = resObject.cost;
    source.dateCode = resObject.dateCode;
    source.packagingName = resObject.packagingName;
    source.packagingConditionId = resObject.packagingConditionId;
    source.leadTimeDays = resObject.leadTimeDays;
    source.moq = resObject.moq;
    source.isMatched = (resObject.isMatched == null)? null : resObject.isMatched;
    source.isJoined = resObject.isJoined;
    source.showCheckmark = resObject.showCheckmark;
    source.sourceId = resObject.sourceId;
    source.comments = resObject.comments;
    source.ageInDays= resObject.ageInDays;
    source.created = resObject.created;
    source.createdBy = resObject.createdBy;
    source.accountId = resObject.accountId;
    source.itemId = resObject.itemId;
    source.buyerId = resObject.buyerId;
    source.rating = resObject.rating;
    source.rtpQty = resObject.rtpQty;
    return source;
  }

  setSourceStatus(objectId: number, objectTypeId: number, sourceId: number, isMatch: boolean, isJoined: boolean, rtpQty?: number) {
    let url = 'api/sourcing/setSourceStatus';
    let body = {
        sourceId: sourceId,
        objectId: objectId,
        objectTypeId: objectTypeId,
        rtpQty: rtpQty,
        isMatch: isMatch,
        isJoined: isJoined
    }

    return this.httpService.Post(url, body).map(
      data => {
          return data.json();
      },
      error => { return error.json(); }
    );
  }

  getSourceObjectTypeId(){
    let url = 'api/objectTypes/getSourceObjectTypeId';

    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        return res.objectTypeId;
      }
    )
  }

  getSourcesJoinObjectTypeId(){
    let url = 'api/sourcing/getSourcesJoinObjectTypeId';

    return this.httpService.Get(url).map(
      data => {
        let res = data.json();
        return res.objectTypeId;
      }
    )
  }

  getSourcesJoinCommentUId(objectId: number, objectTypeId: number, sourceId: number){
    let url = 'api/sourcing/getSourcesJoinCommentUId';
    let body = {
      ObjectID: objectId,
      ObjectTypeID: objectTypeId,
      SourceID: sourceId
    };

    return this.httpService.Post(url, body).map(
      data => {
        let res = data.json();
        return res.commentUId
      }
    )
  }

  partCommentIncrement(){
    this.partCommentIncreSubject.next({ increment: true })
  }

  getPartCommentStatus(): Observable<any>{
      return this.partCommentIncreSubject.asObservable();
  }

  sourceCommentIncrement(){
      this.sourceCommentIncreSubject.next({ increment: true })
  }

  getSourceCommentStatus(): Observable<any>{
      return this.sourceCommentIncreSubject.asObservable();
  }

  getRouteStatuses(){
    let url = 'api/sourcing/getRouteStatuses';
    return this.httpService.Get(url).map(data => {
      return data.json();
    })
  }

  setBuyerRoute(payload){
    let url = 'api/sourcing/setBuyerRoutes';
    return this.httpService.Post(url, payload).map(data => {
      return data.json();
    });
  }

  getQuoteLineBuyers(quoteLineId: number){
    let url = "api/sourcing/getQuoteLineBuyers?quoteLineId=" + quoteLineId;
    return this.httpService.Get(url).map(data => data.json());
  }

  getSourceLineByAccountId(accountId:number,contactId:number){
    const _self = this;
    let url="api/sourcing/getSourceLineByAccountId?accountId="+accountId+'&contactId=' + contactId;
    return this.httpService.Get(url).map(
      data=>{
        let res= data.json();
        const sourceLine = _.map(res.sourceLineList,(element)=>{
       //   let dateformat = self.sopoUtilities.ParseDateFromDateTime(element.date);

          return{
            contactName:element.contactName,
            type:element.typeName,
            partNumber:element.partNumber,
            itemId: element.itemId,
            manufacturer:element.manufacturer,
            date:_self.dateFormatter.formatDate(element.date),
            qty:element.qty,
            cost:element.cost,
            dateCode:element.datecode,
            packaging:element.packaging,
            buyer:element.createdBy,
            leadTime:element.leadTimeDays
          };
        });
        return sourceLine;
      }
    )
  }

 
  
}
