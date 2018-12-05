export class RfqLineResponse{
    sourceId: number;
    lineNum: number;
    offerQty: number;
    cost: number;
    dateCode: string;
    moq: number;
    spq: number;
    leadTimeDays: number;
    validforHours: number;
    packagingId: number;
    packagingName: string;
    partNumber: string;
    itemId: number;
    manufacturer: string;
    comments: number;
    isNoStock: boolean;
    isIhs?: boolean;
}
