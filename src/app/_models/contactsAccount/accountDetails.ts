
export class AccountDetails{
  public accountId:number;
  public number:string;
  public name:string;
  public statusId:number;
  public accountTypeIds:number[];
  public companyTypeId:number;
  public externalId:string;
  public statusExternalId:string;
  public currencyId: string;
  public currencyExternalId: string;
  public organizationId: number;
  public organizationExternalId: string;
  public accountHierarchyId: number;
  public SAPHierarchyID: string;
  public SAPGroupID: String;
  public creditLimit: string;
  public openBalance: string;
  public hierarchyName: string;
  public supplierRating: string;
  public email: string;
  public website: string;
  public yearEstablished: string;
  public numOfEmployees: number;
  public productFocus: string;
  public vendorNum: number;
  public carryStock: boolean;
  public minimumPO: number;
  public shippingInstructions: string;
  public qcNotes: string;
  public poNotes: string;
  public approvedVendor: boolean;
  public paymentTermId?: number;
  public incotermID: number;
  public DBNum: string;
  public shipFromRegionId: number;
}
