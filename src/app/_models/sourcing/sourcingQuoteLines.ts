export class SourcingQuoteLines
{
    quoteLineId:number;
    quoteId:number;    
    quoteVersionId:number;
    accountId:number;
    accountName:string;
    lineNo:number;
    partNumber:string;
    partNumberStrip:string;
    manufacturer:string;
    commodityId:number;
    commodityName:number;
    statusId:number;
    statusName:string;
    qty:number;
    packagingId:number;
    packagingName:string;
    dateCode:string;
    commentCount:number;
    sourcesCount:number;
    rfqCount:number;
    totalRows:number;
    comments?: number;
    price: number;
    cost: number;
    itemId : number;
    dueDate: string;
    shipDate: string;
    customerLine : number;
    customerPartNumber : string;
    itemListLineId : number;
    quoteTypeName : string;
    owners : string;
}
