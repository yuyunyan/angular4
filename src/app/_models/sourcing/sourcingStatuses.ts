export class SourcingStatuses
{
    statusId:number;    
    statusName:string;
    isDefault:number;
}

export class SourcingRouteStatus{
    routeStatusId: number;
    statusName: string;
    isDefault: boolean;
    isComplete: boolean;
    countQuoteLines?: number;
}
