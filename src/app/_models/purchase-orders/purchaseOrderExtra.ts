export class PurchaseOrderExtra {
    poExtraId: number;
    lineNum: number;    
    refLineNum: number;
    itemExtraId?: number;
    extraName:string;
    extraDescription?: string;
    note: string;
    qty: number;
    cost: number;
    isDeleted?: boolean;
    comments?: number;

    printOnPO: boolean;
}
