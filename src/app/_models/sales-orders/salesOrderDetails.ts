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
  shipFromRegionId?:number;
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
  organization?: SalesOrderOrganization;
  userId?: number;
  externalId?: string;
}
export class SalesOrderOrganization
{
  organizationName?: string;
  address1?: string;
  address2?: string;
  address4?: string;
  houseNumber?: string;
  street?: string;
  city?: string;
  stateCode?: string;
  stateName?: string;
  countryName?: string;
  postalCode?: string;
  officePhone?: string;
  mobilePhone?: string;
  fax?: string;
  email?: string;
  bank?: SalesOrderOrganizationBank;
}
export class SalesOrderOrganizationBank {
  bankName?: string;
  branchName?: string;
  usdAccount?: string;
  eurAccount?: string;
  swiftAccount?: string;
  routingNumber?: string;
}