export class Order{
    orderNo: number;
    lineNum: number;
    customers: string;
    soVersionId: number;
    accountId: number;
    partNumber: string;
    mfr: string;
    commodity: string;
    orderQty:number;
    price: number;
    packaging:string;
    dateCode: number;
    shipDate?:string;
    shipPerson: string;
    buyers: string;
    soLineId:number;
    itemId:number;
    comments?: number;
    allocatedQty: number;
    dueDate?:string;
    cost?: number;
    gpm?: number;
    externalId?: string;
}
