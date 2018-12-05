export class PurchaseOrderPart
{
    poLineId:number;    
    statusId?:number;
    lineNo?:number;
    vendorLine?:number;
    manufacturer?:string;
    commodityName?: string;
    quantity?:number;
    cost?:number;
    packagingId?:number;
    conditionId?:number;
    dateCode?:string;
    itemId:number;
    dueDate?:string;
    promisedDate?:string;
    comments?: number;
    isSpecBuy? : boolean;
    specBuyForUserId? : number;
    specBuyForAccountId? : number ;
    specBuyReason?: string;
    partNumber: string;
    allocatedQty?: number;
    allocatedSalesOrderId?: number;
    allocatedSalesOrderVersionId?: number;
    externalId?: string;
}
