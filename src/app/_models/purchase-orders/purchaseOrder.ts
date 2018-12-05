export class PurchaseOrder {
    purchaseOrderId: number;
    versionId: number;
    vendor: string;
    currencyId: string;
    accountId: number;
    paymentTermId: number;
    contactId: number;
    contactFull: string;
    contactFirstName: string;
    contactLastName: string;
    contactPhone: string;
    contactEmail: string;
    orderDate: string;
    conditionId: number;
    shipFromLocationId: number;
    toWarehouseId?: number;
    shippingMethodId?: number;
    statusId:number;
    orderStatus?: string;
    incotermId: number;
    organizationId: number;
    organization?: PurchaseOrderOrganization;
    // billToLocationID: number;
    // billToName: string;
    // billToHouse: string;
    // billToStreet: string;
    // billToCity: string;
    // billToStateCode: string;
    // billToPostalCode: string;
    // shipFromLocationID: number;
    // shipFromName: string;
    // shipFromHouse: string;
    // shipFromStreet: string;
    // shipFromCity: string;
    // shipFromStateCode: string;
    // shipFromPostalCode: string;
    // shipFromPostal?;
    owner: string;
    cost: string;
    poNotes : string;
    userId?: number;
    externalId?: string;
    hasPendingTransaction:boolean;
}
export class PurchaseOrderOrganization
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
  bank?: PurchaseOrderOrganizationBank;
}
export class PurchaseOrderOrganizationBank {
  bankName?: string;
  branchName?: string;
  usdAccount?: string;
  eurAccount?: string;
  swiftAccount?: string;
  routingNumber?: string;
}