export class SalesOrderDetails
{
  soId:number;
  soVersionId:number;
  statusId:number;
  statusName:string;
  accountId:number;
  accountName:string;
  contactId:number;
  contactName:string;
  phone:string;
  email:string;
  shipLocationId:number;
  shipLocationName:string;
  customerPo:string;
  countryId:number;
  countryName:string;
  soCost: string;
  soPrice: string;
  soProfit: string;
  soGpm: string;
  freightPaymentId?: number;
  freightAccount?: string;
  orderDate?: string;
  shippingMethodId?: number;
  incotermId?: number;
  currencyId?: string;
  paymentTermId?: number; 
  projectId?: number;
  incotermLocation?: string;
  shippingNotes? : string;
  qcNotes? : string;
  deliveryRuleId?: number;
  carrierId?:number;
  carrierName?:string;
  carrierMethodId?:number;
  methodName?:string;
  organizationId?:number;
}
