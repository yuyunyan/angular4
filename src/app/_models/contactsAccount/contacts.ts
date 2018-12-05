import { AccountType } from './accountOptions';
import { List } from 'linqts'; 

export class Contacts{
    firstName:string;
    lastName:string;
    phone:number;
    email:string;
    owner:string;
    title:string;
    accountId:number;
    contactId:number;
    isActive?: boolean;
    contactName?: string;
}

export class ListContact{
    firstName:string;
    lastName:string;
    phone:number;
    email:string;
    owners:string[];
    accountName:string;
    accountId:number;
    accountStatus:string;
    accountTypes: List<AccountType>;
    contactId: number;
}
