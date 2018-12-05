import { Locations } from './../../_models/contactsAccount/locations';

export class NewAccount{

    name:string;
    website:string;
    companyTypeId:number;
    organizationId:number;
    accountTypeIds:number[];
    location:Locations;
    contact:contact;
    statusId:number;
    currencyId:string;
}
export class contact
{
    firstName:string;
    lastName:string;
    title:string;
    note:string;
    fax:string;
    email:string;
    preferredContactMethodId:number;
    mobilePhone: string;
    officePhone: string;
} 
