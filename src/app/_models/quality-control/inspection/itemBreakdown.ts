export class ItemBreakdown {
    index?: number;
    itemStockId: number;
    poLineId?: number;
    itemId?: number;
    quantity: number;
    warehouseId: number;
    warehouseBinId: number;
    displayWarehouseBinId?: number
    packagingTypeId: number;
    conditionId: number;
    mfrLotNum: string;
    countryId: number;
    dateCode: string;   
    receivedDate?: string;
    expirationDate: string;
    invStatusID?: number;
    stockDescription?: string;
    inspectionWarehouseId?: number;
    externalId?: string;
    isRejected: boolean;
    acceptedBinId?: number;
    acceptedBinName?: string;
    rejectedBinId?: number; 
    rejectedBinName?:string;
    itemStockBreakdownList?: BreakdownLine[];
    isLineEditingMode?:boolean;
}

export class BreakdownLine{
    breakdownId? :number;
    stockId: number;
    isDiscrepant: boolean;
    packQty: number;
    numPacks: number;
    dateCode: string;
    packagingId: number;
    conditionId: number;
    countryId: number;
    mfrLotNum: string;
    expirationDate: string;
}