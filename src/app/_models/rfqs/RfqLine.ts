export class RfqLine{
    rfqLineId: number;
    lineNum: number;
    partNumber: string;
    manufacturer: string;
    supplierName: string;
    contactName: string;
    sentDate: string;
    age: number;
    ownerName: string;
    commodityId: number;
    commodityName: string;
    qty:number;
    targetCost:number;
    dateCode:string;
    packagingId:number;
    packagingName:string;
    note:string;
    sourcesTotalQty:number;
    statusId: number;
    itemId:number;
    partNumberStrip: string;
    hasNoStock:false;
    isIhs?: boolean;
    isPrinted: boolean;
    vendorRFQId : number;
    accountId : number;
    contactId : number;
}
