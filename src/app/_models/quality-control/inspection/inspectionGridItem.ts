import { List } from "linqts";

export class InspectionGridItem
{
    inspectionId: number;
    itemId: number;
    supplier: "Impact Project Management";
    poNumber: "326";
    customers: InspectionCustomers[];
    salesOrders:InspectionSalesOrder[];
    statusName: "Pending";
    inspectionTypeId: number;
    inspectionTypeName: string;
    inventoryId: number;
    stockExternalId:string;
    receivedDate: "08/25/2017";
    shipDate: null;
    warehouse?: string;
    poVersionID:string;
    accountId:number;
    poExternalId:number;
}

export class InspectionCustomers{
    accountName:string;
}

export class InspectionSalesOrder{
    salesOrderID:number;
    externalID:number;
}