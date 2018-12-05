export class SalesOrderPart
{
    soLineId:number;    
    lineNo:number;
    customerLineNo:number;
    manufacturer:string;
    commodityName: string;
    customerPN:string;
    quantity:number;
    reserved: number;
    price:number;
    cost:number;
    packagingId:number;
    packagingConditionId:number;
    shipDate:string; 
    dateCode:string;
    itemId:number;
    dueDate:string;
    comments?: number;
    partNumber:string;
    commodityId: number;
    deliveryRuleId: number;
    deliveryStatus:string;
    invoiceStatus:string;
    statusName: string;
}
