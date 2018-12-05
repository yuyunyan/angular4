import { contact } from './../_models/contactsAccount/newAccount';
import { Injectable } from '@angular/core';
import { HttpService} from './httpService';
import { RfqDetails} from './../_models/rfqs/RfqDetails';
import { RfqGridDetails} from './../_models/rfqs/RfqGridDetails';
import { Status} from './../_models/shared/status';
import { Observable } from 'rxjs/Observable';
import { RfqLine } from './../_models/rfqs/RfqLine';
import { List } from 'linqts';
import { ItemsService } from './items.service';
import { QuoteService } from './quotes.service';
import { RfqLineResponse } from './../_models/rfqs/RfqLineResponse';
import { PackagingType } from './../_models/shared/packagingType';
import { SourcingService } from './../_services/sourcing.service';
import { Subject } from 'rxjs/Subject';
import { SharedService } from './../_services/shared.service';
import * as _ from 'lodash';

@Injectable()
export class RfqsService
{
    private partCommentIncreSubject = new Subject<any>();
    constructor(private httpService: HttpService, private itemsService: ItemsService, 
        private quoteService: QuoteService, private sourcingService: SourcingService, private sharedService: SharedService,){

    }

    getAllRfqs(searchString:string, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean){
        var descSortBit = 0;
        if (descSort == true)
            descSortBit = 1;
        let url = 'api/rfqs/getAllRfqs';
        let data = {
            SearchString: searchString,
            RowOffset: rowOffset,
            RowLimit: rowLimit,
            DescSort: descSortBit,
            SortBy : sortCol,
        }
        return this.httpService.Post(url , data).map(
            data => {
                var res = data.json();
                var rfqs = new List<RfqGridDetails>();
                res.rfqList.forEach(element => {
                    let rfq = new RfqGridDetails();                    
                    rfq.vendorRfqId = element.vendorRfqId;
                    rfq.supplierId = element.supplierId;
                    rfq.supplierName = element.supplierName;
                    rfq.contactId = element.contactId;
                    rfq.contactName = element.contactName;
                    rfq.statusId = element.statusId;
                    rfq.statusName = element.statusName;
                    rfq.sentDate = element.sentDate;
                    rfq.buyer = element.buyer;
                    rfqs.Add(rfq);
                });
                return { rfqList:rfqs, rowCount:res.rowCount }

            }
        )
    }

    sendRfqToSuppliers(rfqArray, rfqLines, comment){
        let url = 'api/rfqs/sendRfqsToSuppliers';
        let linesBody = [];
        let suppliersBody = [];
        for(let i = 0; i < rfqLines.length; i++){
            linesBody.push({
                vRfqLineId: null,
                partNumber: rfqLines[i].partNumber,
                manufacturer: rfqLines[i].manufacturer,
                commodityId: rfqLines[i].commodity.id,
                commodityName: rfqLines[i].commodity.name,
                qty: rfqLines[i].qty,
                targetCost: rfqLines[i].targetCost,
                dateCode:rfqLines[i].dateCode,
                packagingId: rfqLines[i].packagingId,
                note: rfqLines[i].note,
                rfqId: null,
                itemId: rfqLines[i].itemId,
                isIHS: rfqLines[i].isIhs,
            });
        }
        for(let i = 0; i < rfqArray.length; i++){
            suppliersBody.push({
                supplierId: rfqArray[i].supplierId,
                contactId: rfqArray[i].contact.contactId,
                contactEmail: rfqArray[i].contact.email,
                contactFirstName: rfqArray[i].contact.firstName,
                contactLastName:  rfqArray[i].contact.lastName,
                statusId: rfqArray[i].statusId,
                currencyId: 'USD'
            });
        }
        let body = {
            suppliers: suppliersBody,
            lines: linesBody,
            comment: comment
        };
        return this.httpService.Post(url, body).map(res => {
            return res.json();
        });
    }

    createNewRfqAndLines(rfqArray: Array<RfqDetails>, rfqLines){
        let linesBody = [];
        for(let i = 0; i < rfqLines.length; i++){
            linesBody.push({
                vRfqLineId: null,
                partNumber: rfqLines[i].partNumber,
                manufacturer: rfqLines[i].manufacturer,
                commodityId: rfqLines[i].commodity.id,
                qty: rfqLines[i].qty,
                targetCost: rfqLines[i].targetCost,
                dateCode:rfqLines[i].dateCode,
                packagingId: rfqLines[i].packagingId,
                note: rfqLines[i].note,
                rfqId: null
            })
        }
        
        let body = {
            supplierId: rfqArray[0].supplierId, 
            contactId: rfqArray[0].contactId, 
            statusId: 1,
            currencyId: rfqArray[0].currencyId,
            lines: linesBody
        }
        return this.httpService.Post('api/rfqs/createRfqFromSourcing', body);
    }

    getRfqDetails(rfqId: number)
    {
        return this.httpService.Get('api/rfqs/getBasicDetails?rfqId=' + rfqId).map(
            data => {
                
                let rfqDetails: RfqDetails;
                var res = data.json();
                rfqDetails = {
                    supplierId:res.supplierId,
                    contactId:res.contactId,
                    statusId:res.statusId,
                    currencyId:res.currencyId
                }

                return rfqDetails;
           },
            error =>{}
        )
    }

    getRfqBasicData(rfqId:number)
    {
         return Observable.forkJoin(
            this.getRfqDetails(rfqId),
            this.getRfqSatuses(),
            this.sourcingService.getCurrencies()
        )
    }

    getRfqCreationData()
    {
         return Observable.forkJoin(
            this.getRfqSatuses(),
            this.sourcingService.getCurrencies(),
        )
    }

    getRfqSatuses()
    {
        return this.httpService.Get('api/rfqs/getRFQStatuses').map(
            data => {
                var res = data.json();
                return res.statusList.map(statusRes =>{
                    let status: Status;
                    status = {
                        id: statusRes.id,
                        name: statusRes.name,
                        isDefault:statusRes.isDefault
                    }
                    return status;
                })
           },
            error =>{}
        )
    }

    saveRfqDetails(rfqId, supplierId, contactId, statusId, currencyId)
    {
        let body = {
            rfqId:rfqId, 
            supplierId: supplierId, 
            contactId:contactId, 
            statusId:statusId,
            currencyId: currencyId
        }
        return this.httpService.Post('api/rfqs/saveBasicDetails', body).map(
            data => {
                let rfqId = data.json();
                return rfqId;
            }
        );
    }

    getRfqLinesForDetailsGrid(rfqId:number , statusId : number)
    {
         return Observable.forkJoin(
            this.getRfqLines(rfqId, null, 0, 0, 10000, null, false,statusId),
            this.itemsService.GetCommodities(),
            this.quoteService.getPackagingTypes()
        );
    }

    getRfqLines(rfqId:number, partNumberStrip:string, rfqLineId:number, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean, statusId:number)
    {
        let url = this.buildRfqLinesGetUrl(rfqId, partNumberStrip, rfqLineId, rowOffset, rowLimit, sortCol, descSort, statusId);

        return this.httpService.Get(url).map(
            data => {
                
                var res = data.json();
                let rfqLines = res.rfqLines.map(this.createRfqLineFromRes);

                return { rfqLines:rfqLines, rowCount:res.totalRowCount }
           },
            error =>{}
        )
    }

    createRfqLineFromRes(rfqLineRes){
        
        let rfqLine: RfqLine;
        rfqLine = {
            rfqLineId: rfqLineRes.vRfqLineId,
            lineNum: rfqLineRes.lineNum,
            partNumber: rfqLineRes.partNumber,
            manufacturer: rfqLineRes.manufacturer,
            commodityId: rfqLineRes.commodityId,
            commodityName: rfqLineRes.commodityName,
            qty:rfqLineRes.qty,
            targetCost:rfqLineRes.targetCost,
            dateCode:rfqLineRes.dateCode,
            packagingId:rfqLineRes.packagingId,
            packagingName:rfqLineRes.packagingName,
            note:rfqLineRes.note,
            sourcesTotalQty:rfqLineRes.sourcesTotalQty,
            statusId: rfqLineRes.statusId,
            itemId:rfqLineRes.itemId,
            partNumberStrip: rfqLineRes.partNumberStrip,
            hasNoStock:rfqLineRes.hasNoStock,
            supplierName:rfqLineRes.supplierName,
            contactName:rfqLineRes.contactName,
            sentDate:rfqLineRes.sentDate,
            age:rfqLineRes.age,
            ownerName:rfqLineRes.ownerName,
            isPrinted: true,
            vendorRFQId : rfqLineRes.vRfqId,
            accountId : rfqLineRes.accountId,
            contactId : rfqLineRes.contactId,
            isIhs: rfqLineRes.isIhs
        }

        return rfqLine;
    }

    buildRfqLinesGetUrl(rfqId:number, partNumberStrip:string, rfqLineId:number, rowOffset: number, rowLimit: number, sortCol: string, descSort: boolean, statusId : number)
    {
        return 'api/rfqs/getRFQLines?rfqId='+ rfqId +'&partNumberStrip=' + partNumberStrip + '&rfqLineId=' + rfqLineId
                    + '&rowOffset='+ rowOffset + '&rowLimit=' +rowLimit+'&sortCol='+sortCol + '&descSort=' + descSort + '&statusId='+statusId;
    }

    setrfqLine(rfqLineId, partNumber, itemId, manufacturer, commodityId, qty, targetCost, dateCode, packagingId, note, isIhs, rfqId)
    {
        let body = {
            vRfqLineId:rfqLineId, 
            rfqId:rfqId,
            partNumber:partNumber, 
            itemId: itemId,
            manufacturer:manufacturer, 
            commodityId:commodityId, 
            qty:qty, 
            targetCost:targetCost, 
            dateCode:dateCode, 
            packagingId:packagingId, 
            note:note,
            isIhs: isIhs
        }

        return this.httpService.Post('api/rfqs/saveRfqLine', body).map(
            res =>{
                return this.createRfqLineFromRes(res.json());
            }
        );
    }

    deleteRfqLines(rfqLineIds: number[]){
         
        let url = 'api/rfqs/deleteRfqLines';
        let body = [];
        rfqLineIds.forEach(x => { body.push({ vRfqLineId: x }) });

        return this.httpService.Post(url, body).map(
            data =>
            {
                let res = data.json();
                return res.errorMessage ? false: true;
            },
            error => { return error.json(); }
        );
    }

    getRfqLineResponses(rfqLineId:number)
    {
        let url = 'api/rfqs/getRfqLineResponses?vRfqLineId=' + rfqLineId + '&rowLimit=10000';
        
        return this.httpService.Get(url).map(
            data => {
                var res = data.json();
                let rfqLines = res.rfqLineResponses.map(this.createRfqLineResponseFromRes);

                return rfqLines;
            },
            error =>{}
        )
    }

    createRfqLineResponseFromRes(rfqLineResponseRes){
        
        let rfqLineResponse: RfqLineResponse;
        rfqLineResponse = {
            sourceId: rfqLineResponseRes.sourceId,
            lineNum: rfqLineResponseRes.lineNum,
            partNumber: rfqLineResponseRes.partNumber,
            itemId: rfqLineResponseRes.itemId,
            manufacturer: rfqLineResponseRes.manufacturer,
            offerQty:rfqLineResponseRes.offerQty,
            cost:rfqLineResponseRes.cost,
            dateCode:rfqLineResponseRes.dateCode,
            packagingName:rfqLineResponseRes.packagingName,
            moq: rfqLineResponseRes.moq,
            spq: rfqLineResponseRes.spq,
            leadTimeDays: rfqLineResponseRes.leadTimeDays,
            packagingId: rfqLineResponseRes.packagingId,
            validforHours: rfqLineResponseRes.validforHours,
            comments: rfqLineResponseRes.comments,
            isNoStock: rfqLineResponseRes.isNoStock,
            isIhs: rfqLineResponseRes.isIhs
        }

        return rfqLineResponse;
    }

    setrfqLineResponse(sourceId, partNumber, itemId, manufacturer, offerQty,cost, dateCode, packagingId, moq, spq, validforHours, leadTimeDays, isNoStock, isIhs, rfqLineId){
        
        let body = {
            sourceId:sourceId, 
            partNumber:partNumber,
            itemId: itemId,
            manufacturer:manufacturer, 
            offerQty:offerQty, 
            cost:cost, 
            dateCode:dateCode, 
            packagingId:packagingId, 
            moq:moq, 
            spq:spq, 
            rfqLineId:rfqLineId,
            validforHours: validforHours,
            leadTimeDays: leadTimeDays,
            isNoStock: isNoStock,
            isIhs: isIhs
        }

        return this.httpService.Post('api/rfqs/saveRfqLineResponse', body).map(
            res =>{
                return this.createRfqLineResponseFromRes(res.json());
            }
        );
    }

     deleteRfqLineResponses(sourceIds: number[], rfqLineId: number){
         
        let url = 'api/rfqs/deleteRfqLineResponses?rfqLineId='+ rfqLineId;
        let body = [];
        sourceIds.forEach(x => { body.push({ sourceId: x }) });

        return this.httpService.Post(url, body).map(
            data =>
            {
                let res = data.json();
                return res.errorMessage ? false: true;
            },
            error => { return error.json(); }
        );
    }

    getVendorRfqObjectTypeId(){
        let url = 'api/rfqs/getRfqObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    getVendorRfqLineObjectTypeId(){
        let url = 'api/rfqs/getRfqLineObjectTypeId';
        return this.httpService.Get(url).map(
            data => {
                let res = data.json();
                return res.objectTypeId;
            }
        )
    }

    partCommentIncrement(){
        this.partCommentIncreSubject.next({ increment: true })
    }

    getPartCommentStatus(): Observable<any>{
        return this.partCommentIncreSubject.asObservable();
    }

    getRfqCommentTypeId(){
        let url = 'api/rfqs/getRfqCommentTypeIds';
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

}
