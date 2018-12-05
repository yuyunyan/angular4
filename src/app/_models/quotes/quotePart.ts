import { QuoteRouteToObject } from './quoteRouteToObject';
export class QuotePart
{
    quoteLineId:number;    
    lineNo:number;
    customerLineNo:number;
    partNumber:string;
    partNumberStrip: string;
    manufacturer:string;
    commodityId: number;
    customerPN:string;
    quantity:number;
    price:number;
    cost:number;
    gpm:number;
    packagingId:number;
    alternates: QuotePart[];
    isAlternate:boolean;
    dateCode:string;
    ItemId:number;
    statusId:number;
    comments?: number;
    routedTo: QuoteRouteToObject[];
    isIhs: boolean;
    IsPrinted: boolean;
    sourceMatchStatus?: string;
    sourceMatchCount?: number;
    sourceMatchQty?: number;
    sourceType?: string;
    leadTimeDays?: number;
}



