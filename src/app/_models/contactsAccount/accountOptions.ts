import { List } from 'linqts';

export class AccountOptions {
    statuses:StatusList[];
    accountTypes: List<AccountType>;
    companyTypes:CompanyType[];
}


export class StatusList{
    public optionId:number;
    public optionName:string;
    public externalId: string;
}

export class AccountType{
    public accountTypeId:number;
    public accountTypeName:string;
    public checked:boolean;
    public statusName: string;
    public paymentTermName: string;
    public epdsId?:string;
    
}

export class CompanyType{
    public companyTypeId:number;
    public companyTypeName:string;
}

