export class PartSource
{
    sourceId: number;
    sourceTypeId: number;
    typeName: string;
    typeRank: number;
    itemId: number;
    partNumber: string;
    accountId: number;
    supplier: string;
    contactId: number;
    manufacturer: string;
    commodityId: number;
    commodityName: string;
    qty: number;
    cost: number;
    dateCode: string;
    packagingId: number;
    packagingName: string;
    packagingConditionId:number;
    moq: number;
    spq: number;
    leadTimeDays: number;
    validForHours: number;
    isMatched: boolean;
    isJoined: boolean;
    comments?: number;
    showCheckmark: boolean;
    ageInDays: number;
    created: string;
    buyerId: number;
    createdBy: string;
    rating: string;
    rtpQty: number;
}
