export class QuoteExtraItem
{
    quoteExtraId: number;
    lineNum: number;    
    refLineNum: number;
    itemExtraId?: number;
    extraName:string
    extraDescription?: string;
    note: string;
    qty: number;
    price: number;
    cost: number;
    gpm: number;
    isDeleted?: boolean;
    comments?: number;

    printOnQuote: boolean;
}
