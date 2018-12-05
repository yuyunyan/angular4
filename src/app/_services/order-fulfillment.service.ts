import {Injectable} from '@angular/core';
import {HttpService} from  './httpService';
import { AvailabilityLine } from './../_models/orderFulfillment/availabilityLine';
import { Order} from './../_models/orderFulfillment/ordersList';
import { Subject } from 'rxjs/Subject';
import { SOLineAllocation } from './../_models/orderFulfillment/soLineAllocation';
import { AllocationWindowData } from './../_models/orderFulfillment/AllocationWindowData';
import { InventoryWindowData } from './../_models/orderFulfillment/InventoryWindowData';


import * as lo from 'lodash';
    
@Injectable()
export class OrderFulfillmentService{

    private SourceTabSubject = new Subject<boolean>();

    private POAllocationSubject = new Subject<AllocationWindowData>();
    private InvAllocationSubject = new Subject<InventoryWindowData>();
    
    constructor(private httpService:HttpService){}

    public getAvailability(soLineId:number){
        return this.httpService.Get('api/orderFulfillment/getPoAndInventoryAvailability?soLineId='+soLineId).map(
            data => {
                let res = data.json();
                let partsList = res.availableLines;
                return partsList.map(x => {                    
                     let availLine: AvailabilityLine;
                     availLine = {
                        id:x.id,
                        type: x.typeName,
                        partNumber:x.partNumber,  
                        manufacturer:x.manufacturer,
                        commodityName: x.commodityName,
                        supplier: x.supplier,
                        supplierId: x.supplierId,
                        originalQty:x.originalQty,
                        cost:x.cost,
                        dateCode: x.dateCode,
                        packagingName: x.packagingName,
                        shipDate:x.shipDate,
                        buyers: x.buyers,
                        itemId: x.itemId,
                        soId: this.getSoId(x.allocated),
                        externalId: x.externalId,
                        soVersionId: this.getSoVersionId(x.allocated),
                        soLineId: this.getSoLineId(x.allocated),
                        poId: x.poId,
                        poVersionId: x.poVersionId,
                        lineNum: x.lineNum,
                        conditionName: x.conditionName,
                        inTransit: x.inTransit,
                        isInspection: x.isInspection,
                        warehouseName: x.warehouseName,
                        comments: x.comments,
                        allocated:x.allocated                    
                    }
                    return availLine;
                });
            },
            error => {

            }
        );
    }

    getSoLineId(allocated){
        if(allocated.length > 0){
            return allocated[0].sOLineID;
        }
        return null;
    }

    getSoId(allocated){
        if(allocated.length > 0){
            return allocated[0].salesOrderID;
        }
        return null;
    }

    getSoVersionId(allocated){
        if(allocated.length > 0){
            return allocated[0].sOVersionID;
        }
        return null;
    }

    private constructBuyer(buyerList): string{
        if(!buyerList || buyerList.length == 0){
            return '';
        } else{
            return lo.join(lo.map(buyerList, buyer => buyer.buyerName), ', ');
        }
    }

 public getOrdersList(searchString: string, underallocatedOnly: boolean,rowOffset:number,rowLimit:number,sortCol:string,descSort:boolean, 
    filterText: string = '', filterBy: string = ''){
    const _self = this;
    let url='api/orderFulfillment/getOrderFulfillmentList?underallocatedOnly='+underallocatedOnly + '&searchString='+ (searchString? encodeURIComponent(searchString): '') 
    +'&rowOffset='+rowOffset + '&rowLimit='+rowLimit+'&sortCol='+sortCol+'&descSort='+descSort + '&filterText=' + filterText + '&filterBy=' + filterBy;
        return this.httpService.Get(url).map(
            data=>{
                let res= data.json();
                let orderLists= res.oFList;
                let totalRowCount = res.totalRowCount;
                let orderList =new Array<Order>();
                 orderLists.forEach(e => {
                    let order:Order;
                    order = {
                            orderNo:e.orderNo,
                            lineNum : e.lineNum,
                            accountId: e.accountId,
                            soVersionId: e.soVersionId,
                            buyers: _self.constructBuyer(e.buyers),
                            customers: e.customer,
                            partNumber:e.partNo,
                            mfr: e.mfr,
                            commodity: e.commodityName,
                            orderQty:e.orderQty,
                            price: e.price,
                            packaging:e.packagingName,
                            dateCode: e.dateCode,
                            shipDate:e.shipDate,
                            shipPerson: e.salesPerson,
                            soLineId: e.soLineId,
                            itemId:e.itemId,
                            comments: e.comments,
                            allocatedQty: e.allocatedQty,
                            dueDate:e.dueDate,
                            cost: e.cost,
                            externalId: e.externalId
                    };
                  orderList.push(order);
                }
            );
            console.log(totalRowCount)
            return {orderList:orderList,totalRowCount:totalRowCount};              
            },
            error=>{

            }
        );
    }

    public setReservation(type, id , soLineId, quantityToSet, isDeleted)
    {
        const regex = /[^0-9]/g;
        let url = 'api/orderFulfillment/setOrderFulfillmentQty';
        let body = {
            type:type,
            id: id,
            soLineId: soLineId,
            isDeleted: isDeleted,
            qty: parseInt(String(quantityToSet).replace(regex, ''))
        }
        return this.httpService.Post(url, body);
    }

    onSourceTabClick(){
        this.SourceTabSubject.next(true);
    }

    SourceTabStatusGet(){
        return this.SourceTabSubject.asObservable();
		}
		
	getSOLinesAllocation(poLineId: number, includeUnallocated: boolean, partNumber: string = '', soLineId?: number,){
		let url = 'api/orderFulfillment/getUnallocatedSOLines?poLineId='+poLineId+'&partNumber='+
			partNumber+'&soLineId='+(soLineId||'')+'&includeUnallocated='+includeUnallocated;
		
		return this.httpService.Get(url).map(data => {
			let res= data.json();
			return this.mapResponseToSOLine(res.soAllocations);
		});
    }
    
    onPOAllocationClick(allocationWindowData: AllocationWindowData){
        this.POAllocationSubject.next(allocationWindowData);
    }

    POAllocationStatusGet(){
        return this.POAllocationSubject.asObservable();
    }

    onInvAllocationClick(allocationWindowData: InventoryWindowData){
        this.InvAllocationSubject.next(allocationWindowData);
    }

    InvAllocationStatusGet(){
        return this.InvAllocationSubject.asObservable();
    }

    private AllocationSetSubject = new Subject<number>();

    onAllocationSet(poLineId){
        this.AllocationSetSubject.next(poLineId);
    }

    GetAllocationSetStatus(){
        return this.AllocationSetSubject.asObservable();
    }

	mapResponseToSOLine(soAllocations): SOLineAllocation[]{
		let soLineAllocationList = lo.map(soAllocations, x => {
			let soLineAllocation = new SOLineAllocation();
			soLineAllocation.accountName = x.accountName;
			soLineAllocation.allocatedQty = x.allocatedQty;
			soLineAllocation.dateCode = x.dateCode;
			soLineAllocation.mfr = x.mfrName;
			soLineAllocation.neededQty = x.neededQty;
			soLineAllocation.partNumber = x.partNumber;
			soLineAllocation.price = x.price;
			soLineAllocation.qty = x.soQty;
			soLineAllocation.sellers = x.sellers;
			soLineAllocation.shipDate = x.shipDate;
            soLineAllocation.soId = x.soId;
            soLineAllocation.soVersionId = x.soVersionId;
			soLineAllocation.soLineId = x.soLineId;
			soLineAllocation.statusName = x.statusName;
            soLineAllocation.lineNum = x.lineNum;
            soLineAllocation.externalId = x.externalId;
			return soLineAllocation;
		});
		return soLineAllocationList;
    }
    
}
