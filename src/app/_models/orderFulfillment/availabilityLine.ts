export class AvailabilityLine {
    type: string;
    id: number;
    partNumber:string;  
    manufacturer:string;
    commodityName: string;
    supplier: string;
    originalQty:number;
    cost:number;
    dateCode: string;
    packagingName: string;
    shipDate:string;
    buyers: string;
    itemId:number;
    soId: number;
    externalId?: string;
    soVersionId: number;
    soLineId: number;
    poId: number;
    poVersionId: number;
    lineNum: number;
    conditionName: string;
    inTransit: boolean;
    isInspection:boolean;
    warehouseName: string;
    supplierId: number;
    comments: number;
    allocated?: number;
}


