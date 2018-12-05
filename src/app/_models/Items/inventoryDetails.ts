export class InventoryDetails {
    warehouseId: number;
    warehouseName: string;
    accountId: number;
    accountName: string;
    conditionName: string;
    origQty: number;
    availableQty: number;
    purchaseOrderId: number;
    poVersionId: number;
    externalId: string;
    buyers: string;
    cost: any;
    allocated?: any;
    dateCode: string;
    packagingName: string;
    packageCondition: string;
    shipDate: string;
}